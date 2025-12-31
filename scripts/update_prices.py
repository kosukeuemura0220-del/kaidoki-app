import os
import time
import requests
from supabase import create_client, Client

# =========================
# 環境変数
# =========================
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")  # service role key を想定
RAKUTEN_APP_ID = os.environ.get("RAKUTEN_APP_ID")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ SUPABASE_URL / SUPABASE_KEY が環境変数にありません（GitHub Secrets を確認）")
if not RAKUTEN_APP_ID:
    raise RuntimeError("❌ RAKUTEN_APP_ID が環境変数にありません（GitHub Secrets を確認）")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================
# 共通：Supabase結果チェック
# =========================
def ensure_ok(resp, label: str):
    """
    supabase-py は失敗しても例外を投げないことがあるので、
    resp.error を見て、失敗理由を必ず表示する。
    """
    err = getattr(resp, "error", None)
    if err:
        # err は dict っぽいことが多い
        print(f"❌ {label} 失敗: {err}")
        return False
    return True

# =========================
# 楽天API：JANから最安値を取る
# =========================
def get_price(jan: str):
    url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    params = {
        "applicationId": RAKUTEN_APP_ID,
        "keyword": jan,
        "sort": "+itemPrice",
        "hits": 1,
    }

    try:
        res = requests.get(url, params=params, timeout=15)
        res.raise_for_status()
        data = res.json()

        items = data.get("Items", [])
        if items:
            price = items[0]["Item"].get("itemPrice")
            if isinstance(price, int) and price > 0:
                return price

        return None

    except Exception as e:
        print(f"⚠️ 楽天API失敗 jan={jan}: {e}")
        return None

# =========================
# メイン
# =========================
def main():
    print("📥 未更新の商品を抽出中...")

    # まず「new_price が null」のものを優先して拾う
    resp = (
        supabase.table("products")
        .select("id, jan_code")
        .is_("new_price", "null")
        .limit(1000)
        .execute()
    )

    if not ensure_ok(resp, "products select (new_price is null)"):
        print("❌ products の抽出に失敗。キーやRLS、テーブル名を確認してください。")
        return

    products = resp.data or []

    # もし全部埋まっていたら、全件更新（少なめ）に切り替え
    if not products:
        print("✅ すべての new_price が埋まっています。全件更新（先頭500件）に切り替えます。")
        resp2 = supabase.table("products").select("id, jan_code").limit(500).execute()
        if not ensure_ok(resp2, "products select (fallback)"):
            return
        products = resp2.data or []

    print(f"🔄 {len(products)} 件の処理を開始します...")

    updated_count = 0
    history_count = 0
    failed_count = 0

    for i, p in enumerate(products, start=1):
        jan = (p.get("jan_code") or "").strip()

        # JANが無い/短いのはスキップ
        if not jan or len(jan) < 10:
            continue

        price = get_price(jan)
        if not price:
            continue

        # 1) products を更新
        r1 = (
            supabase.table("products")
            .update({"new_price": price})
            .eq("id", p["id"])
            .execute()
        )
        ok1 = ensure_ok(r1, f"products update (id={p['id']}, jan={jan})")

        # 2) price_history に履歴を入れる
        r2 = (
            supabase.table("price_history")
            .insert({"jan_code": jan, "new_price": price})
            .execute()
        )
        ok2 = ensure_ok(r2, f"price_history insert (jan={jan})")

        if ok1:
            updated_count += 1
        if ok2:
            history_count += 1
        if not (ok1 and ok2):
            failed_count += 1

        print(f"[{i}] ✅ jan={jan} price={price} / products={'OK' if ok1 else 'NG'} history={'OK' if ok2 else 'NG'}")

        # 楽天API負荷対策
        time.sleep(0.5)

    print("========== 結果 ==========")
    print(f"✅ products 更新成功: {updated_count}")
    print(f"✅ price_history 追加成功: {history_count}")
    print(f"❌ 失敗件数: {failed_count}")
    print("==========================")

if __name__ == "__main__":
    main()

