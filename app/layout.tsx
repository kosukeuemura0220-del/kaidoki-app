import React from 'react';
import './globals.css';
import BottomNav from '../components/BottomNav';
// パスに注意：appフォルダの直下にcontextフォルダがある場合は以下になります
import { WatchListProvider } from './context/WatchListContext'; 

export const metadata = {
  title: 'KAIDOKI AI',
  description: '賢くお買い物',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-100 text-gray-900 antialiased min-h-screen flex justify-center">
        {/* モバイルアプリのような外観にするための外枠 */}
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative">
          
          {/* WatchListProviderで囲むことで、アプリ全体でウォッチリストが共有されます */}
          <WatchListProvider>
            <main className="pb-24">
              {children}
            </main>
            <BottomNav />
          </WatchListProvider>
          
        </div>
      </body>
    </html>
  );
}
