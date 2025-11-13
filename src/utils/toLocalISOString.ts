export const toLocalISOString = (date?: Date | null): string | null => {
  if (!date || isNaN(date.getTime())) return null;
  const tzOffsetInMs = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffsetInMs);
  return localTime.toISOString().replace('Z', '');
};
