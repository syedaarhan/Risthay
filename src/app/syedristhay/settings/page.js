"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Lock,
  Database,
  FileSpreadsheet,
  IndianRupee,
  CheckCircle2,
  Bell,
  Save,
  Server
} from "lucide-react";

export default function AdminSettingsPage() {
  const [currency] = useState("INR (₹)");
  const [requireAadhaar, setRequireAadhaar] = useState(true);
  const [autoSyncSheets, setAutoSyncSheets] = useState(true);
  const [sessionTimeoutDays, setSessionTimeoutDays] = useState("7");
  const [photoPrivacyDefault, setPhotoPrivacyDefault] = useState("visible");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "4rem" }}>
      {saved && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "1rem 1.5rem",
          background: "#064e3b",
          color: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "600"
        }}>
          <CheckCircle2 size={18} />
          Settings updated successfully!
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <Settings size={24} color="#059669" /> Platform & Security Settings
        </h1>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
          Configure matrimony verification criteria, Indian Rupee billing rules, and storage security.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Section 1: Matrimonial Verification Rules */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#111827", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={18} color="#059669" /> Matrimonial Profile Verification Guidelines
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#111827" }}>Mandatory Admin Approval</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Profiles must be reviewed and approved by an authorized administrator before appearing in public searches.
                </div>
              </div>
              <input type="checkbox" defaultChecked disabled style={{ width: "18px", height: "18px", accentColor: "#059669" }} />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#111827" }}>UIDAI Compliance (Aadhaar Masking)</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Enforce strict masking of identity identifiers (show only XXXX-XXXX-####) in all admin screens.
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireAadhaar}
                onChange={(e) => setRequireAadhaar(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#059669" }}
              />
            </label>
          </div>
        </div>

        {/* Section 2: Currency & Plans */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#111827", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <IndianRupee size={18} color="#059669" /> Currency & Membership Structure
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Primary Platform Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#f9fafb", fontWeight: "700", color: "#065f46", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Admin Session Expiry (Days)
              </label>
              <select
                value={sessionTimeoutDays}
                onChange={(e) => setSessionTimeoutDays(e.target.value)}
                style={{ width: "100%", padding: "0.55rem", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "0.85rem" }}
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days (Default)</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Integrations & Storage */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#111827", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={18} color="#059669" /> Storage & Cloud Integrations
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", color: "#4b5563" }}>
            <div>
              <strong>Supabase PostgreSQL Database:</strong> Active & Connected (Source of Truth)
            </div>
            <div>
              <strong>Private Verification Bucket:</strong> <code>identity-documents</code> (Signed URLs only, max TTL: 60s)
            </div>
            <div>
              <strong>Public Profile Gallery:</strong> <code>profile-photos</code> (Modesty check verified)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.65rem 1.5rem",
              background: "#059669",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(5,150,105,0.25)"
            }}
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
