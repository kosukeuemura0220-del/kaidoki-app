// app/lib/productDefinitions.ts

export type ProductDefinition = {
  id: string;      // システム上のID
  displayName: string; // 画面に表示する名前
  keywords: string[];  // 検索キーワード（これらが含まれるものをまとめる）
  exclude?: string[];  // 除外キーワード
};

// ▼▼▼ ここにどんどん商品を増やしていけます ▼▼▼
export const PRODUCT_CATALOG: ProductDefinition[] = [
  // --- Apple ---
  { 
    id: 'airpods-4-std', 
    displayName: 'AirPods 4', 
    keywords: ['AirPods 4', 'MXP63J/A', '第4世代'], 
    exclude: ['ノイズキャンセリング', 'ケースのみ', 'カバー'] 
  },
  { 
    id: 'airpods-4-nc', 
    displayName: 'AirPods 4 (ANC搭載)', 
    keywords: ['AirPods 4', 'MXP93J/A', 'ノイズキャンセリング'] 
  },
  { 
    id: 'airpods-pro-2', 
    displayName: 'AirPods Pro (第2世代)', 
    keywords: ['AirPods Pro', 'MQD83J/A', '第2世代'],
    exclude: ['ケース', 'カバー']
  },

  // --- 掃除機 ---
  {
    id: 'dyson-v12',
    displayName: 'Dyson V12 Detect Slim',
    keywords: ['Dyson', 'V12', 'Detect Slim'],
    exclude: ['スタンド', 'バッテリー', 'レンタル']
  },
  
  // --- ゲーム ---
  {
    id: 'switch-oled',
    displayName: 'Nintendo Switch (有機EL)',
    keywords: ['Nintendo Switch', '有機EL', '本体'],
    exclude: ['ソフト', 'フィルム', 'レンタル']
  }
];