"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Key,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New admin form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("profile_reviewer");

  const [toast, setToast] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data?.success) {
        setUsers(data.adminUsers || []);
      }
    } catch (err) {
      console.error("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to create administrator");
      }
      setModalOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      showToast(data.message || "Administrator account created successfully!");
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newActiveState = user.active ? 0 : 1;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, active: newActiveState })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to update status");
      }
      showToast(`Admin account ${newActiveState ? "activated" : "deactivated"}.`);
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const getRoleBadge = (roleKey) => {
    switch (roleKey) {
      case "super_admin":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700" }}>Super Admin</span>;
      case "profile_reviewer":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Profile Reviewer</span>;
      case "membership_manager":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#dbeafe", color: "#1e40af", fontSize: "0.75rem", fontWeight: "700" }}>Membership Manager</span>;
      case "read_only_admin":
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#4b5563", fontSize: "0.75rem", fontWeight: "600" }}>Read-Only Admin</span>;
      default:
        return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#374151", fontSize: "0.75rem" }}>{roleKey}</span>;
    }
  };

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
            <ShieldAlert size={24} color="#059669" /> Admin Users & RBAC Permissions
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Enforce role-based access control with server-side permission checks and session revocation.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
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
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(5,150,105,0.25)"
          }}
        >
          <UserPlus size={16} /> Add Administrator
        </button>
      </div>

      {/* Role Matrix Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { title: "Super Admin", desc: "Full permissions: Profile approvals, manual subscriptions, role management & system settings.", tag: "Full Control" },
          { title: "Profile Reviewer", desc: "Authorized to inspect candidate profiles, verify Aadhaar e-KYC, approve, reject, or request corrections.", tag: "Review Operations" },
          { title: "Membership Manager", desc: "Authorized to grant, renew, extend, or revoke paid and complimentary premium plans.", tag: "Subscription Ops" },
          { title: "Read-Only Admin", desc: "Permitted to view dashboards, registry data, and audit ledgers without write or modify permissions.", tag: "Auditing" }
        ].map((r, i) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: "700", color: "#111827", fontSize: "0.95rem" }}>{r.title}</span>
              <span style={{ fontSize: "0.72rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", color: "#4b5563" }}>{r.tag}</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.4 }}>{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#111827" }}>
            Authorized Administrator Accounts ({users.length})
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#4b5563" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Administrator</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Assigned Role</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Account Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Last Login</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Created</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading administrator accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "700", color: "#111827" }}>{u.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{u.email}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {getRoleBadge(u.role)}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {u.active ? (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Active</span>
                      ) : (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Inactive</span>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#4b5563" }}>
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString("en-IN") : "Never"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "Recent"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      {u.role !== "super_admin" && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            background: u.active ? "#fee2e2" : "#d1fae5",
                            color: u.active ? "#991b1b" : "#065f46",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {modalOpen && (
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
            maxWidth: "500px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>
              Add New Administrator
            </h3>

            <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farooq Ansari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Staff Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. farooq@risthay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Assigned Permission Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="profile_reviewer">Profile Reviewer (Approve / Reject / Corrections)</option>
                  <option value="membership_manager">Membership Manager (Subscriptions & Payments)</option>
                  <option value="read_only_admin">Read-Only Admin (Auditing)</option>
                  <option value="super_admin">Super Administrator (Full System Control)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  style={{
                    padding: "0.55rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#4b5563",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer"
                  }}
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
