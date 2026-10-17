// SQLite persistence layer for the Risthay backend.
// Uses Node's built-in `node:sqlite` (Node 22.5+) so there is no native
// compilation step and no external dependency to install.

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import {
  PROFILES_DATA,
  INITIAL_RECEIVED_INTERESTS,
  INITIAL_SENT_INTERESTS,
  INITIAL_CHATS
} from "../../data/mockData.js";

const DEMO_USER_ID = "RS-72104";
const SUPPORT_ID = "support";

function resolveDatabaseFile() {
  const configured = process.env.RISTHAY_DB_PATH;
  if (configured) return configured;
  return path.join(process.cwd(), "data", "risthay.db");
}

function createSchema(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id                TEXT PRIMARY KEY,
      phone             TEXT UNIQUE,
      email             TEXT,
      password_hash     TEXT,
      name              TEXT NOT NULL,
      age               INTEGER,
      dob               TEXT,
      gender            TEXT,
      city              TEXT,
      state             TEXT,
      country           TEXT DEFAULT 'India',
      profession        TEXT,
      education         TEXT,
      religious_practice TEXT,
      marital_status    TEXT,
      verified          INTEGER DEFAULT 0,
      avatar            TEXT,
      role              TEXT DEFAULT 'member',
      is_demo           INTEGER DEFAULT 0,
      onboarded         INTEGER DEFAULT 0,
      status            TEXT DEFAULT 'active',
      is_premium        INTEGER DEFAULT 0,
      premium_plan      TEXT,
      premium_until     TEXT,
      profile_json      TEXT NOT NULL DEFAULT '{}',
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token       TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      expires_at  TEXT NOT NULL,
      user_agent  TEXT,
      ip          TEXT
    );

    CREATE TABLE IF NOT EXISTS interests (
      id          TEXT PRIMARY KEY,
      from_id     TEXT NOT NULL,
      to_id       TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending',
      note        TEXT,
      reason      TEXT,
      blocked     INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      UNIQUE(from_id, to_id)
    );

    CREATE TABLE IF NOT EXISTS shortlists (
      user_id     TEXT NOT NULL,
      profile_id  TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      PRIMARY KEY(user_id, profile_id)
    );

    CREATE TABLE IF NOT EXISTS blocks (
      user_id     TEXT NOT NULL,
      blocked_id  TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      PRIMARY KEY(user_id, blocked_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id          TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      reason      TEXT,
      details     TEXT,
      status      TEXT DEFAULT 'open',
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      peer_id     TEXT NOT NULL,
      unread      INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      UNIQUE(user_id, peer_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT PRIMARY KEY,
      chat_id     TEXT NOT NULL,
      sender      TEXT NOT NULL,
      text        TEXT NOT NULL,
      read        INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      body        TEXT,
      data        TEXT,
      read        INTEGER DEFAULT 0,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id            TEXT PRIMARY KEY,
      global_photo_blur  INTEGER DEFAULT 0,
      hide_name          INTEGER DEFAULT 0,
      wali_in_chat       INTEGER DEFAULT 1,
      notify_matches     INTEGER DEFAULT 1,
      notify_messages    INTEGER DEFAULT 1,
      notify_interests   INTEGER DEFAULT 1,
      updated_at         TEXT NOT NULL
    );

    /* --- ADMIN & VERIFICATION SYSTEM TABLES --- */

    CREATE TABLE IF NOT EXISTS admin_users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'super_admin',
      active        INTEGER DEFAULT 1,
      last_login_at TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token       TEXT PRIMARY KEY,
      admin_id    TEXT NOT NULL,
      email       TEXT NOT NULL,
      role        TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      expires_at  TEXT NOT NULL,
      user_agent  TEXT,
      ip          TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id                TEXT PRIMARY KEY,
      user_id           TEXT NOT NULL,
      profile_id        TEXT NOT NULL,
      plan_id           TEXT NOT NULL,
      plan_name         TEXT NOT NULL,
      amount            INTEGER NOT NULL,
      start_date        TEXT NOT NULL,
      end_date          TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'active',
      assignment_method TEXT NOT NULL DEFAULT 'manual',
      payment_method    TEXT,
      payment_status    TEXT NOT NULL DEFAULT 'paid',
      payment_reference TEXT,
      assigned_by       TEXT NOT NULL,
      notes             TEXT,
      created_at        TEXT NOT NULL,
      updated_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id                TEXT PRIMARY KEY,
      subscription_id   TEXT,
      user_id           TEXT NOT NULL,
      profile_id        TEXT NOT NULL,
      amount            INTEGER NOT NULL,
      currency          TEXT DEFAULT 'INR',
      payment_method    TEXT NOT NULL,
      payment_status    TEXT NOT NULL DEFAULT 'confirmed',
      transaction_id    TEXT,
      is_manual         INTEGER DEFAULT 1,
      recorded_by       TEXT,
      notes             TEXT,
      created_at        TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id           TEXT PRIMARY KEY,
      admin_id     TEXT,
      admin_email  TEXT,
      admin_name   TEXT,
      action       TEXT NOT NULL,
      target_type  TEXT NOT NULL,
      target_id    TEXT NOT NULL,
      details_json TEXT,
      ip_address   TEXT,
      user_agent   TEXT,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile_reviews (
      id             TEXT PRIMARY KEY,
      profile_id     TEXT NOT NULL,
      admin_id       TEXT NOT NULL,
      admin_email    TEXT NOT NULL,
      decision       TEXT NOT NULL,
      reason         TEXT,
      user_message   TEXT,
      internal_notes TEXT,
      checklist_json TEXT,
      created_at     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS identity_documents (
      id              TEXT PRIMARY KEY,
      profile_id      TEXT NOT NULL,
      doc_type        TEXT NOT NULL DEFAULT 'Aadhaar Card',
      masked_id       TEXT,
      file_path       TEXT,
      status          TEXT NOT NULL DEFAULT 'pending',
      reviewer_id     TEXT,
      reviewer_notes  TEXT,
      reviewed_at     TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS google_sheets_sync (
      id              TEXT PRIMARY KEY,
      profile_id      TEXT UNIQUE NOT NULL,
      sheet_row_id    TEXT,
      sync_status     TEXT NOT NULL DEFAULT 'pending',
      error_message   TEXT,
      last_synced_at  TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_notifications (
      id         TEXT PRIMARY KEY,
      profile_id TEXT,
      user_id    TEXT,
      type       TEXT NOT NULL,
      channel    TEXT NOT NULL DEFAULT 'in_app',
      recipient  TEXT,
      title      TEXT NOT NULL,
      message    TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'delivered',
      error      TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key        TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_interests_to       ON interests(to_id, status);
    CREATE INDEX IF NOT EXISTS idx_interests_from     ON interests(from_id, status);
    CREATE INDEX IF NOT EXISTS idx_messages_chat      ON messages(chat_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user      ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user      ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON audit_logs(action, created_at);
  `);
}

function ensureColumns(database) {
  const existing = new Set(
    database.prepare("PRAGMA table_info(users)").all().map((row) => row.name)
  );
  const additions = [
    ["is_premium", "INTEGER DEFAULT 0"],
    ["premium_plan", "TEXT"],
    ["premium_until", "TEXT"],
    ["supabase_user_id", "TEXT"],
    ["review_status", "TEXT DEFAULT 'approved'"],
    ["identity_status", "TEXT DEFAULT 'verified'"],
    ["selfie_status", "TEXT DEFAULT 'verified'"],
    ["reviewed_by", "TEXT"],
    ["reviewed_at", "TEXT"],
    ["rejection_reason", "TEXT"],
    ["correction_notes", "TEXT"],
    ["internal_notes", "TEXT"],
    ["registered_relationship", "TEXT DEFAULT 'Self'"]
  ];
  for (const [column, definition] of additions) {
    if (existing.has(column)) continue;
    database.exec(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
  }
  database.exec("CREATE INDEX IF NOT EXISTS idx_users_supabase ON users(supabase_user_id);");
  database.exec("CREATE INDEX IF NOT EXISTS idx_users_review ON users(review_status);");
}

function nowIso() {
  return new Date().toISOString();
}

function insertUser(database, profile, { phone = null, passwordHash = null, demo = false, onboarded = true } = {}) {
  const stmt = database.prepare(`
    INSERT INTO users (
      id, phone, email, password_hash, name, age, dob, gender, city, state, country,
      profession, education, religious_practice, marital_status, verified, avatar,
      role, is_demo, onboarded, status, profile_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    profile.id,
    phone,
    profile.email || null,
    passwordHash,
    profile.name || "Risthay Member",
    profile.age ?? null,
    profile.dob || null,
    profile.gender || null,
    profile.city || null,
    profile.state || null,
    profile.country || "India",
    profile.profession || null,
    profile.education || null,
    profile.religiousPractice || null,
    profile.maritalStatus || null,
    profile.verified ? 1 : 0,
    profile.avatar || null,
    profile.role || "member",
    demo ? 1 : 0,
    onboarded ? 1 : 0,
    profile.status || "active",
    JSON.stringify(profile),
    nowIso(),
    nowIso()
  );
}

function seedDatabase(database) {
  const { count } = database.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (count > 0) return;

  const demoProfile = PROFILES_DATA.find((p) => p.id === DEMO_USER_ID) || PROFILES_DATA[0];

  database.exec("BEGIN");
  try {
    // Primary demo account (Ahmed Raza) — password: risthay123
    insertUser(database, {
      ...demoProfile,
      phone: "+919876543210",
      email: "ahmed.raza@example.com",
      onboarded: true
    }, {
      phone: "+919876543210",
      passwordHash: hashSeedPassword("risthay123"),
      demo: true
    });

    // All other members become browsable profiles.
    for (const profile of PROFILES_DATA) {
      if (profile.id === DEMO_USER_ID) continue;
      insertUser(database, profile, { demo: false });
    }

    // Support concierge (cannot be messaged with interests).
    insertUser(database, {
      id: SUPPORT_ID,
      name: "Risthay Halal Support",
      gender: null,
      profession: "Verified Halal Moderator",
      city: "India Care Team",
      state: "India",
      avatar: null,
      verified: true,
      role: "support"
    }, { onboarded: true });

    seedInterests(database, demoProfile);
    seedChats(database);
    seedShortlists(database);

    database.prepare(`
      INSERT INTO settings (user_id, global_photo_blur, hide_name, wali_in_chat,
        notify_matches, notify_messages, notify_interests, updated_at)
      VALUES (?, 0, 0, 1, 1, 1, 1, ?)
    `).run(DEMO_USER_ID, nowIso());

    database.prepare(`
      INSERT INTO notifications (id, user_id, type, title, body, data, read, created_at)
      VALUES (?, ?, 'system', ?, ?, NULL, 1, ?)
    `).run(
      crypto.randomUUID(),
      DEMO_USER_ID,
      "Welcome to Risthay",
      "Your halal matrimony journey begins here. Explore verified profiles and send Salaams.",
      nowIso()
    );

    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function seedInterests(database, demoProfile) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO interests (id, from_id, to_id, status, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Interests received BY the demo user.
  for (const item of INITIAL_RECEIVED_INTERESTS) {
    insert.run(
      item.id,
      item.profileId,
      DEMO_USER_ID,
      item.status || "pending",
      item.note || null,
      nowIso(),
      nowIso()
    );
  }

  // Interests sent BY the demo user (skip the self-interest row in the mock data).
  for (const item of INITIAL_SENT_INTERESTS) {
    if (item.profileId === demoProfile.id) continue;
    insert.run(
      item.id,
      DEMO_USER_ID,
      item.profileId,
      item.status || "pending",
      item.note || null,
      nowIso(),
      nowIso()
    );
  }
}

function seedChats(database) {
  const insertChat = database.prepare(`
    INSERT OR IGNORE INTO chats (id, user_id, peer_id, unread, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertMessage = database.prepare(`
    INSERT OR IGNORE INTO messages (id, chat_id, sender, text, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const chat of INITIAL_CHATS) {
    insertChat.run(chat.id, DEMO_USER_ID, chat.matchId, chat.unreadCount || 0, nowIso(), nowIso());
    for (const message of chat.messages) {
      insertMessage.run(
        `${chat.id}-${message.id}`,
        chat.id,
        message.sender,
        message.text,
        message.read ? 1 : 0,
        nowIso()
      );
    }
  }
}

function seedShortlists(database) {
  const insert = database.prepare(`
    INSERT OR IGNORE INTO shortlists (user_id, profile_id, created_at) VALUES (?, ?, ?)
  `);
  for (const id of ["RS-84920", "RS-91034"]) {
    insert.run(DEMO_USER_ID, id, nowIso());
  }
}

function hashSeedPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function seedAdminData(database) {
  const { count } = database.prepare("SELECT COUNT(*) AS count FROM admin_users").get();
  if (count > 0) return;

  database.exec("BEGIN");
  try {
    const adminPass = hashSeedPassword("admin123");
    const insertAdmin = database.prepare(`
      INSERT OR IGNORE INTO admin_users (id, email, password_hash, name, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `);

    insertAdmin.run("admin-1", "admin@risthay.com", adminPass, "Director Syed Irfan", "super_admin", nowIso(), nowIso());
    insertAdmin.run("admin-2", "reviewer@risthay.com", adminPass, "Farhana Begum", "profile_reviewer", nowIso(), nowIso());
    insertAdmin.run("admin-3", "manager@risthay.com", adminPass, "Tariq Mansoor", "membership_manager", nowIso(), nowIso());
    insertAdmin.run("admin-4", "readonly@risthay.com", adminPass, "Zubair Hashmi", "read_only_admin", nowIso(), nowIso());

    // Update statuses on sample users for realistic dashboard metrics
    database.prepare("UPDATE users SET review_status = 'approved', identity_status = 'verified', selfie_status = 'verified' WHERE id = 'RS-72104'").run();
    database.prepare("UPDATE users SET review_status = 'approved', identity_status = 'verified', selfie_status = 'verified', registered_relationship = 'Son' WHERE id = 'RS-84920'").run();
    database.prepare("UPDATE users SET review_status = 'approved', identity_status = 'verified', selfie_status = 'verified', registered_relationship = 'Daughter' WHERE id = 'RS-91034'").run();
    database.prepare("UPDATE users SET review_status = 'pending', identity_status = 'pending', selfie_status = 'needs_manual_review', registered_relationship = 'Self' WHERE id = 'RS-63219'").run();
    database.prepare("UPDATE users SET review_status = 'needs_correction', identity_status = 'pending', selfie_status = 'verified', correction_notes = 'Please re-upload a recent portrait photograph and clarify highest education degree.', registered_relationship = 'Sister' WHERE id = 'RS-51982'").run();
    database.prepare("UPDATE users SET review_status = 'rejected', rejection_reason = 'Duplicate registration detected with existing profile RS-72104.', registered_relationship = 'Self' WHERE id = 'RS-47201'").run();

    // Calculate dates for sample subscriptions
    const today = new Date();
    const plus3m = new Date(today);
    plus3m.setMonth(plus3m.getMonth() + 3);

    const plus4days = new Date(today.getTime() + 4 * 86400000); // Expiring in 4 days!
    const past1m = new Date(today.getTime() - 30 * 86400000);
    const past4m = new Date(today.getTime() - 120 * 86400000);

    const insertSub = database.prepare(`
      INSERT OR IGNORE INTO subscriptions (
        id, user_id, profile_id, plan_id, plan_name, amount, start_date, end_date,
        status, assignment_method, payment_method, payment_status, payment_reference,
        assigned_by, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPay = database.prepare(`
      INSERT OR IGNORE INTO payments (
        id, subscription_id, user_id, profile_id, amount, currency, payment_method,
        payment_status, transaction_id, is_manual, recorded_by, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?)
    `);

    // Sub 1: Active 3 Months (Ahmed Raza) - ₹499 Paid via UPI
    insertSub.run(
      "sub-101", "RS-72104", "RS-72104", "plan_3m", "3 Months", 499,
      nowIso(), plus3m.toISOString(), "active", "manual", "upi", "paid",
      "UPI-98214710", "Director Syed Irfan", "Promotional offline signup at Islamic Matrimony Expo", nowIso(), nowIso()
    );
    insertPay.run(
      "pay-101", "sub-101", "RS-72104", "RS-72104", 499,
      "upi", "confirmed", "UPI-98214710", 1, "admin@risthay.com", "Confirmed via PhonePe UPI", nowIso()
    );

    // Sub 2: Expiring in 4 days (Ayesha Khan) - ₹899 6 Months
    insertSub.run(
      "sub-102", "RS-84920", "RS-84920", "plan_6m", "6 Months", 899,
      past4m.toISOString(), plus4days.toISOString(), "active", "manual", "bank_transfer", "paid",
      "NEFT-ICICI-00412", "Tariq Mansoor", "Direct bank NEFT verification", past4m.toISOString(), nowIso()
    );
    insertPay.run(
      "pay-102", "sub-102", "RS-84920", "RS-84920", 899,
      "bank_transfer", "confirmed", "NEFT-ICICI-00412", 1, "manager@risthay.com", "Bank statement verified", past4m.toISOString()
    );

    // Sub 3: Expired Subscription (Fatima Noor) - ₹499
    insertSub.run(
      "sub-103", "RS-91034", "RS-91034", "plan_3m", "3 Months", 499,
      past4m.toISOString(), past1m.toISOString(), "expired", "manual", "cash", "paid",
      "CASH-REC-108", "Tariq Mansoor", "Office cash payment receipt", past4m.toISOString(), past1m.toISOString()
    );

    // Sub 4: Complimentary Subscription (Zainab Parveen) - ₹0 Revenue
    insertSub.run(
      "sub-104", "RS-63219", "RS-63219", "plan_12m", "12 Months", 0,
      nowIso(), plus3m.toISOString(), "active", "complimentary", "complimentary", "complimentary",
      "COURTESY-AALIMA", "Director Syed Irfan", "Scholar courtesy membership granted with zero fee", nowIso(), nowIso()
    );

    // Seed audit logs
    const insertAudit = database.prepare(`
      INSERT OR IGNORE INTO audit_logs (id, admin_id, admin_email, admin_name, action, target_type, target_id, details_json, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '127.0.0.1', ?)
    `);

    insertAudit.run(
      crypto.randomUUID(), "admin-1", "admin@risthay.com", "Director Syed Irfan",
      "profile_approve", "profile", "RS-72104", JSON.stringify({ name: "Ahmed Raza", notes: "Aadhaar verified" }), nowIso()
    );
    insertAudit.run(
      crypto.randomUUID(), "admin-3", "manager@risthay.com", "Tariq Mansoor",
      "subscription_grant", "subscription", "sub-101", JSON.stringify({ plan: "plan_3m", amount: 499, method: "upi" }), nowIso()
    );

    // Seed system settings
    database.prepare(`
      INSERT OR IGNORE INTO system_settings (key, value_json, updated_at)
      VALUES (?, ?, ?)
    `).run("google_sheets", JSON.stringify({
      enabled: false,
      sheetId: "",
      serviceAccountConfigured: false,
      lastSyncAt: null,
      autoSyncNewProfiles: true
    }), nowIso());

    database.prepare(`
      INSERT OR IGNORE INTO system_settings (key, value_json, updated_at)
      VALUES (?, ?, ?)
    `).run("notifications_config", JSON.stringify({
      inAppEnabled: true,
      emailEnabled: false,
      whatsappEnabled: false,
      provider: "mock"
    }), nowIso());

    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    console.error("Failed to seed admin data:", err);
  }
}

/**
 * Lazily create (and cache) the singleton database connection.
 * Global caching keeps a single connection across hot reloads in dev.
 */
export function getDb() {
  if (globalThis.__risthay_db) return globalThis.__risthay_db;

  const file = resolveDatabaseFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const database = new DatabaseSync(file);
  database.exec("PRAGMA journal_mode = WAL;");
  createSchema(database);
  ensureColumns(database);
  seedDatabase(database);
  seedAdminData(database);

  globalThis.__risthay_db = database;
  return database;
}

export { DEMO_USER_ID, SUPPORT_ID };
