"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Code,
  Eye,
  User
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "60" });
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.admin_name?.toLowerCase().includes(q) ||
      log.admin_email?.toLowerCase().includes(q) ||
      log.target_id?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q)
    );
  });

  const getActionBadge = (action) => {
    switch (action) {
      case "profile_approval":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Profile Approved</span>;
      case "profile_rejection":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Profile Rejected</span>;
      case "profile_correction_request":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700" }}>Correction Requested</span>;
      case "document_access":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#e0e7ff", color: "#3730a3", fontSize: "0.75rem", fontWeight: "700" }}>Document Inspected</span>;
      case "subscription_grant":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#ecfdf5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Subscription Granted</span>;
      case "subscription_revoke":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Subscription Revoked</span>;
      case "admin_login":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#4b5563", fontSize: "0.75rem", fontWeight: "600" }}>Admin Login</span>;
      default:
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#374151", fontSize: "0.75rem" }}>{action}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <History size={24} color="#059669" /> Immutable Security Audit Logs
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Append-only tamper-evident timeline of all administrative interventions, document reviews, and role changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.55rem 1rem",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#374151",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "1.25rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by administrator name, email, or target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 0.75rem 0.55rem 2.2rem",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="">All Actions</option>
          <option value="profile_approval">Profile Approval</option>
          <option value="profile_rejection">Profile Rejection</option>
          <option value="profile_correction_request">Correction Request</option>
          <option value="document_access">Document Inspection</option>
          <option value="subscription_grant">Subscription Grant</option>
          <option value="subscription_extend">Subscription Extend</option>
          <option value="subscription_revoke">Subscription Revoke</option>
          <option value="admin_login">Admin Login</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Timestamp</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Administrator</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Action</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Target Type</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Target ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No audit records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString("en-IN") : "Recent"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "700", color: "#111827" }}>{log.admin_name || "Admin"}</div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{log.admin_email}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {getActionBadge(log.action)}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textTransform: "capitalize", color: "#4b5563" }}>
                      {log.target_type || "N/A"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#059669" }}>
                      {log.target_id || "—"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "0.35rem 0.65rem",
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "#374151",
                          cursor: "pointer"
                        }}
                      >
                        <Code size={13} /> View JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON PAYLOAD INSPECTOR MODAL */}
      {selectedLog && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            maxWidth: "600px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Code size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#111827" }}>
                  Audit Event Payload Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.82rem", color: "#4b5563", marginBottom: "1rem" }}>
              <div><strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Admin:</strong> {selectedLog.admin_name} ({selectedLog.admin_email})</div>
              <div><strong>Target:</strong> {selectedLog.target_type} #{selectedLog.target_id}</div>
              <div><strong>Recorded At:</strong> {selectedLog.created_at}</div>
            </div>

            <pre style={{
              background: "#0f172a",
              color: "#38bdf8",
              padding: "1rem",
              borderRadius: "10px",
              fontSize: "0.8rem",
              overflowX: "auto",
              fontFamily: "monospace",
              lineHeight: 1.5
            }}>
              {(() => {
                try {
                  const parsed = typeof selectedLog.details_json === "string"
                    ? JSON.parse(selectedLog.details_json)
                    : selectedLog.details_json;
                  return JSON.stringify(parsed, null, 2);
                } catch {
                  return selectedLog.details_json || "{}";
                }
              })()}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
