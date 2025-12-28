
import { supabase } from '../lib/supabase';

const RAKUTEN_APP_ID = '1004962231739756769';
const BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706';

export interface RakutenItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  mediumImageUrls: string[];
  shopName: string;
  affiliateUrl?: string;
}

/**
 * 楽天APIで検索し、DBと同期する
 */
export const searchAndSyncItems = async (keyword: string): Promise<RakutenItem[]> => {
  if (!keyword) return [];
  
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    keyword: keyword,
    format: 'json',
    hits: '20',
    imageFlag: '1',
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Rakuten API error');
    
    const data = await response.json();
    if (!data.Items) return [];

    const items: RakutenItem[] = data.Items.map((item: any) => ({
      itemId: item.Item.itemCode,
      itemName: item.Item.itemName,
      itemPrice: item.Item.itemPrice,
      itemUrl: item.Item.itemUrl,
      mediumImageUrls: item.Item.mediumImageUrls.map((img: any) => img.imageUrl),
      shopName: item.Item.shopName,
      affiliateUrl: item.Item.affiliateUrl
    }));

    // 非同期でDBに保存（検索結果の返却を優先するためエラーハンドリングのみ）
    syncWithSupabase(items).catch(console.error);

    return items;
  } catch (error) {
    console.error('Search Error:', error);
    return [];
  }
};

/**
 * Supabaseに商品情報と価格ログを保存
 */
const syncWithSupabase = async (items: RakutenItem[]) => {
  for (const item of items) {
    // 1. 商品情報をUpsert
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('item_code', item.itemId)
      .single();

    const minPrice = existingProduct ? Math.min(existingProduct.min_price, item.itemPrice) : item.itemPrice;
    const maxPrice = existingProduct ? Math.max(existingProduct.max_price, item.itemPrice) : item.itemPrice;

    await supabase.from('products').upsert({
      item_code: item.itemId,
      name: item.itemName,
      image_url: item.mediumImageUrls[0],
      url: item.itemUrl,
      min_price: minPrice,
      max_price: maxPrice,
      last_updated: new Date().toISOString()
    });

    // 2. 本日の価格をログに記録
    await supabase.from('price_logs').upsert({
      item_code: item.itemId,
      price: item.itemPrice,
      date: new Date().toISOString().split('T')[0]
    }, { onConflict: 'item_code,date' });
  }
};

/**
 * DBから特定商品の価格履歴を取得
 */
export const getPriceHistoryFromDb = async (itemCode: string) => {
  const { data, error } = await supabase
    .from('price_logs')
    .select('date, price')
    .eq('item_code', itemCode)
    .order('date', { ascending: true });
    
  if (error) return [];
  return data.map(d => ({
    date: d.date.split('-').slice(1).join('/'), // YYYY-MM-DD -> MM/DD
    price: d.price
  }));
};

/**
 * Yahoo!ショッピングの検索URLを生成（他店比較用）
 */
export const getYahooSearchUrl = (productName: string): string => {
  // TODO: ValueCommerce等のアフィリエイトリンク変換ロジックをここに実装
  const baseUrl = 'https://shopping.yahoo.co.jp/search';
  const params = new URLSearchParams({
    first: '1',
    p: productName
  });
  return `${baseUrl}?${params.toString()}`;
};
