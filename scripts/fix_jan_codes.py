import os
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local を読み込む
load_dotenv(".env.local")

# Supabase設定
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Yahoo!のアプリケーションID
YAHOO_APP_ID = os.getenv("NEXT_PUBLIC_YAHOO_APP_ID")

# ★ ジャンルごとの検索キーワードリスト
# --- 残り1300件を確実に埋めるための追加リスト ---
TARGET_KEYWORDS = [
    # 💻 PC・周辺機器（ブランド指名）
    "エレコム マウスパッド", "バッファロー 外付けSSD", "サンワサプライ クリーナー",
    "DELL モニター", "HP ノートパソコン", "ブラザー プリンター 複合機",
    "ノートPC 電源アダプタ", "ノートPC 冷却台", "USBハブ 7ポート",

    # 🍳 キッチン家電・雑貨（人気ブランド）
    "ブルーノ ホットサンドメーカー", "アラジン グラファイトトースター",
    "バルミューダ ザ・ポット", "ル・クルーゼ 鍋", "ストウブ ピコ・ココット",
    "オクソー キッチンツール", "ボダム フレンチプレス", "ハリオ コーヒーミル",

    # 💄 美容・コスメ（ドラッグストア定番）
    "ちふれ 化粧水", "なめらか本舗 豆乳イソフラボン", "キュレル 潤浸保湿",
    "ミノン アミノモイスト", "肌ラボ 極潤", "メラノCC 美容液",
    "ウーノ ホイップウォッシュ", "メンズケシミン", "サクセス シャンプー",

    # 📦 日用品・掃除・洗濯（プロ仕様・便利グッズ）
    "激落ちくん メラミンスポンジ", "ウタマロクリーナー", "オキシクリーン 1.5kg",
    "スコッチブライト スポンジ", "サッサ お掃除クロス", "ブルーレット 置くだけ",
    "アリエール ジェルボール 詰め替え", "ボールド ジェルボール",
    "レノア ハピネス 柔軟剤", "ハミング 消臭実感",

    # 🧸 ホビー・その他
    "トミカ ギフトセット", "シルバニアファミリー セット", "リカちゃん 人形",
    "プラレール レールセット", "ジグソーパズル 1000ピース",
    "万年筆 パイロット カクノ", "ぺんてる シャープペン オレンズ",
    "三菱鉛筆 クルトガ ダイブ", "コクヨ ドットライナー 詰め替え",
]


# 1つのキーワードにつき何件取得するか（多く取りたい場合は100などに増やす）
FETCH_LIMIT_PER_KEYWORD = 50 

def search_yahoo_and_save(keyword):
    print(f"🔎 キーワード「{keyword}」の商品を探しています...")
    
    url = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch"
    
    start = 1
    total_saved = 0
    
    while total_saved < FETCH_LIMIT_PER_KEYWORD:
        params = {
            "appid": YAHOO_APP_ID,
            "query": keyword,
            "results": 50, # 一度に取得する件数
            "start": start,
            "sort": "-score", # おすすめ順（売れ筋が出やすい）
        }

        try:
            response = requests.get(url, params=params)
            
            if response.status_code == 429:
                print("   ⏳ API制限中... 5秒休憩")
                time.sleep(5)
                continue

            if response.status_code != 200:
                print(f"   ❌ APIエラー: {response.status_code}")
                break

            data = response.json()
            hits = data.get("hits", [])
            
            if not hits:
                print("   ⚠️ これ以上商品が見つかりません")
                break

            for item in hits:
                # JANコードがない商品はスキップ
                jan_code = item.get("janCode")
                if not jan_code:
                    continue
                
                # 商品情報の作成
                new_product = {
                    "name": item.get("name"),
                    "jan_code": jan_code,
                    # 必要であれば価格や画像URLもここで保存できます
                    # "image_url": item.get("image", {}).get("medium"),
                }

                try:
                    # JANコードをキーにして保存（重複したら無視）
                    supabase.table("products").upsert(new_product, on_conflict="jan_code").execute()
                    total_saved += 1
                except Exception:
                    pass
            
            print(f"   📦 {total_saved}件 保存完了...")
            
            # 取得件数が足りていれば終了
            if len(hits) < 50:
                break
                
            start += 50
            time.sleep(1) # APIへの配慮

        except Exception as e:
            print(f"   ❌ エラー発生: {e}")
            break

def run_importer():
    if not YAHOO_APP_ID:
        print("❌ エラー: Yahoo App IDが設定されていません")
        return

    print("🚀 ジャンル特化型 商品収集ロボットを起動します")
    print(f"📝 ターゲットキーワード数: {len(TARGET_KEYWORDS)}個")
    
    for i, keyword in enumerate(TARGET_KEYWORDS):
        print(f"\n--- [{i+1}/{len(TARGET_KEYWORDS)}] ---")
        search_yahoo_and_save(keyword)
        time.sleep(2)

    print("\n🎉 すべての収集が完了しました！")

if __name__ == "__main__":
    run_importer()
