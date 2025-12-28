import React from 'react';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { AIAnalysis } from '../types';

interface JudgmentCardProps {
  analysis: AIAnalysis;
}

export default function JudgmentCard({ analysis }: JudgmentCardProps) {
  const { status, reason, prediction } = analysis;

  // ステータスに応じたデザイン設定（よりポップな配色に変更）
  const statusConfig = {
    BUY: {
      label: '今が買い時！',
      icon: CheckCircle,
      // 赤系グラデーション
      bgGradient: 'bg-gradient-to-br from-red-500 to-pink-600',
      shadow: 'shadow-red-200',
      textColor: 'text-white'
    },
    WATCH: {
      label: '様子見',
      icon: AlertCircle,
      // 黄色系グラデーション
      bgGradient: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      shadow: 'shadow-yellow-200',
      textColor: 'text-white'
    },
    WAIT: {
      label: 'まだ待ち',
      icon: Clock,
      // 青系グラデーション
      bgGradient: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-200',
      textColor: 'text-white'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-[2rem] p-6 ${config.bgGradient} ${config.textColor} shadow-xl ${config.shadow} relative overflow-hidden`}>
      {/* 背景のキラキラ装飾（CSSで描画） */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/20">
        <Icon size={100} strokeWidth={1.5} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Icon size={32} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold opacity-80 mb-0.5">AI判定結果</p>
            <h3 className="text-2xl font-extrabold tracking-tight">
              {config.label}
            </h3>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-3 font-bold leading-relaxed text-sm">
          {reason}
        </div>

        {prediction && (
          <div className="flex items-center gap-2 text-xs font-bold bg-black/10 rounded-full px-3 py-1.5 w-fit">
            <TrendingUp size={14} />
            <span>{prediction}</span>
          </div>
        )}
      </div>
    </div>
  );
}
