
import { Product } from './types';

export const CATEGORIES = [
  { id: 'all', name: 'すべて', icon: '✨' },
  { id: 'electronics', name: '家電', icon: '🔌' },
  { id: 'gadget', name: 'ガジェット', icon: '📱' },
  { id: 'daily', name: '日用品', icon: '🧼' },
  { id: 'cosme', name: 'コスメ', icon: '💄' },
];

const generatePriceHistory = (basePrice: number, days: number, trend: 'up' | 'down' | 'volatile') => {
  const history = [];
  let currentPrice = basePrice;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    if (trend === 'up') currentPrice += Math.random() * 500;
    else if (trend === 'down') currentPrice -= Math.random() * 500;
    else currentPrice += (Math.random() - 0.5) * 1000;

    history.push({ date: dateStr, price: Math.floor(currentPrice) });
  }
  return history;
};

// Fix: Correct the type definition of MOCK_PRODUCTS to an array by adding [] to the type intersection.
export const MOCK_PRODUCTS: (Product & { badge?: string; ranking?: number; watchers?: number })[] = [
  {
    id: '1',
    name: '最新ワイヤレスイヤホン AirFlow Pro',
    category: 'gadget',
    currentPrice: 28800,
    originalPrice: 34800,
    imageUrl: 'https://picsum.photos/seed/earbuds/400/400',
    priceHistory: generatePriceHistory(32000, 30, 'down'),
    badge: '🔥 過去最安値',
    watchers: 1204,
  },
  {
    id: '2',
    name: '高性能スチームアイロン SmoothDry',
    category: 'electronics',
    currentPrice: 12500,
    originalPrice: 12000,
    imageUrl: 'https://picsum.photos/seed/iron/400/400',
    priceHistory: generatePriceHistory(11500, 30, 'up'),
    badge: '📈 値上がり中',
    watchers: 450,
  },
  {
    id: '3',
    name: '高級オーガニックシャンプー 500ml',
    category: 'cosme',
    currentPrice: 3200,
    originalPrice: 3200,
    imageUrl: 'https://picsum.photos/seed/shampoo/400/400',
    priceHistory: generatePriceHistory(3200, 30, 'volatile'),
    ranking: 1,
    watchers: 890,
  },
  {
    id: '4',
    name: '4K 液晶テレビ 55インチ HDR対応',
    category: 'electronics',
    currentPrice: 89800,
    originalPrice: 110000,
    imageUrl: 'https://picsum.photos/seed/tv/400/400',
    priceHistory: generatePriceHistory(105000, 30, 'down'),
    badge: '📉 20%OFF',
    watchers: 2155,
  },
  {
    id: '5',
    name: 'ロボット掃除機 CleanBot v3',
    category: 'electronics',
    currentPrice: 45000,
    originalPrice: 45000,
    imageUrl: 'https://picsum.photos/seed/robot/400/400',
    priceHistory: generatePriceHistory(44500, 30, 'volatile'),
    ranking: 3,
    watchers: 1022,
  },
];
