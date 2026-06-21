export function parseNativeBuildVersion(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const text = `${value}`.trim();
  if (!text) return null;

  const parsed = Number(text);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}
