// Subscription and membership management logic for Risthay Matrimony.
// Strictly enforces Indian Rupees (INR) pricing and calendar-month expiry arithmetic.

export const ADMIN_PLANS = [
  {
    id: "plan_3m",
    name: "3 Months",
    durationMonths: 3,
    price: 499,
    priceInr: 499,
    formattedPrice: "₹499",
    description: "3-Month Full Premium Halal Access"
  },
  {
    id: "plan_6m",
    name: "6 Months",
    durationMonths: 6,
    price: 899,
    priceInr: 899,
    formattedPrice: "₹899",
    description: "6-Month Full Premium Halal Access"
  },
  {
    id: "plan_12m",
    name: "12 Months",
    durationMonths: 12,
    price: 1199,
    priceInr: 1199,
    formattedPrice: "₹1,199",
    description: "12-Month Annual Premium Halal Access"
  }
];

export const SUBSCRIPTION_PLANS = {
  plan_3m: ADMIN_PLANS[0],
  plan_6m: ADMIN_PLANS[1],
  plan_12m: ADMIN_PLANS[2]
};

export function getAdminPlan(planId) {
  return ADMIN_PLANS.find((p) => p.id === planId) || null;
}

/**
 * Calculates accurate calendar-month expiration timestamp.
 * Example:
 *   17 Oct + 3 months -> 17 Jan
 *   17 Oct + 6 months -> 17 Apr
 *   17 Oct + 12 months -> 17 Oct (next year)
 *   31 Jan + 1 month -> 28 Feb (or 29 Feb in leap year)
 *
 * @param {string|Date} startDateInput
 * @param {number} monthsToAdd
 * @returns {string} ISO Date string
 */
export function computeCalendarMonthExpiry(startDateInput, monthsToAdd) {
  const d = new Date(startDateInput || Date.now());
  if (isNaN(d.getTime())) return null;

  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();

  const targetMonthIndex = month + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12;

  // Last day of target month (handles 28, 29, 30, 31)
  const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, normalizedTargetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, maxDaysInTargetMonth);

  // Inclusive expiry: preserves time-of-day
  const result = new Date(Date.UTC(
    targetYear,
    normalizedTargetMonth,
    targetDay,
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  ));

  return result.toISOString();
}

/**
 * Checks whether a subscription is currently active.
 */
export function isSubscriptionActive(sub) {
  if (!sub || sub.status !== "active") return false;
  if (!sub.end_date) return false;
  return new Date(sub.end_date).getTime() > Date.now();
}

/**
 * Checks if a subscription will expire within the next N days (default: 7 days).
 */
export function isExpiringSoon(sub, days = 7) {
  if (!isSubscriptionActive(sub)) return false;
  const now = Date.now();
  const expiry = new Date(sub.end_date).getTime();
  const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays <= days;
}
