"use client";
import React from 'react';
import { useWatchList } from '../context/WatchListContext';
import { Trash2, ShoppingBag, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { watchList, removeFromWatchList } = useWatchList();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-white px-6 pt-12 pb-6 flex items-center justify-between shadow-sm sticky top-0 z-10 border-b">
        <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tighter uppercase"><Zap size={20} className="text-blue-600 fill-blue-600" /> KAIDOKI</h1>
        <Link href="/" className="p-2 bg-gray-100 rounded-full text-gray-400"><ArrowLeft size={20} /></Link>
      </div>
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">ウォッチリスト ({watchList.length})</h2>
        {watchList.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border shadow-sm mt-4">
            <p className="text-gray-400 font-bold mb-6 text-sm">監視中の商品はありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {watchList.map((product: any, index: number) => {
              // エラーを完全に防ぐガードコード
              const safePrice = Number(product.price || product.new_price || product.currentPrice || 0);
              return (
                <div key={index} className="bg-white rounded-[2.5rem] p-4 shadow-sm border flex gap-4 items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl shrink-0 p-2 flex items-center justify-center">
                    <img src={product.image || product.imageUrl} className="max-w-full max-h-full object-contain mix-blend-multiply" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] font-bold text-gray-800 mb-2 line-clamp-2 leading-snug h-8">{product.name}</h3>
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col"><span className="text-red-600 font-black text-lg">¥{safePrice.toLocaleString()}</span></div>
                      <div className="flex gap-2">
                        <button onClick={() => removeFromWatchList(product.name)} className="w-9 h-9 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center hover:text-red-500 border border-gray-100"><Trash2 size={14} /></button>
                        <a href={product.url} target="_blank" className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg"><ShoppingBag size={14} /></a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
