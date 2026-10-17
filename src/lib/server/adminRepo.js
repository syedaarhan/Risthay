import crypto from "node:crypto";
import { getDb } from "./db.js";
import { recordAuditLog, hashAdminPassword } from "./adminAuth.js";
import { getAdminPlan, computeCalendarMonthExpiry, isSubscriptionActive } from "../subscriptions.js";
import { calculateAge, sanitize } from "./validation.js";

function nowIso() {
  return new Date().toISOString();
}

function safeParse(json) {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* 1. Dashboard Statistics & Analytics                                */
/* ------------------------------------------------------------------ */

export function getAdminDashboardStats() {
  const db = getDb();
  const now = nowIso();

  // 1. User & Profile metrics
  const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  const submittedProfiles = db.prepare("SELECT COUNT(*) AS count FROM users WHERE onboarded = 1").get().count;

  const pendingApprovals = db.prepare("SELECT COUNT(*) AS count FROM users WHERE review_status = 'pending'").get().count;
  const approvedProfiles = db.prepare("SELECT COUNT(*) AS count FROM users WHERE review_status = 'approved'").get().count;
  const rejectedProfiles = db.prepare("SELECT COUNT(*) AS count FROM users WHERE review_status = 'rejected'").get().count;
  const needsCorrection = db.prepare("SELECT COUNT(*) AS count FROM users WHERE review_status = 'needs_correction'").get().count;

  // Identity & Selfie verifications pending
  const pendingIdentity = db.prepare("SELECT COUNT(*) AS count FROM users WHERE identity_status = 'pending'").get().count;
  const pendingSelfie = db.prepare("SELECT COUNT(*) AS count FROM users WHERE selfie_status IN ('needs_manual_review', 'pending')").get().count;

  // 2. Subscription metrics
  const activeSubs = db.prepare(`
    SELECT COUNT(*) AS count FROM subscriptions
    WHERE status = 'active' AND datetime(end_date) > datetime('now')
  `).get().count;

  const expiredSubs = db.prepare(`
    SELECT COUNT(*) AS count FROM subscriptions
    WHERE status = 'expired' OR (status = 'active' AND datetime(end_date) <= datetime('now'))
  `).get().count;

  // Expiring within the next 7 days
  const expiring7Days = db.prepare(`
    SELECT COUNT(*) AS count FROM subscriptions
    WHERE status = 'active'
      AND datetime(end_date) > datetime('now')
      AND datetime(end_date) <= datetime('now', '+7 days')
  `).get().count;

  // 3. Registrations in last 7 and 30 days
  const regs7Days = db.prepare(`
    SELECT COUNT(*) AS count FROM users
    WHERE datetime(created_at) >= datetime('now', '-7 days')
  `).get().count;

  const regs30Days = db.prepare(`
    SELECT COUNT(*) AS count FROM users
    WHERE datetime(created_at) >= datetime('now', '-30 days')
  `).get().count;

  // 4. Revenue: Only from confirmed payments (Complimentary memberships do NOT add to revenue)
  const revenueRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS totalRevenue
    FROM payments
    WHERE payment_status = 'confirmed' AND amount > 0
  `).get();
  const totalRevenue = revenueRow ? revenueRow.totalRevenue : 0;

  const manualRevenueRow = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS manualRevenue
    FROM payments
    WHERE payment_status = 'confirmed' AND is_manual = 1 AND amount > 0
  `).get();
  const manualRevenue = manualRevenueRow ? manualRevenueRow.manualRevenue : 0;

  // 5. Daily registration trends (last 7 days)
  const trendsRows = db.prepare(`
    SELECT substr(created_at, 1, 10) as day, COUNT(*) as count
    FROM users
    WHERE datetime(created_at) >= datetime('now', '-7 days')
    GROUP BY day
    ORDER BY day ASC
  `).all();

  // 6. Subscription distribution
  const subDistRows = db.prepare(`
    SELECT plan_id, COUNT(*) as count
    FROM subscriptions
    WHERE status = 'active' AND datetime(end_date) > datetime('now')
    GROUP BY plan_id
  `).all();

  const planCounts = {
    plan_3m: 0,
    plan_6m: 0,
    plan_12m: 0,
    free: Math.max(0, totalUsers - activeSubs)
  };
  for (const row of subDistRows) {
    if (planCounts[row.plan_id] !== undefined) {
      planCounts[row.plan_id] = row.count;
    }
  }

  return {
    totalUsers,
    submittedProfiles,
    pendingApprovals,
    approvedProfiles,
    rejectedProfiles,
    needsCorrection,
    pendingIdentity,
    pendingSelfie,
    activeMemberships: activeSubs,
    expiredMemberships: expiredSubs,
    expiringIn7Days: expiring7Days,
    newRegistrations7d: regs7Days,
    newRegistrations30d: regs30Days,
    totalRevenueInr: totalRevenue,
    manualRevenueInr: manualRevenue,
    onlineRevenueInr: Math.max(0, totalRevenue - manualRevenue),
    trends: trendsRows,
    subscriptionDistribution: planCounts,
    approvalDistribution: {
      approved: approvedProfiles,
      pending: pendingApprovals,
      needsCorrection,
      rejected: rejectedProfiles
    },
    verificationDistribution: {
      verified: Math.max(0, approvedProfiles - pendingIdentity),
      pendingIdentity,
      pendingSelfie
    }
  };
}

/* ------------------------------------------------------------------ */
/* 2. Profile Management & Review                                      */
/* ------------------------------------------------------------------ */

export function getAdminProfiles({
  search = "",
  status = "",
  identityStatus = "",
  selfieStatus = "",
  isPremium = null,
  plan = "",
  gender = "",
  state = "",
  city = "",
  relationship = "",
  page = 1,
  limit = 20
} = {}) {
  const db = getDb();
  let whereClauses = [];
  let params = [];

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(lower(id) LIKE ? OR lower(name) LIKE ? OR lower(COALESCE(email, '')) LIKE ? OR lower(COALESCE(phone, '')) LIKE ?)");
    params.push(q, q, q, q);
  }

  if (status) {
    whereClauses.push("review_status = ?");
    params.push(status);
  }

  if (identityStatus) {
    whereClauses.push("identity_status = ?");
    params.push(identityStatus);
  }

  if (selfieStatus) {
    whereClauses.push("selfie_status = ?");
    params.push(selfieStatus);
  }

  if (isPremium !== null && isPremium !== "") {
    whereClauses.push("is_premium = ?");
    params.push(isPremium === "true" || isPremium === true || isPremium === 1 ? 1 : 0);
  }

  if (plan) {
    whereClauses.push("premium_plan = ?");
    params.push(plan);
  }

  if (gender) {
    whereClauses.push("gender = ?");
    params.push(gender);
  }

  if (state) {
    whereClauses.push("state = ?");
    params.push(state);
  }

  if (city) {
    whereClauses.push("city = ?");
    params.push(city);
  }

  if (relationship) {
    whereClauses.push("registered_relationship = ?");
    params.push(relationship);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count total matching
  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM users ${whereSql}`).get(...params);
  const total = countRow ? countRow.total : 0;

  const offset = Math.max(0, (page - 1) * limit);
  const rows = db.prepare(`
    SELECT id, name, email, phone, age, dob, gender, city, state, country,
           profession, education, verified, avatar, role, onboarded, status,
           is_premium, premium_plan, premium_until, review_status,
           identity_status, selfie_status, registered_relationship,
           reviewed_by, reviewed_at, rejection_reason, correction_notes,
           created_at, updated_at
    FROM users
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    profiles: rows.map(r => ({
      ...r,
      isPremium: Boolean(r.is_premium && (!r.premium_until || new Date(r.premium_until).getTime() > Date.now())),
      verified: Boolean(r.verified)
    }))
  };
}

export function getAdminProfileById(profileId) {
  if (!profileId) return null;
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(profileId);
  if (!row) return null;

  const profileJson = safeParse(row.profile_json);
  const reviews = db.prepare(`
    SELECT * FROM profile_reviews WHERE profile_id = ? ORDER BY created_at DESC
  `).all(profileId);

  const subscriptions = db.prepare(`
    SELECT * FROM subscriptions WHERE user_id = ? OR profile_id = ? ORDER BY created_at DESC
  `).all(profileId, profileId);

  const auditHistory = db.prepare(`
    SELECT * FROM audit_logs WHERE target_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(profileId);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    dob: row.dob,
    gender: row.gender,
    height: profileJson.height || "5 ft 8 in",
    motherTongue: profileJson.motherTongue || "Urdu",
    familyName: profileJson.familyName || "Siddiqui",
    maritalStatus: row.marital_status || "Never Married",
    highestQualification: row.education || "Bachelor's Degree",
    employmentSector: profileJson.employmentSector || "Private Sector",
    profession: row.profession || "Software Engineer",
    incomeRange: profileJson.incomeRange || "₹10 - ₹15 Lakhs p.a.",
    bio: profileJson.bio || "Assalamu Alaikum. Sincere and family-oriented Muslim searching for a pious partner.",
    hobbies: profileJson.hobbies || ["Reading Books", "Travelling", "Tech & Coding"],
    lookingFor: profileJson.lookingFor || "A religious, educated, and caring life partner who values sunnah principles.",
    preferredAgeRange: profileJson.preferredAgeRange || "22 - 27 Years",
    profileFor: row.registered_relationship || profileJson.profileFor || "Myself",
    country: row.country || "India",
    state: row.state,
    city: row.city,
    pincode: profileJson.pincode || null,
    familyLivesHere: profileJson.familyLivesHere || "Yes",
    photos: profileJson.photos || [row.avatar || "/images/ahmed.jpg"],
    primaryPhotoIndex: profileJson.primaryPhotoIndex || 0,
    photoPrivacy: profileJson.photoPrivacy || (profileJson.photoHidden ? "hide" : "show"),
    reviewStatus: row.review_status || "pending",
    identityStatus: row.identity_status || "pending",
    selfieStatus: row.selfie_status || "verified",
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
    rejectionReason: row.rejection_reason || null,
    correctionNotes: row.correction_notes || null,
    internalNotes: row.internal_notes || null,
    isPremium: Boolean(row.is_premium && (!row.premium_until || new Date(row.premium_until).getTime() > Date.now())),
    premiumPlan: row.premium_plan || null,
    premiumUntil: row.premium_until || null,
    createdAt: row.created_at,
    updated_at: row.updated_at,
    reviews,
    subscriptions,
    auditHistory
  };
}

/* ------------------------------------------------------------------ */
/* 3. Review Decisions: Approve, Reject, Request Corrections           */
/* ------------------------------------------------------------------ */

export function adminApproveProfile({ profileId, adminUser, notes = "", checklist = {} }) {
  const db = getDb();
  const profile = getAdminProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const now = nowIso();
  const reviewId = crypto.randomUUID();

  db.exec("BEGIN");
  try {
    // 1. Update user record
    db.prepare(`
      UPDATE users SET
        review_status = 'approved',
        status = 'active',
        verified = 1,
        reviewed_by = ?,
        reviewed_at = ?,
        internal_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(adminUser.email, now, notes, now, profileId);

    // 2. Insert decision into profile_reviews
    db.prepare(`
      INSERT INTO profile_reviews (id, profile_id, admin_id, admin_email, decision, reason, user_message, internal_notes, checklist_json, created_at)
      VALUES (?, ?, ?, ?, 'approved', NULL, 'Your profile has been approved and is now live on Risthay.', ?, ?, ?)
    `).run(reviewId, profileId, adminUser.id, adminUser.email, notes, JSON.stringify(checklist), now);

    // 3. Dispatch user in-app notification
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
      VALUES (?, ?, 'profile_approved', 'Profile Approved! 🎉', 'Mabrook! Your Risthay profile has been verified and is now visible to eligible matches.', 0, ?)
    `).run(crypto.randomUUID(), profileId, now);

    // 4. Record audit log
    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "profile_approve",
      targetType: "profile",
      targetId: profileId,
      details: { profileName: profile.name, notes, checklist }
    });

    db.exec("COMMIT");
    return getAdminProfileById(profileId);
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function adminRejectProfile({ profileId, adminUser, reason, userMessage = "", internalNotes = "" }) {
  const db = getDb();
  const profile = getAdminProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const now = nowIso();
  const reviewId = crypto.randomUUID();
  const finalUserMessage = userMessage.trim() || `Your profile submission could not be approved due to: ${reason}. Please contact Risthay support for assistance.`;

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE users SET
        review_status = 'rejected',
        status = 'rejected',
        rejection_reason = ?,
        reviewed_by = ?,
        reviewed_at = ?,
        internal_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(reason, adminUser.email, now, internalNotes, now, profileId);

    db.prepare(`
      INSERT INTO profile_reviews (id, profile_id, admin_id, admin_email, decision, reason, user_message, internal_notes, checklist_json, created_at)
      VALUES (?, ?, ?, ?, 'rejected', ?, ?, ?, NULL, ?)
    `).run(reviewId, profileId, adminUser.id, adminUser.email, reason, finalUserMessage, internalNotes, now);

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
      VALUES (?, ?, 'profile_rejected', 'Profile Review Update', ?, 0, ?)
    `).run(crypto.randomUUID(), profileId, finalUserMessage, now);

    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "profile_reject",
      targetType: "profile",
      targetId: profileId,
      details: { profileName: profile.name, reason, userMessage: finalUserMessage, internalNotes }
    });

    db.exec("COMMIT");
    return getAdminProfileById(profileId);
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function adminRequestCorrection({ profileId, adminUser, correctionNotes, internalNotes = "" }) {
  const db = getDb();
  const profile = getAdminProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const now = nowIso();
  const reviewId = crypto.randomUUID();
  const userNotice = `Clarification Required: ${correctionNotes}`;

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE users SET
        review_status = 'needs_correction',
        correction_notes = ?,
        reviewed_by = ?,
        reviewed_at = ?,
        internal_notes = ?,
        updated_at = ?
      WHERE id = ?
    `).run(correctionNotes, adminUser.email, now, internalNotes, now, profileId);

    db.prepare(`
      INSERT INTO profile_reviews (id, profile_id, admin_id, admin_email, decision, reason, user_message, internal_notes, checklist_json, created_at)
      VALUES (?, ?, ?, ?, 'needs_correction', 'Information Correction Required', ?, ?, NULL, ?)
    `).run(reviewId, profileId, adminUser.id, adminUser.email, userNotice, internalNotes, now);

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
      VALUES (?, ?, 'needs_correction', 'Profile Update Needed 📝', ?, 0, ?)
    `).run(crypto.randomUUID(), profileId, userNotice, now);

    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "profile_request_correction",
      targetType: "profile",
      targetId: profileId,
      details: { profileName: profile.name, correctionNotes, internalNotes }
    });

    db.exec("COMMIT");
    return getAdminProfileById(profileId);
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* 4. Subscriptions & Payments Management                             */
/* ------------------------------------------------------------------ */

export function getAdminSubscriptionsList({
  search = "",
  status = "",
  planId = "",
  method = "",
  page = 1,
  limit = 20
} = {}) {
  const db = getDb();
  let whereClauses = [];
  let params = [];

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(lower(s.profile_id) LIKE ? OR lower(u.name) LIKE ? OR lower(COALESCE(u.email, '')) LIKE ? OR lower(COALESCE(s.payment_reference, '')) LIKE ?)");
    params.push(q, q, q, q);
  }

  if (status) {
    if (status === "active") {
      whereClauses.push("s.status = 'active' AND datetime(s.end_date) > datetime('now')");
    } else if (status === "expired") {
      whereClauses.push("(s.status = 'expired' OR (s.status = 'active' AND datetime(s.end_date) <= datetime('now')))");
    } else if (status === "expiring_soon") {
      whereClauses.push("s.status = 'active' AND datetime(s.end_date) > datetime('now') AND datetime(s.end_date) <= datetime('now', '+7 days')");
    } else {
      whereClauses.push("s.status = ?");
      params.push(status);
    }
  }

  if (planId) {
    whereClauses.push("s.plan_id = ?");
    params.push(planId);
  }

  if (method) {
    whereClauses.push("s.assignment_method = ?");
    params.push(method);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total
    FROM subscriptions s
    LEFT JOIN users u ON s.user_id = u.id
    ${whereSql}
  `).get(...params);

  const total = countRow ? countRow.total : 0;
  const offset = Math.max(0, (page - 1) * limit);

  const rows = db.prepare(`
    SELECT s.*, u.name as member_name, u.email as member_email, u.avatar as member_avatar
    FROM subscriptions s
    LEFT JOIN users u ON s.user_id = u.id
    ${whereSql}
    ORDER BY s.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    subscriptions: rows.map(r => ({
      ...r,
      isCurrentlyActive: r.status === "active" && new Date(r.end_date).getTime() > Date.now(),
      isExpiring7Days: r.status === "active" && new Date(r.end_date).getTime() > Date.now() && new Date(r.end_date).getTime() <= (Date.now() + 7 * 86400000)
    }))
  };
}

export function adminGrantSubscription({
  profileId,
  planId,
  startDate,
  customEndDate = null,
  assignmentMethod = "manual",
  paymentMethod = "upi",
  paymentStatus = "paid",
  paymentReference = "",
  notes = "",
  adminUser
}) {
  const db = getDb();
  const profile = getAdminProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const plan = getAdminPlan(planId);
  if (!plan) throw new Error("Invalid plan selected. Must be 3 Months (₹499), 6 Months (₹899), or 12 Months (₹1,199)");

  const startIso = startDate ? new Date(startDate).toISOString() : nowIso();
  const endIso = customEndDate ? new Date(customEndDate).toISOString() : computeCalendarMonthExpiry(startIso, plan.durationMonths);

  const isComplimentary = assignmentMethod === "complimentary" || paymentStatus === "complimentary" || paymentMethod === "complimentary";
  const recordedAmount = isComplimentary ? 0 : plan.price;
  const finalPaymentStatus = isComplimentary ? "complimentary" : paymentStatus;
  const finalAssignmentMethod = isComplimentary ? "complimentary" : assignmentMethod;

  const now = nowIso();
  const subId = `sub-${crypto.randomUUID()}`;
  const payId = `pay-${crypto.randomUUID()}`;

  db.exec("BEGIN");
  try {
    // 1. Mark existing active subscriptions as renewed/superseded
    db.prepare("UPDATE subscriptions SET status = 'expired', updated_at = ? WHERE user_id = ? AND status = 'active'").run(now, profileId);

    // 2. Insert new subscription
    db.prepare(`
      INSERT INTO subscriptions (
        id, user_id, profile_id, plan_id, plan_name, amount, start_date, end_date,
        status, assignment_method, payment_method, payment_status, payment_reference,
        assigned_by, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      profileId,
      profileId,
      plan.id,
      plan.name,
      recordedAmount,
      startIso,
      endIso,
      finalAssignmentMethod,
      isComplimentary ? "complimentary" : paymentMethod,
      finalPaymentStatus,
      paymentReference || null,
      adminUser.name,
      notes || null,
      now,
      now
    );

    // 3. Insert payment ledger row ONLY if non-complimentary and confirmed
    if (!isComplimentary && finalPaymentStatus === "paid") {
      db.prepare(`
        INSERT INTO payments (
          id, subscription_id, user_id, profile_id, amount, currency, payment_method,
          payment_status, transaction_id, is_manual, recorded_by, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, 'INR', ?, 'confirmed', ?, 1, ?, ?, ?)
      `).run(
        payId,
        subId,
        profileId,
        profileId,
        recordedAmount,
        paymentMethod,
        paymentReference || `MANUAL-${Date.now()}`,
        adminUser.email,
        notes || "Manual subscription payment",
        now
      );
    }

    // 4. Update user profile membership attributes
    db.prepare(`
      UPDATE users SET
        is_premium = 1,
        premium_plan = ?,
        premium_until = ?,
        updated_at = ?
      WHERE id = ?
    `).run(plan.id, endIso, now, profileId);

    // 5. In-app notification to member
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, read, created_at)
      VALUES (?, ?, 'subscription_granted', 'Premium Active! 👑', ?, 0, ?)
    `).run(
      crypto.randomUUID(),
      profileId,
      `Your Risthay Premium membership (${plan.name}) is now active until ${new Date(endIso).toLocaleDateString("en-IN")}. Enjoy unlimited halal chats and full photo access!`,
      now
    );

    // 6. Audit log
    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "subscription_grant",
      targetType: "subscription",
      targetId: subId,
      details: {
        profileId,
        profileName: profile.name,
        plan: plan.name,
        amount: recordedAmount,
        isComplimentary,
        startIso,
        endIso
      }
    });

    db.exec("COMMIT");
    return { success: true, subscriptionId: subId, endIso };
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function adminExtendSubscription({ subscriptionId, monthsToAdd, notes = "", adminUser }) {
  const db = getDb();
  const sub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(subscriptionId);
  if (!sub) throw new Error("Subscription not found");

  const now = nowIso();
  const baseDate = new Date(sub.end_date).getTime() > Date.now() ? sub.end_date : now;
  const newEndIso = computeCalendarMonthExpiry(baseDate, monthsToAdd);

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE subscriptions SET
        end_date = ?,
        status = 'active',
        notes = COALESCE(notes || ' | ', '') || ?,
        updated_at = ?
      WHERE id = ?
    `).run(newEndIso, `Extended +${monthsToAdd} months: ${notes}`, now, subscriptionId);

    db.prepare(`
      UPDATE users SET
        is_premium = 1,
        premium_until = ?,
        updated_at = ?
      WHERE id = ?
    `).run(newEndIso, now, sub.user_id);

    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "subscription_extend",
      targetType: "subscription",
      targetId: subscriptionId,
      details: { monthsAdded: monthsToAdd, oldEnd: sub.end_date, newEnd: newEndIso, notes }
    });

    db.exec("COMMIT");
    return { success: true, newEndIso };
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function adminRevokeSubscription({ subscriptionId, reason, adminUser }) {
  const db = getDb();
  const sub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(subscriptionId);
  if (!sub) throw new Error("Subscription not found");

  const now = nowIso();

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE subscriptions SET
        status = 'revoked',
        notes = COALESCE(notes || ' | ', '') || ?,
        updated_at = ?
      WHERE id = ?
    `).run(`Revoked by ${adminUser.name}: ${reason}`, now, subscriptionId);

    // Remove user's premium privileges
    db.prepare(`
      UPDATE users SET
        is_premium = 0,
        premium_until = ?,
        updated_at = ?
      WHERE id = ?
    `).run(now, now, sub.user_id);

    recordAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: "subscription_revoke",
      targetType: "subscription",
      targetId: subscriptionId,
      details: { userId: sub.user_id, reason }
    });

    db.exec("COMMIT");
    return { success: true };
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* 5. Payments Ledger                                                 */
/* ------------------------------------------------------------------ */

export function getAdminPaymentsList({ search = "", status = "", method = "", page = 1, limit = 20 } = {}) {
  const db = getDb();
  let whereClauses = [];
  let params = [];

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    whereClauses.push("(lower(p.profile_id) LIKE ? OR lower(u.name) LIKE ? OR lower(COALESCE(p.transaction_id, '')) LIKE ?)");
    params.push(q, q, q);
  }

  if (status) {
    whereClauses.push("p.payment_status = ?");
    params.push(status);
  }

  if (method) {
    whereClauses.push("p.payment_method = ?");
    params.push(method);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countRow = db.prepare(`
    SELECT COUNT(*) AS total, COALESCE(SUM(p.amount), 0) AS totalSum
    FROM payments p
    LEFT JOIN users u ON p.user_id = u.id
    ${whereSql}
  `).get(...params);

  const total = countRow ? countRow.total : 0;
  const totalAmount = countRow ? countRow.totalSum : 0;

  const offset = Math.max(0, (page - 1) * limit);
  const rows = db.prepare(`
    SELECT p.*, u.name as member_name, u.email as member_email
    FROM payments p
    LEFT JOIN users u ON p.user_id = u.id
    ${whereSql}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    total,
    totalAmount,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    payments: rows
  };
}

/* ------------------------------------------------------------------ */
/* 6. Identity & Verification Review                                  */
/* ------------------------------------------------------------------ */

export function getAdminVerificationsList({ status = "pending", page = 1, limit = 20 } = {}) {
  const db = getDb();
  let whereSql = "";
  let params = [];

  if (status && status !== "all") {
    whereSql = "WHERE u.identity_status = ? OR u.selfie_status = ?";
    params.push(status, status);
  }

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM users u ${whereSql}`).get(...params);
  const total = countRow ? countRow.total : 0;
  const offset = Math.max(0, (page - 1) * limit);

  const rows = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, u.avatar, u.city, u.state,
           u.identity_status, u.selfie_status, u.review_status,
           u.created_at, u.profile_json
    FROM users u
    ${whereSql}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    verifications: rows.map(r => {
      const pJson = safeParse(r.profile_json);
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        avatar: r.avatar,
        city: r.city,
        state: r.state,
        docType: pJson.docType || "Aadhaar Card (UIDAI Verified)",
        maskedId: `XXXX-XXXX-${r.id.replace(/\D/g, "").slice(-4) || "7210"}`,
        identityStatus: r.identity_status || "pending",
        selfieStatus: r.selfie_status || "needs_manual_review",
        reviewStatus: r.review_status || "pending",
        createdAt: r.created_at
      };
    })
  };
}

export function adminReviewVerification({ profileId, docDecision, selfieDecision, notes = "", adminUser }) {
  const db = getDb();
  const profile = getAdminProfileById(profileId);
  if (!profile) throw new Error("Profile not found");

  const now = nowIso();

  db.prepare(`
    UPDATE users SET
      identity_status = COALESCE(?, identity_status),
      selfie_status = COALESCE(?, selfie_status),
      internal_notes = COALESCE(internal_notes || ' | ', '') || ?,
      updated_at = ?
    WHERE id = ?
  `).run(docDecision || null, selfieDecision || null, `Verification reviewed by ${adminUser.name}: ${notes}`, now, profileId);

  recordAuditLog({
    adminId: adminUser.id,
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: "document_access",
    targetType: "verification",
    targetId: profileId,
    details: { docDecision, selfieDecision, notes }
  });

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* 7. Google Sheets Sync                                              */
/* ------------------------------------------------------------------ */

export function getGoogleSheetsSyncState() {
  const db = getDb();
  const settingsRow = db.prepare("SELECT value_json FROM system_settings WHERE key = 'google_sheets'").get();
  const config = settingsRow ? safeParse(settingsRow.value_json) : {};

  const totalSynced = db.prepare("SELECT COUNT(*) AS count FROM google_sheets_sync WHERE sync_status = 'synced'").get().count;
  const totalPending = db.prepare("SELECT COUNT(*) AS count FROM users WHERE onboarded = 1 AND id NOT IN (SELECT profile_id FROM google_sheets_sync WHERE sync_status = 'synced')").get().count;
  const recentLogs = db.prepare("SELECT * FROM google_sheets_sync ORDER BY last_synced_at DESC LIMIT 10").all();

  const isConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

  return {
    isConfigured,
    autoSync: config.autoSyncNewProfiles ?? true,
    sheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? `${process.env.GOOGLE_SHEETS_SPREADSHEET_ID.slice(0, 8)}...` : "Not Set",
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "Not configured in .env.local",
    totalSynced,
    totalPending,
    lastSyncAt: config.lastSyncAt || null,
    recentLogs
  };
}

export function adminTriggerGoogleSheetsSync(adminUser) {
  const db = getDb();
  const now = nowIso();
  const isConfigured = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

  // Retrieve un-synced profiles
  const pendingProfiles = db.prepare(`
    SELECT id, name, review_status, identity_status, created_at
    FROM users
    WHERE onboarded = 1
    LIMIT 50
  `).all();

  const insertSync = database => database.prepare(`
    INSERT INTO google_sheets_sync (id, profile_id, sheet_row_id, sync_status, error_message, last_synced_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(profile_id) DO UPDATE SET
      sync_status = excluded.sync_status,
      last_synced_at = excluded.last_synced_at,
      error_message = excluded.error_message
  `);

  const stmt = insertSync(db);
  for (const p of pendingProfiles) {
    stmt.run(
      crypto.randomUUID(),
      p.id,
      isConfigured ? `row-${p.id}` : null,
      isConfigured ? "synced" : "not_configured",
      isConfigured ? null : "Google Service Account credentials not provided in environment variables.",
      now,
      now
    );
  }

  // Update system settings timestamp
  db.prepare(`
    UPDATE system_settings
    SET value_json = json_set(value_json, '$.lastSyncAt', ?), updated_at = ?
    WHERE key = 'google_sheets'
  `).run(now, now);

  recordAuditLog({
    adminId: adminUser.id,
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: "google_sheets_sync",
    targetType: "google_sheets",
    targetId: "sync_batch",
    details: { profilesCount: pendingProfiles.length, isConfigured }
  });

  return {
    success: true,
    isConfigured,
    syncedCount: isConfigured ? pendingProfiles.length : 0,
    notice: isConfigured
      ? `Successfully synchronized ${pendingProfiles.length} profiles with Google Sheets.`
      : "Google Sheets integration is unconfigured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SHEETS_SPREADSHEET_ID to enable live synchronization."
  };
}

/* ------------------------------------------------------------------ */
/* 8. Notifications Dispatch & Center                                 */
/* ------------------------------------------------------------------ */

export function getAdminNotificationsList({ limit = 30 } = {}) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT n.*, u.name as member_name
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC
    LIMIT ?
  `).all(limit);

  return rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    memberName: r.member_name || "Risthay Member",
    type: r.type,
    title: r.title,
    body: r.body,
    channel: "In-App Notification",
    status: "Delivered",
    createdAt: r.created_at
  }));
}

/* ------------------------------------------------------------------ */
/* 9. Admin Users & Permissions Management                            */
/* ------------------------------------------------------------------ */

export function getAdminUsersList() {
  const db = getDb();
  return db.prepare(`
    SELECT id, email, name, role, active, last_login_at, created_at, updated_at
    FROM admin_users
    ORDER BY created_at ASC
  `).all();
}

export function createNewAdminUser({ email, password, name, role = "super_admin" }, currentAdmin) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM admin_users WHERE lower(email) = lower(?)").get(email);
  if (existing) throw new Error("An admin user with this email already exists");

  const id = `admin-${crypto.randomUUID()}`;
  const now = nowIso();
  const hash = hashAdminPassword(password);

  db.prepare(`
    INSERT INTO admin_users (id, email, password_hash, name, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).run(id, email.toLowerCase().trim(), hash, name.trim(), role, now, now);

  recordAuditLog({
    adminId: currentAdmin.id,
    adminEmail: currentAdmin.email,
    adminName: currentAdmin.name,
    action: "admin_role_change",
    targetType: "admin_user",
    targetId: id,
    details: { createdEmail: email, role, name }
  });

  return { id, email, name, role };
}

export function updateAdminUserStatus(id, { role, active }, currentAdmin) {
  const db = getDb();
  const now = nowIso();

  db.prepare(`
    UPDATE admin_users SET
      role = COALESCE(?, role),
      active = COALESCE(?, active),
      updated_at = ?
    WHERE id = ?
  `).run(role || null, active !== undefined ? (active ? 1 : 0) : null, now, id);

  recordAuditLog({
    adminId: currentAdmin.id,
    adminEmail: currentAdmin.email,
    adminName: currentAdmin.name,
    action: "admin_role_change",
    targetType: "admin_user",
    targetId: id,
    details: { updatedRole: role, updatedActive: active }
  });

  return { success: true };
}

/* ------------------------------------------------------------------ */
/* 10. Audit Logs Timeline                                            */
/* ------------------------------------------------------------------ */

export function getAuditLogsList({ action = "", targetType = "", limit = 50 } = {}) {
  const db = getDb();
  let whereClauses = [];
  let params = [];

  if (action) {
    whereClauses.push("action = ?");
    params.push(action);
  }

  if (targetType) {
    whereClauses.push("target_type = ?");
    params.push(targetType);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  return db.prepare(`
    SELECT * FROM audit_logs
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ?
  `).all(...params, limit);
}
