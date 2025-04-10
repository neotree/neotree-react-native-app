export function formatDate(date: any): string {
    // FORMAT DATE TO YYYY-MM-DD
    const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
  }

  export function parseStringToDate(ymd: string): Date | null {
    const [year, month, day] = ymd.split('-').map(Number);
  
    if (
      !year || !month || !day ||
      isNaN(year) || isNaN(month) || isNaN(day)
    ) {
      return null; // invalid format
    }
  
    return new Date(year, month - 1, day);
  }
  