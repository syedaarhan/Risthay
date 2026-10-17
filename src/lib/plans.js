// Subscription plan catalogue. Client-safe (no server-only imports) so both the
// API routes and the UI can share a single source of truth.

export const PREMIUM_BENEFITS = [
  "View all member profile photos",
  "Unlimited Halal chat with your matches",
  "See who viewed and shortlisted you",
  "Priority placement in search results",
  "Direct Wali / guardian chat access"
];

export const FREE_LIMITATIONS = [
  "Profile photos stay blurred",
  "Halal chat is locked",
  "Cannot see who viewed you"
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "plan_3m",
    name: "3 Months",
    months: 3,
    price: 499,
    originalPrice: 597,
    tagline: "Ideal to begin your halal search",
    badge: null,
    popular: false
  },
  {
    id: "plan_6m",
    name: "6 Months",
    months: 6,
    price: 899,
    originalPrice: 1194,
    tagline: "Most chosen by serious members",
    badge: "Most Popular",
    popular: true
  },
  {
    id: "plan_12m",
    name: "12 Months",
    months: 12,
    price: 1199,
    originalPrice: 2388,
    tagline: "Best value for a complete search",
    badge: "Best Value",
    popular: false
  }
];

export function getPlanById(id) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id) || null;
}

export function perMonthPrice(plan) {
  if (!plan || !plan.months) return 0;
  return Math.round(plan.price / plan.months);
}

export function formatInr(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}
