/**
 * Utility function to get field value from CSV record with multiple possible field names
 * Handles case-insensitive field names commonly found in CSV files
 */
export function getCsvField(record: any, fieldName: string): string {
  const lowerField = fieldName.toLowerCase();
  const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  const upperField = fieldName.toUpperCase();
  
  return (
    record[lowerField] ||
    record[capitalizedField] ||
    record[upperField] ||
    record[fieldName] ||
    ''
  );
}

/**
 * Utility function to safely parse numeric value from CSV
 */
export function parseCsvNumber(value: string | number, defaultValue: number = 0): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
