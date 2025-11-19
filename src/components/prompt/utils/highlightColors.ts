const colors = [
  "rgba(255, 150, 150, 0.6)",
  "rgba(150, 200, 255, 0.6)",
  "rgba(150, 255, 150, 0.6)",
  "rgba(255, 200, 150, 0.6)",
  "rgba(200, 150, 255, 0.6)",
  "rgba(255, 255, 150, 0.6)",
];

export function getHighlightColor(index: number): string {
  return colors[index % colors.length];
}

export function getKeywordCategory(prompt: string): number {
  const lower = prompt.toLowerCase();

  if (lower.includes("summarize") || lower.includes("summary")) return 0;
  if (lower.includes("explain") || lower.includes("what")) return 1;
  if (lower.includes("create") || lower.includes("generate")) return 2;
  if (lower.includes("essay") || lower.includes("write")) return 3;
  if (lower.includes("study guide") || lower.includes("outline")) return 4;
  if (lower.includes("key points") || lower.includes("main")) return 5;

  return -1;
}

