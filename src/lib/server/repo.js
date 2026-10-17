// Repository layer — all database reads/writes live here. Route handlers stay
// thin and only deal with request parsing + response shaping.

import crypto from "node:crypto";
import { getDb, DEMO_USER_ID, SUPPORT_ID } from "./db";
import { getPlanById } from "@/lib/plans";
import {
  relativeTime,
  formatClockTime,
  calculateAge,
  sanitize,
  asBool
} from "./validation";

function isPremiumActive(row) {
  if (!row || !row.is_premium) return false;
  if (!row.premium_until) return true;
  return new Date(row.premium_until).getTime() > Date.now();
}

function safeParse(json) {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function nowIso() {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export function rowToProfile(row) {
  const base = safeParse(row.profile_json);
  const financials = base.financials || {};

  return {
    ...base,
    id: row.id,
    name: row.name ?? base.name,
    age: row.age ?? base.age ?? null,
    gender: row.gender ?? base.gender ?? null,
    city: row.city ?? base.city ?? null,
    state: row.state ?? base.state ?? null,
    country: row.country ?? base.country ?? "India",
    profession: row.profession ?? base.profession ?? null,
    education: row.education ?? base.education ?? null,
    religiousPractice: row.religious_practice ?? base.religiousPractice ?? null,
    maritalStatus: row.marital_status ?? base.maritalStatus ?? null,
    avatar: row.avatar ?? base.avatar ?? null,
    email: row.email ?? base.email ?? null,
    phone: row.phone ?? base.phone ?? null,
    incomeRange: base.incomeRange || financials.income || null,
    verified: !!row.verified,
    photoHidden: base.photoHidden ?? false,
    photos: base.photos ?? [],
    role: row.role || "member",
    onboarded: !!row.onboarded,
    isPremium: isPremiumActive(row),
    premiumPlan: row.premium_plan || null,
    premiumUntil: row.premium_until || null,
    supabaseUserId: row.supabase_user_id || null,
    reviewStatus: row.review_status || "pending",
    identityStatus: row.identity_status || "pending",
    selfieStatus: row.selfie_status || "verified",
    rejectionReason: row.rejection_reason || null,
    correctionNotes: row.correction_notes || null,
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
    registeredRelationship: row.registered_relationship || "Self",
    status: row.status || "active"
  };
}

export function getUserById(id) {
  if (!id) return null;
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? rowToProfile(row) : null;
}

export function getUserBySupabaseId(supabaseUserId) {
  if (!supabaseUserId) return null;
  const row = getDb()
    .prepare("SELECT * FROM users WHERE supabase_user_id = ?")
    .get(supabaseUserId);
  return row ? rowToProfile(row) : null;
}

export function linkSupabaseUser(userId, supabaseUserId) {
  if (!userId || !supabaseUserId) return null;
  getDb().prepare("UPDATE users SET supabase_user_id = ?, updated_at = ? WHERE id = ?").run(supabaseUserId, nowIso(), userId);
  return getUserById(userId);
}

export function getUserRowById(id) {
  if (!id) return null;
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) || null;
}

export function getUserByPhone(phone) {
  const normalized = String(phone || "").replace(/\D/g, "").slice(-10);
  if (!normalized) return null;
  const row = getDb()
    .prepare("SELECT * FROM users WHERE replace(replace(COALESCE(phone,''),'+',''),' ','') LIKE ?")
    .get(`%${normalized}`);
  return row ? rowToProfile(row) : null;
}

export function getUserByEmail(email) {
  if (!email) return null;
  const row = getDb().prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email.trim());
  return row ? rowToProfile(row) : null;
}

export function createUser(profile) {
  const db = getDb();
  const timestamp = nowIso();
  const id = profile.id || newId("RS");
  const supabaseUserId = profile.supabaseUserId || null;

  const reviewStatus = profile.reviewStatus || (profile.isDemo ? "approved" : "pending");
  const identityStatus = profile.identityStatus || (profile.verified ? "verified" : "pending");
  const selfieStatus = profile.selfieStatus || "verified";
  const registeredRelationship = profile.registeredRelationship || profile.profileFor || "Self";
  const userStatus = profile.status || (reviewStatus === "approved" ? "active" : "pending");

  db.prepare(`
    INSERT INTO users (
      id, phone, email, password_hash, name, age, dob, gender, city, state, country,
      profession, education, religious_practice, marital_status, verified, avatar,
      role, is_demo, onboarded, status, profile_json, created_at, updated_at, supabase_user_id,
      review_status, identity_status, selfie_status, registered_relationship
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    profile.phone || null,
    profile.email || null,
    profile.passwordHash || null,
    profile.name || "Risthay Member",
    profile.age ?? calculateAge(profile.dob) ?? null,
    profile.dob || null,
    profile.gender || null,
    profile.city || null,
    profile.state || null,
    profile.country || "India",
    profile.profession || null,
    profile.education || null,
    profile.religiousPractice || null,
    profile.maritalStatus || null,
    profile.verified === false ? 0 : 1,
    profile.avatar || null,
    profile.role || "member",
    profile.onboarded === false ? 0 : 1,
    userStatus,
    JSON.stringify({ ...profile, id, supabaseUserId, reviewStatus, identityStatus, selfieStatus, registeredRelationship }),
    timestamp,
    timestamp,
    supabaseUserId,
    reviewStatus,
    identityStatus,
    selfieStatus,
    registeredRelationship
  );

  // Notify admin queue about new submission
  try {
    db.prepare(`
      INSERT INTO admin_notifications (id, profile_id, user_id, type, channel, recipient, title, message, status, created_at)
      VALUES (?, ?, ?, 'profile_submitted', 'in_app', 'admin', ?, ?, 'delivered', ?)
    `).run(
      crypto.randomUUID(),
      id,
      id,
      "New Profile Submitted for Approval",
      `${profile.name || "A candidate"} (${id}) has completed registration and is awaiting admin review.`,
      timestamp
    );
  } catch {
    // Ignore notification errors
  }

  ensureSettingsRow(id);
  return getUserById(id);
}

export function updateUser(id, patch = {}) {
  const db = getDb();
  const existing = getUserRowById(id);
  if (!existing) return null;

  const merged = { ...safeParse(existing.profile_json), ...patch, id };
  const timestamp = nowIso();
  const supabaseUserId = patch.supabaseUserId !== undefined ? patch.supabaseUserId : (existing.supabase_user_id || null);

  // If candidate was in needs_correction and is saving changes, put back in pending review
  let reviewStatus = patch.reviewStatus !== undefined ? patch.reviewStatus : (existing.review_status || "pending");
  if (existing.review_status === "needs_correction" && (patch.resubmitted || patch.reviewStatus === undefined)) {
    reviewStatus = "pending";
  }
  const identityStatus = patch.identityStatus !== undefined ? patch.identityStatus : (existing.identity_status || "pending");
  const selfieStatus = patch.selfieStatus !== undefined ? patch.selfieStatus : (existing.selfie_status || "verified");
  const registeredRelationship = patch.registeredRelationship !== undefined ? patch.registeredRelationship : (existing.registered_relationship || "Self");
  const status = patch.status !== undefined ? patch.status : (existing.status || "active");

  db.prepare(`
    UPDATE users SET
      phone = ?, email = ?, name = ?, age = ?, dob = ?, gender = ?, city = ?,
      state = ?, country = ?, profession = ?, education = ?, religious_practice = ?,
      marital_status = ?, verified = ?, avatar = ?, onboarded = ?, status = ?,
      profile_json = ?, updated_at = ?, supabase_user_id = ?,
      review_status = ?, identity_status = ?, selfie_status = ?, registered_relationship = ?
    WHERE id = ?
  `).run(
    merged.phone ?? existing.phone ?? null,
    merged.email ?? existing.email ?? null,
    merged.name ?? existing.name,
    merged.age ?? existing.age ?? null,
    merged.dob ?? existing.dob ?? null,
    merged.gender ?? existing.gender ?? null,
    merged.city ?? existing.city ?? null,
    merged.state ?? existing.state ?? null,
    merged.country ?? existing.country ?? "India",
    merged.profession ?? existing.profession ?? null,
    merged.education ?? existing.education ?? null,
    merged.religiousPractice ?? existing.religious_practice ?? null,
    merged.maritalStatus ?? existing.marital_status ?? null,
    merged.verified === false ? 0 : 1,
    merged.avatar ?? existing.avatar ?? null,
    merged.onboarded === false ? 0 : 1,
    status,
    JSON.stringify(merged),
    timestamp,
    supabaseUserId,
    reviewStatus,
    identityStatus,
    selfieStatus,
    registeredRelationship,
    id
  );

  return getUserById(id);
}

export function deleteUser(id) {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM interests WHERE from_id = ? OR to_id = ?").run(id, id);
    db.prepare("DELETE FROM shortlists WHERE user_id = ? OR profile_id = ?").run(id, id);
    db.prepare("DELETE FROM blocks WHERE user_id = ? OR blocked_id = ?").run(id, id);
    db.prepare("DELETE FROM reports WHERE reporter_id = ? OR reported_id = ?").run(id, id);
    db.prepare("DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE user_id = ?)").run(id);
    db.prepare("DELETE FROM chats WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM notifications WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM settings WHERE user_id = ?").run(id);
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Profiles                                                            */
/* ------------------------------------------------------------------ */

export function listProfiles({ excludeId = null, state = null, search = null, gender = null, page = 1, limit = 50, includeUnapproved = false } = {}) {
  const db = getDb();
  const clauses = ["role != 'support'"];
  const args = [];

  // Public match browsing only displays approved, active profiles!
  if (!includeUnapproved) {
    clauses.push("review_status = 'approved'");
    clauses.push("status = 'active'");
  }

  if (excludeId) {
    clauses.push("id != ?");
    args.push(excludeId);
  }
  if (state && state !== "all") {
    clauses.push("state = ?");
    args.push(state);
  }
  if (gender && gender !== "all") {
    clauses.push("gender = ?");
    args.push(gender);
  }
  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    clauses.push("(lower(name) LIKE ? OR lower(COALESCE(profession,'')) LIKE ? OR lower(COALESCE(city,'')) LIKE ?)");
    args.push(q, q, q);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = db.prepare(`SELECT COUNT(*) AS count FROM users ${where}`).get(...args).count;

  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const rows = db
    .prepare(`SELECT * FROM users ${where} ORDER BY verified DESC, name ASC LIMIT ? OFFSET ?`)
    .all(...args, safeLimit, offset);

  return { profiles: rows.map(rowToProfile), total, page: safePage, limit: safeLimit };
}

/* ------------------------------------------------------------------ */
/* Interests                                                           */
/* ------------------------------------------------------------------ */

function buildInterestCard(row, peerId) {
  const profile = safeParse(row.profile_json);
  return {
    id: row.interest_id,
    profileId: peerId,
    name: row.peer_name,
    age: row.peer_age,
    profession: row.peer_profession,
    city: [row.peer_city, row.peer_state].filter(Boolean).join(", "),
    avatar: row.peer_avatar,
    timestamp: relativeTime(row.created_at),
    note: row.note,
    verified: !!row.peer_verified,
    status: row.status,
    declineReason: row.reason || null,
    photoHidden: profile.photoHidden || false
  };
}

const INTEREST_SELECT = `
  SELECT i.id AS interest_id, i.from_id, i.to_id, i.status, i.note, i.reason,
         i.blocked, i.created_at, i.updated_at,
         u.name AS peer_name, u.age AS peer_age, u.profession AS peer_profession,
         u.city AS peer_city, u.state AS peer_state, u.avatar AS peer_avatar,
         u.verified AS peer_verified, u.profile_json
  FROM interests i
  JOIN users u ON u.id = %PEER%
`;

export function listInterests(userId) {
  const db = getDb();

  const receivedRows = db
    .prepare(`${INTEREST_SELECT.replace("%PEER%", "i.from_id")} WHERE i.to_id = ? AND i.status = 'pending' ORDER BY i.created_at DESC`)
    .all(userId);

  const sentRows = db
    .prepare(`${INTEREST_SELECT.replace("%PEER%", "i.to_id")} WHERE i.from_id = ? ORDER BY i.created_at DESC`)
    .all(userId);

  const declinedRows = db
    .prepare(`${INTEREST_SELECT.replace("%PEER%", "i.from_id")} WHERE i.to_id = ? AND i.status = 'declined' ORDER BY i.updated_at DESC`)
    .all(userId);

  return {
    received: receivedRows.map((r) => buildInterestCard(r, r.from_id)),
    sent: sentRows.map((r) => buildInterestCard(r, r.to_id)),
    declined: declinedRows.map((r) => ({ ...buildInterestCard(r, r.from_id), blocked: !!r.blocked }))
  };
}

export function sendInterest(userId, profile, note) {
  const db = getDb();
  if (!profile || !profile.id) return null;
  if (profile.id === userId) return null;

  const existing = db
    .prepare("SELECT id FROM interests WHERE from_id = ? AND to_id = ?")
    .get(userId, profile.id);

  const message = note || "Assalamu Alaikum. Seeking connection in the light of Sunnah.";
  const timestamp = nowIso();

  let id;
  if (existing) {
    id = existing.id;
    db.prepare("UPDATE interests SET note = ?, status = 'pending', updated_at = ? WHERE id = ?")
      .run(message, timestamp, id);
  } else {
    id = newId("sent");
    db.prepare(`
      INSERT INTO interests (id, from_id, to_id, status, note, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', ?, ?, ?)
    `).run(id, userId, profile.id, message, timestamp, timestamp);
  }

  return {
    id,
    profileId: profile.id,
    name: profile.name,
    age: profile.age,
    profession: profile.profession,
    city: profile.city,
    avatar: profile.avatar,
    timestamp: "Just now",
    status: "pending",
    note: message
  };
}

export function acceptInterest(userId, requestId) {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM interests WHERE id = ? AND to_id = ?")
    .get(requestId, userId);

  if (!row) return null;

  const timestamp = nowIso();
  db.prepare("UPDATE interests SET status = 'accepted', updated_at = ? WHERE id = ?").run(timestamp, requestId);

  // Mirror the acceptance as an outbound "accepted" interest so it shows up in
  // the sender's "Sent" tab as well.
  const outgoing = db
    .prepare("SELECT id FROM interests WHERE from_id = ? AND to_id = ?")
    .get(userId, row.from_id);

  if (!outgoing) {
    db.prepare(`
      INSERT INTO interests (id, from_id, to_id, status, note, created_at, updated_at)
      VALUES (?, ?, ?, 'accepted', ?, ?, ?)
    `).run(newId("sent"), userId, row.from_id, row.note, timestamp, timestamp);
  } else {
    db.prepare("UPDATE interests SET status = 'accepted', updated_at = ? WHERE id = ?").run(timestamp, outgoing.id);
  }

  const chat = ensureChat(userId, row.from_id);
  if (chat) {
    addMessage(chat.id, "them",
      "Assalamu Alaikum! Mubarak on our match. Looking forward to discussing compatibility with our families.",
      false);
  }

  addNotification(userId, "match", "New Match Confirmed", "An interest was accepted. You can now chat with your match.");

  const card = db
    .prepare(`${INTEREST_SELECT.replace("%PEER%", "i.from_id")} WHERE i.id = ?`)
    .get(requestId);
  return card ? buildInterestCard(card, card.from_id) : null;
}

export function declineInterest(userId, requestId, reason, shouldBlock) {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM interests WHERE id = ? AND to_id = ?")
    .get(requestId, userId);
  if (!row) return null;

  const timestamp = nowIso();
  db.prepare("UPDATE interests SET status = 'declined', reason = ?, blocked = ?, updated_at = ? WHERE id = ?")
    .run(reason || null, shouldBlock ? 1 : 0, timestamp, requestId);

  if (shouldBlock) {
    addBlock(userId, row.from_id);
  }

  return { ...row, status: "declined", reason: reason || null, blocked: !!shouldBlock };
}

export function undoDecline(userId, requestId) {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM interests WHERE id = ? AND to_id = ? AND status = 'declined'")
    .get(requestId, userId);
  if (!row) return null;

  db.prepare("UPDATE interests SET status = 'pending', reason = NULL, updated_at = ? WHERE id = ?")
    .run(nowIso(), requestId);

  const card = db
    .prepare(`${INTEREST_SELECT.replace("%PEER%", "i.from_id")} WHERE i.id = ?`)
    .get(requestId);
  return card ? buildInterestCard(card, card.from_id) : null;
}

/* ------------------------------------------------------------------ */
/* Chats & messages                                                    */
/* ------------------------------------------------------------------ */

export function ensureChat(userId, peerId) {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM chats WHERE user_id = ? AND peer_id = ?")
    .get(userId, peerId);
  if (existing) return existing;

  const id = peerId === SUPPORT_ID ? "chat-support" : `chat-${peerId}`;
  const timestamp = nowIso();
  db.prepare(`
    INSERT INTO chats (id, user_id, peer_id, unread, created_at, updated_at)
    VALUES (?, ?, ?, 0, ?, ?)
  `).run(id, userId, peerId, timestamp, timestamp);
  return db.prepare("SELECT * FROM chats WHERE id = ?").get(id);
}

export function addMessage(chatId, sender, text, read = true) {
  const db = getDb();
  const id = newId("msg");
  const timestamp = nowIso();

  db.prepare(`
    INSERT INTO messages (id, chat_id, sender, text, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, chatId, sender, text, read ? 1 : 0, timestamp);

  db.prepare("UPDATE chats SET updated_at = ? WHERE id = ?").run(timestamp, chatId);
  return { id, chatId, sender, text, read, created_at: timestamp };
}

export function listChats(userId) {
  const db = getDb();
  const chatRows = db
    .prepare("SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId);

  const messageStmt = db.prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC");
  const peerStmt = db.prepare("SELECT * FROM users WHERE id = ?");

  return chatRows.map((chat) => {
    const peerRow = peerStmt.get(chat.peer_id);
    const peer = peerRow ? safeParse(peerRow.profile_json) : {};
    const isSupport = chat.peer_id === SUPPORT_ID;

    return {
      id: chat.id,
      matchId: chat.peer_id,
      name: peerRow?.name || peer.name || "Risthay Member",
      age: peerRow?.age ?? peer.age ?? null,
      avatar: peerRow?.avatar ?? peer.avatar ?? null,
      city: peerRow?.city ?? peer.city ?? "India",
      profession: peerRow?.profession ?? peer.profession ?? null,
      verified: !!peerRow?.verified,
      unreadCount: chat.unread || 0,
      lastSeen: isSupport ? "Always Active" : (peer.activeStatus || "Online Now"),
      isSupport,
      photoHidden: peer.photoHidden || false,
      messages: messageStmt.all(chat.id).map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        time: formatClockTime(m.created_at),
        read: !!m.read
      }))
    };
  });
}

export function sendChatMessage(userId, chatId, text) {
  const db = getDb();
  const chat = db.prepare("SELECT * FROM chats WHERE id = ? AND user_id = ?").get(chatId, userId);
  if (!chat) return null;

  const message = addMessage(chatId, "me", text.trim(), true);
  return {
    id: message.id,
    sender: "me",
    text: message.text,
    time: formatClockTime(message.created_at),
    read: true
  };
}

export function markChatRead(userId, chatId) {
  const db = getDb();
  db.prepare("UPDATE messages SET read = 1 WHERE chat_id = ?").run(chatId);
  db.prepare("UPDATE chats SET unread = 0 WHERE id = ? AND user_id = ?").run(chatId, userId);
}

/* ------------------------------------------------------------------ */
/* Shortlists                                                          */
/* ------------------------------------------------------------------ */

export function listShortlists(userId) {
  const rows = getDb()
    .prepare("SELECT profile_id FROM shortlists WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId);
  return rows.map((r) => r.profile_id);
}

export function addShortlist(userId, profileId) {
  getDb()
    .prepare("INSERT OR IGNORE INTO shortlists (user_id, profile_id, created_at) VALUES (?, ?, ?)")
    .run(userId, profileId, nowIso());
  return listShortlists(userId);
}

export function removeShortlist(userId, profileId) {
  getDb().prepare("DELETE FROM shortlists WHERE user_id = ? AND profile_id = ?").run(userId, profileId);
  return listShortlists(userId);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function ensureSettingsRow(userId) {
  getDb().prepare(`
    INSERT OR IGNORE INTO settings (user_id, global_photo_blur, hide_name, wali_in_chat,
      notify_matches, notify_messages, notify_interests, updated_at)
    VALUES (?, 0, 0, 1, 1, 1, 1, ?)
  `).run(userId, nowIso());
}

export function getSettings(userId) {
  ensureSettingsRow(userId);
  const row = getDb().prepare("SELECT * FROM settings WHERE user_id = ?").get(userId);
  return {
    globalPhotoBlur: !!row.global_photo_blur,
    hideName: !!row.hide_name,
    waliInChat: !!row.wali_in_chat,
    notifyMatches: !!row.notify_matches,
    notifyMessages: !!row.notify_messages,
    notifyInterests: !!row.notify_interests
  };
}

export function updateSettings(userId, patch = {}) {
  ensureSettingsRow(userId);
  const current = getSettings(userId);
  const next = {
    globalPhotoBlur: patch.globalPhotoBlur !== undefined ? asBool(patch.globalPhotoBlur) : current.globalPhotoBlur,
    hideName: patch.hideName !== undefined ? asBool(patch.hideName) : current.hideName,
    waliInChat: patch.waliInChat !== undefined ? asBool(patch.waliInChat) : current.waliInChat,
    notifyMatches: patch.notifyMatches !== undefined ? asBool(patch.notifyMatches) : current.notifyMatches,
    notifyMessages: patch.notifyMessages !== undefined ? asBool(patch.notifyMessages) : current.notifyMessages,
    notifyInterests: patch.notifyInterests !== undefined ? asBool(patch.notifyInterests) : current.notifyInterests
  };

  getDb().prepare(`
    UPDATE settings SET global_photo_blur = ?, hide_name = ?, wali_in_chat = ?,
      notify_matches = ?, notify_messages = ?, notify_interests = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    next.globalPhotoBlur ? 1 : 0,
    next.hideName ? 1 : 0,
    next.waliInChat ? 1 : 0,
    next.notifyMatches ? 1 : 0,
    next.notifyMessages ? 1 : 0,
    next.notifyInterests ? 1 : 0,
    nowIso(),
    userId
  );

  return next;
}

/* ------------------------------------------------------------------ */
/* Subscription                                                        */
/* ------------------------------------------------------------------ */

export function getSubscription(userId) {
  const row = getUserRowById(userId);
  if (!row) return null;
  return {
    isPremium: isPremiumActive(row),
    plan: row.premium_plan || null,
    premiumUntil: row.premium_until || null
  };
}

export function activateSubscription(userId, planId) {
  const plan = getPlanById(planId);
  if (!plan) return null;

  const db = getDb();
  const row = getUserRowById(userId);
  if (!row) return null;

  const base = isPremiumActive(row) && row.premium_until
    ? new Date(row.premium_until)
    : new Date();
  const until = new Date(base);
  until.setMonth(until.getMonth() + plan.months);

  db.prepare(`
    UPDATE users SET is_premium = 1, premium_plan = ?, premium_until = ?, updated_at = ?
    WHERE id = ?
  `).run(plan.id, until.toISOString(), nowIso(), userId);

  addNotification(
    userId,
    "system",
    "Premium Activated",
    `Your ${plan.name} Premium membership is now active. Enjoy unlimited halal chat and photos.`
  );

  return {
    subscription: getSubscription(userId),
    planId: plan.id
  };
}

/* ------------------------------------------------------------------ */
/* Blocks, reports, notifications                                      */
/* ------------------------------------------------------------------ */

export function addBlock(userId, blockedId) {
  getDb()
    .prepare("INSERT OR IGNORE INTO blocks (user_id, blocked_id, created_at) VALUES (?, ?, ?)")
    .run(userId, blockedId, nowIso());
}

export function listBlocks(userId) {
  return getDb()
    .prepare("SELECT blocked_id FROM blocks WHERE user_id = ?")
    .all(userId)
    .map((r) => r.blocked_id);
}

export function addReport(reporterId, reportedId, reason, details) {
  const id = newId("report");
  getDb().prepare(`
    INSERT INTO reports (id, reporter_id, reported_id, reason, details, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'open', ?)
  `).run(id, reporterId, reportedId, sanitize(reason, 120), sanitize(details, 2000), nowIso());
  return { id };
}

export function addNotification(userId, type, title, body) {
  const id = newId("notif");
  getDb().prepare(`
    INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
    VALUES (?, ?, ?, ?, ?, NULL, 0, ?)
  `).run(id, userId, type, title, body || null, nowIso());
  return { id };
}

export function listNotifications(userId) {
  const rows = getDb()
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .all(userId);
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    read: !!r.read,
    timestamp: relativeTime(r.created_at)
  }));
}

/* ------------------------------------------------------------------ */
/* Bootstrap payload                                                   */
/* ------------------------------------------------------------------ */

export function getBootstrapData(userId) {
  const user = getUserById(userId);
  const isPremium = !!user?.isPremium;
  const { profiles } = listProfiles({ excludeId: userId, limit: 100 });
  const interests = listInterests(userId);
  const chats = isPremium ? listChats(userId) : [];

  return {
    user,
    isPremium,
    chatLocked: !isPremium,
    profiles,
    shortlistedIds: listShortlists(userId),
    receivedInterests: interests.received,
    sentInterests: interests.sent,
    declinedInterests: interests.declined,
    chats,
    settings: getSettings(userId),
    stats: {
      views: 12,
      shortlisted: listShortlists(userId).length,
      sent: interests.sent.length,
      received: interests.received.length,
      unreadMessages: chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
    },
    notifications: listNotifications(userId)
  };
}

export { DEMO_USER_ID, SUPPORT_ID, calculateAge };
