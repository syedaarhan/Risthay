"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CreditCard,
  IndianRupee,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  RefreshCw,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [resStats, resProfiles] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/profiles?status=pending&limit=5")
      ]);

      const dataStats = await resStats.json();
      const dataProfiles = await resProfiles.json();

      if (dataStats?.success && dataStats.stats) {
        setStats(dataStats.stats);
      }
      if (dataProfiles?.success && dataProfiles.profiles) {
        setRecentApplications(dataProfiles.profiles);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontWeight: "600", fontSize: "14px" }}>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #059669 100%)",
        borderRadius: "20px",
        padding: "24px 28px",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 10px 30px rgba(5,150,105,0.2)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontFamily: "var(--font-arabic)", fontSize: "20px", color: "#a7f3d0" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Administrative Intelligence & Governance
          </h1>
          <p style={{ fontSize: "13px", color: "#d1fae5", marginTop: "4px" }}>
            Real-time status of matrimonial profile submissions, Aadhaar KYC verification, and membership subscriptions across India.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer"
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Critical Action Alerts */}
      {(s.pendingApprovals > 0 || s.expiringIn7Days > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {s.pendingApprovals > 0 && (
            <div style={{
              background: "#fffbeb",
              border: "1.5px solid #fde68a",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(245,158,11,0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d97706"
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#92400e" }}>
                    {s.pendingApprovals} Profile{s.pendingApprovals > 1 ? "s" : ""} Pending Review
                  </div>
                  <div style={{ fontSize: "11px", color: "#b45309" }}>
                    Awaiting administrator approval to appear in search
                  </div>
                </div>
              </div>
              <Link
                href="/syedristhay/applications"
                style={{
                  padding: "7px 12px",
                  borderRadius: "10px",
                  background: "#d97706",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>Review</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {s.expiringIn7Days > 0 && (
            <div style={{
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(239,68,68,0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626"
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#991b1b" }}>
                    {s.expiringIn7Days} Membership{s.expiringIn7Days > 1 ? "s" : ""} Expiring in 7 Days
                  </div>
                  <div style={{ fontSize: "11px", color: "#b91c1c" }}>
                    Follow up for renewal or manual extension
                  </div>
                </div>
              </div>
              <Link
                href="/syedristhay/subscriptions?status=expiring_soon"
                style={{
                  padding: "7px 12px",
                  borderRadius: "10px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>Manage</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "16px"
      }}>
        {/* Total Users */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Total Registered</span>
            <Users size={18} color="#059669" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>
            {s.totalUsers ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginTop: "4px" }}>
            +{s.newRegistrations7d ?? 0} new in last 7 days
          </div>
        </div>

        {/* Submitted Profiles */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Profiles Completed</span>
            <FileCheck2 size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a" }}>
            {s.submittedProfiles ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            {Math.round(((s.submittedProfiles || 0) / Math.max(s.totalUsers || 1, 1)) * 100)}% completion rate
          </div>
        </div>

        {/* Pending Approvals */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Pending Approvals</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#d97706" }}>
            {s.pendingApprovals ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#b45309", fontWeight: "600", marginTop: "4px" }}>
            Needs reviewer action
          </div>
        </div>

        {/* Approved Profiles */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Approved Profiles</span>
            <UserCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#059669" }}>
            {s.approvedProfiles ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginTop: "4px" }}>
            Live on platform
          </div>
        </div>

        {/* Needs Correction */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Needs Correction</span>
            <AlertCircle size={18} color="#f97316" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#ea580c" }}>
            {s.needsCorrection ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#c2410c", marginTop: "4px" }}>
            Awaiting member updates
          </div>
        </div>

        {/* Active Premium Subscriptions */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Active Premium</span>
            <CreditCard size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#7c3aed" }}>
            {s.activeMemberships ?? 0}
          </div>
          <div style={{ fontSize: "11px", color: "#6d28d9", fontWeight: "600", marginTop: "4px" }}>
            {s.expiredMemberships ?? 0} expired memberships
          </div>
        </div>

        {/* Confirmed Revenue (INR) */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "18px",
          border: "1.5px solid #a7f3d0",
          boxShadow: "0 2px 8px rgba(5,150,105,0.05)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#065f46" }}>Confirmed Revenue (INR)</span>
            <IndianRupee size={18} color="#059669" />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#059669" }}>
            ₹{(s.totalRevenueInr || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
            Paid: ₹{(s.manualRevenueInr || 0).toLocaleString("en-IN")} manual • ₹0 complimentary
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "20px"
      }}>
        {/* Profile Approval Distribution Donut Chart */}
        <div style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "22px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
            Profile Approval Breakdown
          </h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "16px" }}>
            {/* SVG Donut */}
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="transparent" stroke="#e2e8f0" strokeWidth="18" />
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="transparent"
                stroke="#059669"
                strokeWidth="18"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * (s.approvalDistribution?.approved || 0)) / Math.max(s.submittedProfiles || 1, 1)}
                transform="rotate(-90 70 70)"
              />
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="18"
                strokeDasharray="339.29"
                strokeDashoffset={339.29 - (339.29 * (s.approvalDistribution?.pending || 0)) / Math.max(s.submittedProfiles || 1, 1)}
                transform="rotate(90 70 70)"
                strokeOpacity="0.8"
              />
              <text x="70" y="74" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">
                {s.submittedProfiles || 0}
              </text>
              <text x="70" y="88" textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">
                PROFILES
              </text>
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#059669" }} />
                <span style={{ color: "#334155", fontWeight: "600" }}>Approved:</span>
                <strong>{s.approvalDistribution?.approved || 0}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#f59e0b" }} />
                <span style={{ color: "#334155", fontWeight: "600" }}>Pending Review:</span>
                <strong>{s.approvalDistribution?.pending || 0}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ea580c" }} />
                <span style={{ color: "#334155", fontWeight: "600" }}>Needs Correction:</span>
                <strong>{s.approvalDistribution?.needsCorrection || 0}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#ef4444" }} />
                <span style={{ color: "#334155", fontWeight: "600" }}>Rejected:</span>
                <strong>{s.approvalDistribution?.rejected || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "22px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
            Premium Plan Distribution
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 3 Months (₹499) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                <span>3 Months Plan (₹499)</span>
                <span>{s.subscriptionDistribution?.plan_3m || 0} active</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, ((s.subscriptionDistribution?.plan_3m || 0) / Math.max(s.activeMemberships || 1, 1)) * 100)}%`,
                  height: "100%",
                  background: "#059669",
                  borderRadius: "6px"
                }} />
              </div>
            </div>

            {/* 6 Months (₹899) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                <span>6 Months Plan (₹899)</span>
                <span>{s.subscriptionDistribution?.plan_6m || 0} active</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, ((s.subscriptionDistribution?.plan_6m || 0) / Math.max(s.activeMemberships || 1, 1)) * 100)}%`,
                  height: "100%",
                  background: "#10b981",
                  borderRadius: "6px"
                }} />
              </div>
            </div>

            {/* 12 Months (₹1,199) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                <span>12 Months Plan (₹1,199)</span>
                <span>{s.subscriptionDistribution?.plan_12m || 0} active</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, ((s.subscriptionDistribution?.plan_12m || 0) / Math.max(s.activeMemberships || 1, 1)) * 100)}%`,
                  height: "100%",
                  background: "#6366f1",
                  borderRadius: "6px"
                }} />
              </div>
            </div>

            {/* Free Tier */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                <span>Free Tier Members</span>
                <span>{s.subscriptionDistribution?.free || 0} members</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  background: "#cbd5e1",
                  borderRadius: "6px"
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications Review Queue */}
      <div style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              Pending Verification & Approval Queue
            </h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Submitted matrimonial profiles requiring administrator assessment
            </p>
          </div>

          <Link
            href="/syedristhay/applications"
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              textDecoration: "none"
            }}
          >
            <span>View All Applications</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "14px" }}>
            <UserCheck size={28} color="#059669" style={{ margin: "0 auto 8px" }} />
            <p style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>All caught up! Alhamdulillah.</p>
            <p style={{ fontSize: "12px" }}>There are currently no profiles pending approval.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 14px" }}>Profile</th>
                  <th style={{ padding: "10px 14px" }}>Gender & Age</th>
                  <th style={{ padding: "10px 14px" }}>Location</th>
                  <th style={{ padding: "10px 14px" }}>Created For</th>
                  <th style={{ padding: "10px 14px" }}>Identity Status</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((profile) => (
                  <tr key={profile.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={profile.avatar || "/images/ahmed.jpg"}
                          alt={profile.name}
                          style={{ width: "36px", height: "36px", borderRadius: "10px", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#0f172a" }}>{profile.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{profile.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px", color: "#334155" }}>
                      {profile.gender} • {profile.age} yrs
                    </td>

                    <td style={{ padding: "12px 14px", color: "#334155" }}>
                      {profile.city}, {profile.state}
                    </td>

                    <td style={{ padding: "12px 14px", color: "#334155" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "#f1f5f9",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}>
                        {profile.registered_relationship || "Self"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: profile.identity_status === "verified" ? "#ecfdf5" : "#fef3c7",
                        color: profile.identity_status === "verified" ? "#065f46" : "#92400e",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {profile.identity_status === "verified" ? "KYC Verified" : "Aadhaar Pending"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <Link
                        href={`/syedristhay/profiles/${profile.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          background: "#059669",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: "700",
                          textDecoration: "none"
                        }}
                      >
                        <span>Review</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
