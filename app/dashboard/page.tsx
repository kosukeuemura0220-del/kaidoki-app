"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { BellRing, ArrowRight, TrendingDown, AlertTriangle } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);

      // 1. favoritesテーブルから登録済みのJANコードを取得
      const { data: favData, error: favError } = await supabase
        .from("favorites")
        .select("jan_code");

      if (favError || !favData || favData.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // 取得したJANコードのリストを作成
      const janCodes = favData.map((item) => item.jan_code);

      // 2. そのJANコードの商品情報をproductsテーブルから一括取得
      const { data: productData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .in("jan_code", janCodes);

      if (productData) {
        setFavorites(productData);
      }
      
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 font-sans text-gray-900">
      {/* ヘッダー */}
      <div className="bg-white sticky top-0 z-30 px-6 py-5 border-b flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          <BellRing className="w-5 h-5 text-blue-600" />
          ウォッチリスト
        </h1>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {favorites.length}件
        </span>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold text-sm">読み込み中...</div>
        ) : favorites.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-dashed border-gray-300 text-center">
            <BellRing className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold text-sm mb-2">監視中の商品はありません</p>
            <p className="text-xs text-gray-400">商品ページの「追跡する」ボタンを押すと<br/>ここに表示されます</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {favorites.map((product) => (
              <Link href={`/product/${product.jan_code}`} key={product.id}>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 p-2">
                    <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">
                        {product.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold">現在価格</p>
                        <p className="text-lg font-black text-gray-900">¥{product.reference_price?.toLocaleString()}</p>
                      </div>
                      
                      {/* 簡易的な状態バッジ（ダミーロジック） */}
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-[10px] font-black">追跡中</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-gray-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
