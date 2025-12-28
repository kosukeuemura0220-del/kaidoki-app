"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatName = (name: string) => {
  if (!name) return "";
  return name
    .replace(/【.*?】|\[.*?\]|（.*?）|\(.*?\)|★.*?★/g, "")
    .replace(/送料無料|あす楽|ポイント\d+倍|期間限定/g, "")
    .trim();
};

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const quickBrands = ["Apple", "Sony", "Nintendo", "Dyson", "花王", "P&G", "ライオン"];
  const quickCategories = [
    { label: "洗剤・柔軟剤", query: "洗剤" },
    { label: "スマホ・タブレット", query: "スマホ" },
    { label: "生活家電", query: "家電" },
    { label: "PC周辺機器", query: "PC" },
    { label: "美容・ヘアケア", query: "ヘアケア" }
  ];

  const searchProducts = async (query: string, type: "name" | "brand" | "category" = "name") => {
    setLoading(true);
    let supabaseQuery = supabase.from("products").select("*");

    if (type === "brand") {
      supabaseQuery = supabaseQuery.eq("brand", query);
    } else if (type === "category") {
      supabaseQuery = supabaseQuery.or(`category.ilike.%${query}%,name.ilike.%${query}%`);
    } else {
      supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
    }

    const { data } = await supabaseQuery.limit(100).order("id", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    searchProducts("洗剤", "category");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl font-black text-blue-600 mb-4 tracking-tighter">KAIDOKI AI</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="商品名やJANコードで検索..."
              className="flex-1 p-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchProducts(searchTerm)}
            />
            <button
              onClick={() => searchProducts(searchTerm)}
              className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm active:scale-95 transition"
            >
              検索
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 md:p-4">
        <section className="mb-6">
          <h2 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Brand</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => {setSearchTerm(""); searchProducts(brand, "brand")}}
                className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold"
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Category</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => {setSearchTerm(""); searchProducts(cat.query, "category")}}
                className="bg-white border border-gray-100 shadow-sm p-3 rounded-xl text-xs font-bold text-left flex justify-between items-center"
              >
                {cat.label}
                <span className="text-blue-300">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* 修正ポイント：grid-cols-2 に固定し、max-w-2xl で広がりすぎを防止 */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : products.length > 0 ? (
            products.map((p) => (
              <Link 
                href={`/product/${p.jan_code}`} 
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 flex flex-col"
              >
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  <img
                    src={p.image_url || "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image"}
                    alt={p.name}
                    className="object-cover w-full h-full"
                  />
                  {p.brand && p.brand !== "その他" && (
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur text-gray-800 text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                      {p.brand}
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-[9px] text-blue-500 font-bold mb-1 uppercase truncate">{p.category}</p>
                  <h3 className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 h-8 mb-2">
                    {formatName(p.name)}
                  </h3>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[10px] font-bold text-red-600">¥</span>
                      <p className="text-lg font-black text-red-600 tracking-tight">
                        {p.reference_price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-[8px] text-gray-400 font-mono">JAN:{p.jan_code}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400 text-sm">該当する商品がありません</div>
          )}
        </div>
      </div>
    </div>
  );
}
