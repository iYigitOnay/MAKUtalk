export const FORBIDDEN_WORDS = ['küfür1', 'küfür2', 'argo1', 'argo2'];

export function censorContent(text: string): {
  cleanText: string;
  count: number;
} {
  if (!text) return { cleanText: text, count: 0 };

  let cleanText = text;
  let count = 0;

  FORBIDDEN_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      count += matches.length;
      cleanText = cleanText.replace(regex, '*'.repeat(word.length));
    }
  });

  return { cleanText, count };
}
