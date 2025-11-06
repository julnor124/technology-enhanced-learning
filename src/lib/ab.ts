export function getVariant(experimentName: string, variants: string[]): string {

  const key = `exp:${experimentName}`;

  const existing = typeof window !== "undefined" ? localStorage.getItem(key) : null;

  if (existing && variants.includes(existing)) return existing;



  const assigned = variants[Math.floor(Math.random() * variants.length)];

  if (typeof window !== "undefined") localStorage.setItem(key, assigned);

  return assigned;

}
