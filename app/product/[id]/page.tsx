"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Bell, BellRing, LineChart as LineIcon, Check, ExternalLink, ShoppingCart, Lock } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("3か月"); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleWatch = async () => {
    if (isWatched) {
      const { error } = await supabase.from("favorites").delete().eq("jan_code", params.id);
      if (!error) setIsWatched(false);
    } else {
      const { error } = await supabase.from("favorites").insert([{ jan_code: params.id }]);
      if (!error) setIsWatched(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: pData } = await supabase.from("products").select("*").eq("jan_code", params.id).single();
      if (pData) setProduct(pData);

      const { data: hData } = await supabase.from("price_history").select("new_price, recorded_at").eq("jan_code", params.id).order("recorded_at", { ascending: true });
      if (hData) setHistory(hData);

      const { data: fData } = await supabase.from("favorites").select("*").eq("jan_code", params.id);
      if (fData && fData.length > 0) setIsWatched(true);
      setLoading(false);
    };
    if (params.id) fetchData();
  }, [params.id]);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    const now = new Date().getTime();
    let filterDays = 90;
    if (range === "1か月") filterDays = 30;
    if (range === "1年") filterDays = 365;
    if (range === "全期間") filterDays = 10000;
    const cutoff = now - (filterDays * 24 * 60 * 60 * 1000);

    return history
      .filter(item => new Date(item.recorded_at).getTime() >= cutoff)
      .map(item => ({
        date: new Date(item.recorded_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        price: item.new_price,
        fullDate: new Date(item.recorded_at).toLocaleDateString('ja-JP')
      }));
  }, [history, range]);

  // ★ここが購入リンクを表示するロジックです
  const shopList = useMemo(() => {
    if (!product) return [];
    return [
      {
        name: "楽天市場",
        isReady: true, // 公開中
        price: product.reference_price,
        url: `https://search.rakuten.co.jp/search/mall/${product.jan_code}/`,
        color: "bg-[#BF0000]",
        subText: "ポイント還元あり"
      },
      {
        name: "Amazon",
        isReady: false, // 準備中
        price: null,
        url: "",
        color: "bg-[#232F3E]",
        subText: "公式連携 準備中"
      },
      {
        name: "Yahoo!",
        isReady: false, // 準備中
        price: null,
        url: "",
        color: "bg-[#FF0033]",
        subText: "公式連携 準備中"
      }
    ];
  }, [product]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">読み込み中...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">商品が見つかりません</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-40 font-sans text-gray-900">
      {/* ヘッダー */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 p-4 border-b flex items-center justify-between">
        <button onClick={() => router.back()} className="font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-full">← 戻る</button>
        <h1 className="text-[10px] font-mono text-gray-400">JAN: {product.jan_code}</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* メインカード */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative">
          <button 
            onClick={toggleWatch}
            className={`absolute top-4 right-4 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-[11px] transition-all active:scale-95 z-10 ${
              isWatched ? "bg-green-500 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-100"
            }`}
          >
            {isWatched ? <><BellRing className="w-3.5 h-3.5" /> 追跡中</> : <><Bell className="w-3.5 h-3.5" /> 価格追跡を開始</>}
          </button>

          <div className="aspect-square mb-4 flex justify-center p-4">
            <img src={product.image_url} alt={product.name} className="max-h-full object-contain" />
          </div>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 pr-2">
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded italic border border-blue-100 uppercase">Authentic</span>
              <h2 className="text-lg font-black text-gray-900 mt-2 leading-tight tracking-tight">{product.name}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400">現在の参考価格</p>
              <p className="text-2xl font-black text-gray-900">¥{product.reference_price?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-green-600" /> 価格推移 (自動更新中)
            </h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {["1か月", "3か月", "1年", "全期間"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-56 w-full min-h-[224px]">
            {mounted ? (
              chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af'}} minTickGap={30} />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px'}}
                      formatter={(value: any) => [`¥${value.toLocaleString()}`, "価格"]}
                      labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    />
                    <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <LineIcon className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] font-bold">データ収集中... 明日更新されます</p>
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* AI診断レポート */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                <Check className="w-3 h-3 text-green-500" /> KAIDOKI AI分析
              </p>
              <p className="text-xl font-black text-green-400 italic">買い時：判定中</p>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 uppercase">AI精度</p>
              <p className="text-sm font-black text-white text-center">--%</p>
            </div>
          </div>
          <p className="text-xs font-bold leading-relaxed text-gray-300 italic">
            現在、価格データを収集中です。データが蓄積されると、より正確な「買い時」判定が表示されます。
          </p>
        </div>

        {/* ★ここに購入リンク（楽天・Amazon・Yahoo）が表示されます */}
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-black text-gray-800 px-2 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" /> 購入オプション
          </h3>
          
          {shopList.map((shop) => (
            shop.isReady ? (
              // 準備完了（楽天など）
              <a 
                key={shop.name} 
                href={shop.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all hover:border-blue-300"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${shop.color} rounded-lg flex items-center justify-center text-white font-black text-[8px] shadow-sm`}>
                    {shop.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{shop.name}</p>
                      <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">最安値</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{shop.subText}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-gray-900">¥{shop.price?.toLocaleString()}</p>
                  <span className="text-[9px] font-bold text-green-600 italic">● 在庫あり</span>
                </div>
              </a>
            ) : (
              // 準備中（Amazon, Yahoo）
              <div key={shop.name} className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-white font-black text-[8px]`}>
                    {shop.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500">{shop.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{shop.subText}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 italic bg-gray-200 px-2 py-1 rounded-md">
                  <Lock className="w-3 h-3" />
                  近日公開
                </div>
              </div>
            )
          ))}
        </div>

        {/* 固定ボタン */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <button 
            onClick={toggleWatch}
            className={`w-full py-4 rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isWatched ? "bg-green-500 text-white shadow-green-100" : "bg-blue-600 text-white"
            }`}
          >
            {isWatched ? <><BellRing className="w-5 h-5" /> 追跡を解除する</> : <><Bell className="w-5 h-5" /> 価格の追跡を開始する</>}
          </button>
        </div>
      </div>
    </div>
  );
}
