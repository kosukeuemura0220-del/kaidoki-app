import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysis, Product } from "../types";

// Geminiの準備 (APIキーは後で .env.local に入れます)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const analyzePrice = async (product: Product, isPro: boolean): Promise<AIAnalysis> => {
  // 価格履歴をテキスト化
  const historyStr = JSON.stringify(product.priceHistory);

  const prompt = `
    あなたは価格分析の専門家です。以下の商品の価格推移データを見て、購入判断を行ってください。
    
    商品名: ${product.name}
    現在価格: ${product.currentPrice}円
    過去の価格データ: ${historyStr}

    【判定基準】
    - BUY: 直近の底値圏、または大幅な下落トレンド。
    - WATCH: 価格が横ばい、または少し下がり始めているが底ではない。
    - WAIT: 直近の高値圏、または価格上昇中。

    【出力ルール】
    - 専門用語を使わず、親しみやすい日本語で説明してください。
    - 「判定: BUY」のように明確に結論を出してください。
    - JSON形式で返してください: { "status": "BUY" | "WATCH" | "WAIT", "reason": "理由..." }
  `;

  try {
   const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON部分だけを取り出す処理（Geminiが余計な文字をつけることがあるため）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONが見つかりませんでした");
    
    const data = JSON.parse(jsonMatch[0]);
    
    return {
      status: data.status,
      reason: data.reason,
      prediction: "今後価格は変動する可能性があります。"
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    // エラー時は安全なデフォルト値を返す
    return {
      status: "WATCH",
      reason: "AI分析中にエラーが発生しました。しばらく様子を見ましょう。",
    };
  }
};