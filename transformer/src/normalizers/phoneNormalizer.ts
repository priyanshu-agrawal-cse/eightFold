import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  // If it doesn't have a +, add a default one (assuming US for raw digits if no country code provided, but the library might need it)
  // Let's try parsing it as international first
  let parsed = parsePhoneNumberFromString(phone);
  if (!parsed && !phone.startsWith('+')) {
    // Attempt parsing assuming US/CA if it looks like 10 digits
    parsed = parsePhoneNumberFromString(phone, 'US');
  }

  if (parsed && parsed.isValid()) {
    return parsed.format('E.164');
  }

  // Fallback: strip non-digits, if 10 digits assume US, if >10 add +, else null
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length > 10) {
    return `+${digits}`;
  }

  return null; // Invalid or malformed
}
