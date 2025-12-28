// app/api/generate-description/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { category, productInfo } = await req.json();

    // 入力チェック
    if (!category || !productInfo) {
      return NextResponse.json(
        { error: 'カテゴリと商品情報は必須です' },
        { status: 400 }
      );
    }

    // 決定したシステムプロンプト（状態の厳格化・注意書き込み）
    const systemPrompt = `
あなたはフリマアプリやECサイトの出品商品を要約・紹介するプロフェッショナルAIです。
ユーザーから入力された「カテゴリ」と「商品情報」を元に、魅力的な短い紹介文（サマリー）を作成してください。

## 重要ルール（絶対遵守）

1. **状態表記の厳格化**
   商品の状態については、入力情報に「傷」「汚れ」「破損」などのネガティブな記述があっても、出力文では必ず以下の**2択のみ**で表現してください。
   具体的なダメージ内容（例：「画面割れ」「シミあり」）は**絶対に**書かないでください。
   - 未使用・未開封の場合 → **「新品」**
   - それ以外（開封済み、使用感あり、傷あり等すべて） → **「中古」**

2. **カテゴリ別の視点**
   カテゴリ（${category}）に合わせて、購入者がポジティブに感じるポイント（スペック、デザイン、人気度など）を優先して抜き出してください。

3. **必須の注意書き**
   出力の最後には、必ず改行を2つ入れて以下の文言をそのまま記載してください。
   --------------------------------------------------
   ※この説明文はAIにより要約されています。詳細は遷移先でご確認ください。
   --------------------------------------------------
`;

    // AIへのリクエスト
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // コストと速度のバランスが良いモデル推奨
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `カテゴリ: ${category}\n商品情報: ${productInfo}` 
        },
      ],
      temperature: 0.7, // 少し創造性を持たせる
      max_tokens: 300,  // 長くなりすぎないように制限
    });

    const generatedText = completion.choices[0].message.content;

    return NextResponse.json({ result: generatedText });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: '説明文の生成に失敗しました' },
      { status: 500 }
    );
  }
}
