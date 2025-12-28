export type JudgmentStatus = 'BUY' | 'WATCH' | 'WAIT';

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  originalPrice: number;
  imageUrl: string;
  url: string;          // 👈 これを追加しました！
  priceHistory: PricePoint[];
}

export interface AIAnalysis {
  status: JudgmentStatus;
  reason: string;
  prediction?: string;
}

export type UserPlan = 'FREE' | 'PRO';

export interface UserProfile {
  name: string;
  plan: UserPlan;
  watchedProductIds: string[];
}
