import os
import time
import requests
import re
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local を読み込む
load_dotenv(".env.local")

# Supabase設定
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 楽天API設定
RAKUTEN_APP_ID = os.getenv("NEXT_PUBLIC_RAKUTEN_APP_ID")

def clean_brand_name(text):
    """楽天の商品名からブランド名を抽出してクリーンアップ"""
    if not text: return "その他"
    # 不要な装飾やキャンペーン文言を徹底除去
    text = re.sub(r'【.*?】|［.*?］|\[.*?\]|（.*?）', '', text)
    text = re.sub(r'\d+日.*ポイント\d+倍！?|ポイント\d+倍', '', text)
    text = re.sub(r'送料無料|公式|正規品|中古|新品|あす楽', '', text, flags=re.IGNORECASE)
    
    words = text.strip().split()
    if words:
        # 最初の単語をブランド名として採用し、記号を削る
        brand = words[0].split('/')[0].split('｜')[0].split(':')[0]
        return brand[:15] # 長すぎ防止
    return "その他"

def get_product_info_from_rakuten(jan_code):
    """JANコードを使って楽天から画像と名前（ブランド推着用）を取得"""
    url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601"
    params = {
        "applicationId": RAKUTEN_APP_ID,
        "keyword": jan_code,
        "hits": 1,
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code != 200: return None
        data = response.json()
        if "Items" in data and len(data["Items"]) > 0:
            item = data["Items"][0]["Item"]
            return {
                "image_url": item.get("mediumImageUrls")[0]["imageUrl"] if item.get("mediumImageUrls") else None,
                "brand": clean_brand_name(item.get("itemName", ""))
            }
    except:
        pass
    return None

def main():
    if not RAKUTEN_APP_ID:
        print("❌ 楽天APP_IDが設定されていません。")
        return

    print("🚀 ブランド・画像補完ロボットを起動します（価格更新はスキップ）")
    
    offset = 0
    limit = 100
    
    while True:
        # ブランドまたは画像が空(NULL)のデータを優先的に取得
        # .or() を使って効率化
        response = supabase.table("products")\
            .select("*")\
            .or_("brand.is.null,image_url.is.null")\
            .order("id")\
            .range(offset, offset + limit - 1)\
            .execute()
        
        products = response.data
        if not products:
            print("🎉 補完が必要なデータはすべて完了しました！")
            break

        print(f"📦 {len(products)}件の未完成データを処理中...")

        for product in products:
            jan = product["jan_code"]
            if jan and len(jan) == 13 and jan.isdigit():
                print(f"🔍 JAN: {jan} の情報を取得中...")
                info = get_product_info_from_rakuten(jan)
                
                if info:
                    print(f"   ✅ 抽出結果: [{info['brand']}] 画像URL確保")
                    try:
                        supabase.table("products").update({
                            "brand": info["brand"],
                            "image_url": info["image_url"]
                        }).eq("id", product["id"]).execute()
                    except Exception as e:
                        print(f"   ❌ DB更新エラー: {e}")
                
                # API負荷軽減
                time.sleep(0.6)
            else:
                print(f"   ⚠️ 無効なJANコードです: {jan}")

        # NULLを埋めているので、offsetを増やさず常に0から取れば
        # 「まだ埋まっていないもの」が次々と手に入ります
        # ただし、万が一埋まらなかった時のために少しずつ進めます
        offset += limit
        time.sleep(1)

if __name__ == "__main__":
    main()
    