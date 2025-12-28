"use client";

import React from 'react';
import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const menuItems = [
    { icon: Settings, label: '設定', sub: '通知・アカウント' },
    { icon: CreditCard, label: 'プラン管理', sub: 'Free Plan' },
    { icon: HelpCircle, label: 'ヘルプ・サポート', sub: '' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* プロフィールヘッダー */}
      <div className="bg-white p-8 pb-12 rounded-b-[2rem] shadow-sm text-center mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg">
          <User size={48} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">ゲストユーザー</h1>
        <p className="text-sm text-gray-500">guest@kaidoki.app</p>
      </div>

      {/* メニューリスト */}
      <div className="px-4 space-y-3">
        {menuItems.map((item, index) => (
          <button key={index} className="w-full bg-white p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-gray-900">{item.label}</div>
                {item.sub && <div className="text-xs text-gray-400">{item.sub}</div>}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}

        <button className="w-full p-4 mt-6 flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={16} />
          ログアウト
        </button>
      </div>
    </div>
  );
}
