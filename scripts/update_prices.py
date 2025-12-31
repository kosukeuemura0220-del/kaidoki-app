import os
import time
import requests
from supabase import create_client, Client

# 環境変数の読み込み
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
RAKUTEN_APP_ID = os.environ.get("RAKUTEN_APP_ID")

def get_price(jan):
    url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    params = {"applicationId": RAKUTEN_APP_ID, "keyword": jan, "sort": "+itemPrice", "hits": 1}
    try:
        res = requests.get(url, params=params)
        data = res.json()
        if "Items" in data and len(data["Items"]) > 0:
            return data["Items"][0]["Item"]["itemPrice"]
    except: pass
    return None

def main():
    # まだ new_price が埋まっていないものを優先的に取得 (効率化)
    print("📥 未更新の商品を抽出中...")
    response = supabase.table("products").select("id, jan_code")\
        .is_("new_price", "null")\
        .limit(1000)\
        .execute()
    
    products = response.data
    if not products:
        print("✅ すべての new_price が埋まっています。全件更新に切り替えます。")
        response = supabase.table("products").select("id, jan_code").limit(500).execute()
        products = response.data

    print(f"🔄 {len(products)} 件の処理を開始します...")

    for i, p in enumerate(products):
        jan = p.get("jan_code")
        if not jan or len(jan) < 10: continue

        price = get_price(jan)
        if price:
            try:
                # --- ここで1件ずつ確実にDBへ書き込む ---
                # 1. 表紙(products)を更新
                supabase.table("products").update({"new_price": price}).eq("id", p["id"]).execute()
                
                # 2. 履歴(price_history)に挿入
                supabase.table("price_history").insert({"jan_code": jan, "new_price": price}).execute()
                
                print(f"[{i+1}] ✅ {jan}: {price}円 を反映しました")
            except Exception as e:
                print(f"[{i+1}] ❌ DB書き込み失敗: {e}")
        
        time.sleep(0.5) # 楽天APIへの配慮

if __name__ == "__main__":
    main()
    