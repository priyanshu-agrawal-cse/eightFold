/**
 * Normalizes a date string to YYYY-MM
 * Supports formats like "Jan 2022", "01/2022", "2022-01-15", etc.
 */
export function normalizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim();
  if (trimmed.toLowerCase() === 'present' || trimmed.toLowerCase() === 'current') {
    return 'Present';
  }

  // Try parsing with Date object
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Fallback regex for tricky formats like "Jan 2022"
  const match = trimmed.match(/([a-zA-Z]{3,})\s+(\d{4})/);
  if (match) {
    const monthStr = match[1].toLowerCase();
    const yearStr = match[2];
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const monthPrefix = monthStr.substring(0, 3);
    if (months[monthPrefix]) {
      return `${yearStr}-${months[monthPrefix]}`;
    }
  }

  return null;
}
