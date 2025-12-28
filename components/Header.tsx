
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-black tracking-tighter text-gray-900 leading-none">KAIDOKI AI</h1>
            <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase italic">by NeuroPay</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
          <span className="text-xs font-bold text-amber-700">PRO</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
