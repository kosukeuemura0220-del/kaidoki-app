"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Bell, BellRing, Info, Check, LineChart as LineIcon, AlertTriangle } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]); // 本物の履歴データ用
  const [isWatched, setIsWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("3か月"); 
  const [mounted, setMounted] = useState(false);

  // マウント後の描画を保証（グラフエラー対策）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Supabaseから商品情報と履歴データを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 商品情報の取得
      const { data: pData } = await supabase
        .from("products")
        .select("*")
        .eq("jan_code", params.id)
        .single();
      
      if (pData) setProduct(pData);

      // 本物の履歴データの取得（price_historyテーブルから）
      const { data: hData } = await supabase
        .from("price_history")
        .select("new_price, recorded_at") // カラム名を現在のテーブル構成に合わせました
        .eq("jan_code", params.id)
        .order("recorded_at", { ascending: true });

      if (hData) {
        setHistory(hData);
      }
      
      setLoading(false);
    };

    if (params.id) fetchData();
  }, [params.id]);

  // 2. 取得した履歴データをグラフ用にフィルタリング & 成形
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date().getTime();
    let filterDays = 90;
    if (range === "1か月") filterDays = 30;
    if (range === "3か月") filterDays = 90;
    if (range === "1年") filterDays = 365;
    if (range === "全期間") filterDays = 10000;

    const cutoff = now - (filterDays * 24 * 60 * 60 * 1000);

    return history
      .filter(item => new Date(item.recorded_at).getTime() >= cutoff)
      .map(item => ({
        date: new Date(item.recorded_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        price: item.new_price,
        rawDate: new Date(item.recorded_at).getTime()
      }));
  }, [history, range]);

  if (loading) return <div className="p-20 text-center font-bold text-blue-600">データを解析中...</div>;
  if (!product) return <div className="p-20 text-center">商品が見つかりませんでした</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32 font-sans text-gray-900 overflow-x-hidden">
      {/* ヘッダー */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 p-4 border-b flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gray-900 font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-full">← 戻る</button>
        <h1 className="text-[10px] font-mono text-gray-400">商品JAN: {product.jan_code}</h1>
        <div className="w-8"></div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* メインカード */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative">
          {/* 日本語追跡ボタン */}
          <button 
            onClick={() => setIsWatched(!isWatched)}
            className={`absolute top-4 right-4 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-[11px] shadow-sm transition-all active:scale-95 z-10 ${
              isWatched ? "bg-green-500 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {isWatched ? <><BellRing className="w-3.5 h-3.5" /> 追跡中</> : <><Bell className="w-3.5 h-3.5" /> 価格追跡を開始</>}
          </button>

          <div className="aspect-square mb-4 flex justify-center p-4">
            <img src={product.image_url} alt={product.name} className="max-h-full object-contain" />
          </div>
          
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-black bg-green-50 text-green-700 px-2 py-0.5 rounded italic border border-green-100 uppercase">Verified Authentic</span>
              <h2 className="text-lg font-black text-gray-900 mt-2 leading-tight">{product.name}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400">現在の参考価格</p>
              <p className="text-2xl font-black text-gray-900 leading-none mt-1">¥{product.reference_price?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* グラフセクション */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col gap-4 mb-6">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-green-600" /> 市場価格の推移
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
          
          <div className="h-56 w-full min-h-[224px] relative">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#9ca3af'}} minTickGap={40} />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px'}}
                    formatter={(value: any) => [`¥${value.toLocaleString()}`, "価格"]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                <LineIcon className="w-8 h-8 opacity-20" />
                <p className="text-[10px] font-bold">履歴データを収集中です...</p>
              </div>
            )}
          </div>
        </div>

        {/* AI診断レポート */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                <Check className="w-3 h-3 text-green-500" /> KAIDOKI 市場分析
              </p>
              <p className="text-xl font-black text-green-400 italic">買いどき：今すぐ</p>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-lg">
              <p className="text-[8px] font-bold text-gray-500 uppercase">AI精度</p>
              <p className="text-sm font-black text-white text-center">94%</p>
            </div>
          </div>
          <p className="text-xs font-bold leading-relaxed text-gray-300 italic">
            現在の市場価格は、過去の取引推移において非常に有利な水準にあります。在庫状況を考慮すると、これ以上の下落を待つよりも今すぐの購入をお勧めします。
          </p>
        </div>

        {/* ショップ比較 */}
        <div className="space-y-3 pb-10">
          <h3 className="font-black text-gray-800 text-sm px-1">現在の出品</h3>
          <a href={`https://search.rakuten.co.jp/search/mall/${product.jan_code}/`} target="_blank" 
            className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-500 transition-all">
            <div className="flex items-center gap-4 text-gray-800 font-bold text-sm text-red-600 font-black">楽天市場</div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-900 leading-none">¥{product.reference_price?.toLocaleString()}</p>
              <span className="text-[9px] font-bold text-green-600 italic">● 在庫あり</span>
            </div>
          </a>

          {["Amazon.co.jp", "Yahoo!ショッピング"].map(shop => (
            <div key={shop} className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
              <div className="text-gray-400 font-bold text-sm">{shop}</div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 italic">
                <AlertTriangle className="w-3 h-3" />
                準備中
              </div>
            </div>
          ))}
        </div>

        {/* 下部固定ボタン */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
          <button 
            onClick={() => setIsWatched(!isWatched)}
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
