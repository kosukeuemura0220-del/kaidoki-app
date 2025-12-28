export const formatProductName = (name: string) => {
  return name
    .replace(/【.*?】|\[.*?\]|（.*?）|\(.*?\)|★.*?★/g, '') // 記号系を削除
    .replace(/送料無料|あす楽|ポイント\d+倍|期間限定/g, '') // 宣伝文句を削除
    .trim()
    .substring(0, 45); // 長すぎる場合は45文字でカット
};
