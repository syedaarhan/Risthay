"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ExternalLink,
  ShieldCheck,
  PlayCircle,
  Database
} from "lucide-react";

export default function AdminGoogleSheetsPage() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSyncState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/google-sheets");
      const data = await res.json();
      if (data?.success) {
        setState(data);
      }
    } catch (err) {
      console.error("Failed to load Google Sheets sync state:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncState();
  }, [fetchSyncState]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/google-sheets", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Sync failed");
      }
      showToast(data.message || "Google Sheets synchronization completed!");
      fetchSyncState();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !state) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={32} />
        <p style={{ color: "#4b5563" }}>Checking Google Sheets synchronization status...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {toast && (
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
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <FileSpreadsheet size={24} color="#059669" /> Google Sheets Profile Sync
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Automated, deduplicated secondary synchronization for administrative tracking and cross-team review.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={syncing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.6rem 1.25rem",
            background: "#059669",
            color: "#ffffff",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "0.88rem",
            border: "none",
            cursor: syncing ? "not-allowed" : "pointer",
            boxShadow: "0 2px 4px rgba(5,150,105,0.25)"
          }}
        >
          <PlayCircle size={16} /> {syncing ? "Synchronizing..." : "Trigger Manual Sync"}
        </button>
      </div>

      {/* Configuration Status Card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "9999px",
                background: state?.isConfigured ? "#10b981" : "#f59e0b"
              }} />
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0, color: "#111827" }}>
                {state?.isConfigured ? "Google Cloud Service Account Active" : "Standby / Local Simulation Mode"}
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5, maxWidth: "680px" }}>
              {state?.isConfigured
                ? "Connected with authorized Google Workspace Service Account. Profile submission events and status updates synchronize with automated row deduplication."
                : "Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SHEETS_SPREADSHEET_ID) are currently pending in production environment. Synchronization operations simulate and track record states in the internal ledger until cloud credentials are provided."}
            </p>
          </div>

          <div style={{ background: "#f9fafb", padding: "0.8rem 1.25rem", borderRadius: "10px", border: "1px solid #f3f4f6", fontSize: "0.85rem" }}>
            <div style={{ color: "#6b7280", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "700" }}>Linked Spreadsheet ID</div>
            <div style={{ fontWeight: "700", color: "#111827", fontFamily: "monospace" }}>{state?.sheetId || "Pending Configuration"}</div>
          </div>
        </div>

        {/* Sync Metric Counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid #f3f4f6" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "700" }}>PROFILES SYNCHRONIZED</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#059669" }}>{state?.totalSynced || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "700" }}>PENDING SYNC QUEUE</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#d97706" }}>{state?.totalPending || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "700" }}>PRIMARY SOURCE OF TRUTH</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", display: "flex", alignItems: "center", gap: "4px" }}>
              <Database size={16} color="#059669" /> Supabase PostgreSQL
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "700" }}>ROW DEDUPLICATION</div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>
              Enforced by Profile ID
            </div>
          </div>
        </div>
      </div>

      {/* Strict Privacy & UIDAI Compliance Notice */}
      <div style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "14px",
        padding: "1.25rem 1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        <Lock size={20} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.85rem", color: "#166534", lineHeight: 1.5 }}>
          <strong>Aadhaar & Sensitive Document Privacy Safeguard:</strong> In strict compliance with Indian privacy laws and UIDAI guidelines, <strong>NO full Aadhaar numbers, unmasked identity files, or private photo storage URLs are ever written to Google Sheets</strong>. Only non-sensitive operational fields (Profile ID, Candidate Name, Demographics, Approval Status, and Verification Flag) are synced.
        </div>
      </div>

      {/* Sync Ledger Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#111827" }}>
            Recent Synchronization Ledger
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Profile ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Sheet Row ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Sync Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Last Synced At</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Sync Note</th>
              </tr>
            </thead>
            <tbody>
              {!state?.recentLogs || state.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: "#6b7280" }}>
                    No sync records in the ledger yet. Click &quot;Trigger Manual Sync&quot; to initialize.
                  </td>
                </tr>
              ) : (
                state.recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: "700", color: "#111827" }}>
                      PID #{log.profile_id}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", color: "#6b7280" }}>
                      {log.sheet_row_id || "ROW-AUTO"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        background: log.sync_status === "synced" ? "#d1fae5" : "#fee2e2",
                        color: log.sync_status === "synced" ? "#065f46" : "#991b1b",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <CheckCircle2 size={12} /> {log.sync_status}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {log.last_synced_at ? new Date(log.last_synced_at).toLocaleString("en-IN") : "Recent"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "#4b5563" }}>
                      {log.error_message || "Deduplicated row updated successfully"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
