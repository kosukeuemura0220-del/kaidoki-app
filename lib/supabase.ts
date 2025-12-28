import { createClient } from '@supabase/supabase-js';

// .env.local からキーを読み込む設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseクライアントを作成してエクスポート
export const supabase = createClient(supabaseUrl, supabaseKey);