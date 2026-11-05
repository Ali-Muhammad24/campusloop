// Validation helpers for forms.
// Each helper returns an error message, or undefined when the value is fine,
// so the result can be passed straight to FormInput's "error" prop.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateRequired(value: string, fieldName = 'This field'): string | undefined {
  if (value.trim() === '') return `${fieldName} is required.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (email === '') return 'Email is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@example.com.';
  return undefined;
}

// The return date must be after today. Dates use the YYYY-MM-DD format from <input type="date">.
export function validateFutureDate(value: string): string | undefined {
  if (value.trim() === '') return 'Return date is required.';
  if (!isRealDate(value)) return 'Enter a valid date.';
  // YYYY-MM-DD strings can be compared as text: later dates sort after earlier ones.
  if (value <= toDateString(new Date())) return 'Return date must be in the future.';
  return undefined;
}

// Tomorrow as YYYY-MM-DD. Use it as the "min" of a date input so past dates can't be picked.
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateString(tomorrow);
}

// Formats a date as YYYY-MM-DD in the user's local time (not UTC).
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Checks the format and that the date exists (e.g. rejects 2026-02-30).
function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return toDateString(new Date(year, month - 1, day)) === value;
}
