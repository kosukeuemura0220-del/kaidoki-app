"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-around items-center py-3 px-6 z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-blue-600' : 'text-gray-400'}`}>
        <Search size={24} />
        <span className="text-[10px] font-bold">さがす</span>
      </Link>
      
      {/* 修正ポイント: ウォッチリストは dashboard または watchlist ページを指すべきです */}
      <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
        <Bell size={24} />
        <span className="text-[10px] font-bold">ウォッチ</span>
      </Link>
      
      <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-blue-600' : 'text-gray-400'}`}>
        <User size={24} />
        <span className="text-[10px] font-bold">マイページ</span>
      </Link>
    </nav>
  );
}
