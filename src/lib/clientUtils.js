/**
 * Client-safe utility functions for Risthay Web
 * These are safe to use in both Client and Server Components
 * (no module-level new Date() calls)
 */

/**
 * Calculate age from a date-of-birth string (YYYY-MM-DD).
 * Returns 0 if the string is invalid or missing.
 */
export function calculateAgeClient(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}
