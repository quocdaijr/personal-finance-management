/**
 * Formatting utilities for currency and dates
 */

// Supported currencies with their symbols and locale codes
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
  KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Supported date formats
export const SUPPORTED_DATE_FORMATS = {
  'MM/DD/YYYY': { name: 'MM/DD/YYYY (US)', example: '12/31/2024' },
  'DD/MM/YYYY': { name: 'DD/MM/YYYY (EU)', example: '31/12/2024' },
  'YYYY-MM-DD': { name: 'YYYY-MM-DD (ISO)', example: '2024-12-31' },
  'DD.MM.YYYY': { name: 'DD.MM.YYYY (DE)', example: '31.12.2024' },
  'YYYY/MM/DD': { name: 'YYYY/MM/DD (JP)', example: '2024/12/31' },
} as const;

export type DateFormatType = keyof typeof SUPPORTED_DATE_FORMATS;

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - Optional locale override
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  locale?: string
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
  const localeToUse = locale || currencyInfo.locale;

  try {
    return new Intl.NumberFormat(localeToUse, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if Intl.NumberFormat fails
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a date according to the specified format
 * @param date - The date to format (Date object, string, or timestamp)
 * @param format - The date format to use (default: MM/DD/YYYY)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: DateFormatType = 'MM/DD/YYYY'
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Format a date and time
 * @param date - The date to format
 * @param format - The date format to use
 * @param includeTime - Whether to include time (default: true)
 * @returns Formatted date/time string
 */
export function formatDateTime(
  date: Date | string | number,
  format: DateFormatType = 'MM/DD/YYYY',
  includeTime: boolean = true
): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const formattedDate = formatDate(dateObj, format);

  if (!includeTime) {
    return formattedDate;
  }

  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${formattedDate} ${hours}:${minutes}`;
}

/**
 * Get currency symbol for a currency code
 * @param currency - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[currency]?.symbol || '$';
}

/**
 * Get currency name for a currency code
 * @param currency - The currency code
 * @returns Currency name
 */
export function getCurrencyName(currency: CurrencyCode): string {
  return SUPPORTED_CURRENCIES[currency]?.name || 'US Dollar';
}

/**
 * Parse a formatted currency string back to a number
 * @param value - The formatted currency string
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

