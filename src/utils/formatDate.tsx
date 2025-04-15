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
  
  export function getDaysDifference(date1: Date, date2: Date): number {
    const startOfDay1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const startOfDay2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffInMs = startOfDay2.getTime() - startOfDay1.getTime();
    const msInOneDay = 1000 * 60 * 60 * 24;
    return Math.round(diffInMs / msInOneDay);
  }
  