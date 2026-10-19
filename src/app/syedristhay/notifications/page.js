"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Mail,
  Smartphone,
  Send,
  Sparkles,
  Crown
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data?.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getEventBadge = (type) => {
    switch (type) {
      case "profile_approved":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Profile Approved</span>;
      case "profile_rejected":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Profile Rejected</span>;
      case "needs_correction":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700" }}>Corrections Requested</span>;
      case "subscription_granted":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#ecfdf5", color: "#047857", fontSize: "0.75rem", fontWeight: "700" }}>Subscription Granted</span>;
      default:
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#374151", fontSize: "0.75rem", fontWeight: "600" }}>{type}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={24} color="#059669" /> Notification Dispatch & Audit Log
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Automated alerts sent to members on profile approval, rejection, corrections, and subscription events.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
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

      {/* Delivery Channels Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>In-App Member Inbox</span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.72rem", fontWeight: "700" }}>Active</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
            Instant notifications delivered directly into the candidate dashboard notification bell.
          </p>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>Email Delivery (SMTP/Resend)</span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.72rem", fontWeight: "700" }}>Requires SMTP_KEY</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
            Email dispatch requires RESEND_API_KEY or SMTP credentials in server environment.
          </p>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>WhatsApp Business API</span>
            <span style={{ padding: "2px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#6b7280", fontSize: "0.72rem", fontWeight: "700" }}>Optional Add-on</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>
            Enterprise WhatsApp template notifications for verified Risthay matches.
          </p>
        </div>
      </div>

      {/* Notifications Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#111827" }}>
            Triggered Notification History ({notifications.length})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Recipient Member</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Event Type</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Subject / Title</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Message Body</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Channel</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Delivery Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Sent Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No notifications recorded yet.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "700", color: "#111827" }}>{n.memberName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>UID: {n.userId}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {getEventBadge(n.type)}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontWeight: "600", color: "#111827" }}>
                      {n.title}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", color: "#4b5563", maxWidth: "340px", fontSize: "0.82rem", lineHeight: 1.4 }}>
                      {n.body}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#374151" }}>
                      {n.channel}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "#d1fae5",
                        color: "#065f46",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <CheckCircle2 size={12} /> {n.status}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recent"}
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
