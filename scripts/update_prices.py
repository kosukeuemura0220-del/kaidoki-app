import os
import requests
from supabase import create_client

# 接続設定
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# 楽天APIの設定（ここに取得したIDを貼る）
RAKUTEN_APP_ID = "1040435581920638104"

def fetch_rakuten_price(jan):
    """JANコードから楽天の最安値を引く"""
    api_url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706"
    params = {
        "format": "json",
        "keyword": jan,
        "applicationId": RAKUTEN_APP_ID,
        "sort": "+itemPrice", # 価格の安い順
        "hits": 1
    }
    
    try:
        response = requests.get(api_url, params=params)
        data = response.json()
        if data.get("Items"):
            # 最安値を取得
            return data["Items"][0]["Item"]["itemPrice"]
    except Exception as e:
        print(f"Error fetching {jan}: {e}")
    return None

def update_all_prices():
    # 1. productsから全JANコード取得
    products = supabase.table("products").select("jan_code").execute()
    
    for item in products.data:
        jan = item['jan_code']
        print(f"調査中: {jan}")
        
        latest_price = fetch_rakuten_price(jan)
        
        if latest_price:
            # 2. price_history に保存 (テーブルのカラム名 new_price に合わせています)
            supabase.table("price_history").insert({
                "jan_code": jan,
                "new_price": latest_price,
            }).execute()
            
            # 3. products の今の価格を更新
            supabase.table("products").update({
                "reference_price": latest_price
            }).eq("jan_code", jan).execute()
            
            print(f"成功: {jan} -> ¥{latest_price}")

if __name__ == "__main__":
    update_all_prices()
