import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const RAKUTEN_APP_ID = process.env.NEXT_PUBLIC_RAKUTEN_APP_ID;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  if (!query) return NextResponse.json({ products: [] });

  try {
    // 1. DBから製品を10件取得
    const { data: dbItems } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .range(offset, offset + limit - 1);

    if (!dbItems || dbItems.length === 0) return NextResponse.json({ products: [] });

    // 2. 各製品のリアルタイム価格を取得
    const products = await Promise.all(dbItems.map(async (dbItem) => {
      // 日用品向けに「送料無料(postageFlag:1)」を条件に追加
      const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?format=json&keyword=${encodeURIComponent(dbItem.jan_code)}&applicationId=${RAKUTEN_APP_ID}&hits=1&sort=%2BitemPrice&availability=1&postageFlag=1`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.Items && data.Items.length > 0) {
        const it = data.Items[0].Item;
        return {
          name: dbItem.name,
          jan_code: dbItem.jan_code,
          image_url: it.mediumImageUrls[0].imageUrl.replace('?_ex=128x128', ''),
          reference_price: it.itemPrice,
          url: it.itemUrl
        };
      }
      return null;
    }));

    return NextResponse.json({ products: products.filter(p => p !== null) });
  } catch (err) {
    return NextResponse.json({ products: [] });
  }
}
