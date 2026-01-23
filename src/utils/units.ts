const normalize = (value?: string | number | null) => `${value ?? ""}`.trim()

export function formatValueWithUnit(value: string | number | null | undefined, unit?: string | null): string {
  const normalizedValue = normalize(value)
  const normalizedUnit = normalize(unit)
  if (!normalizedValue || !normalizedUnit || normalizedValue === "N/A") return normalizedValue

  const lowerValue = normalizedValue.toLowerCase()
  const lowerUnit = normalizedUnit.toLowerCase()

  if (lowerValue.endsWith(` ${lowerUnit}`) || lowerValue.endsWith(`(${lowerUnit})`)) {
    return normalizedValue
  }

  return `${normalizedValue} ${normalizedUnit}`
}
