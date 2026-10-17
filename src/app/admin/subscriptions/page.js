"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  IndianRupee,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Crown,
  User
} from "lucide-react";
import { SUBSCRIPTION_PLANS, computeCalendarMonthExpiry } from "@/lib/subscriptions";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Modals
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  // Form states for Grant Modal
  const [grantProfileId, setGrantProfileId] = useState("");
  const [grantPlanId, setGrantPlanId] = useState("plan_3m");
  const [grantStartDate, setGrantStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [grantPaymentMethod, setGrantPaymentMethod] = useState("upi");
  const [grantPaymentStatus, setGrantPaymentStatus] = useState("paid");
  const [grantPaymentRef, setGrantPaymentRef] = useState("");
  const [grantNotes, setGrantNotes] = useState("");
  const [grantSubmitting, setGrantSubmitting] = useState(false);

  // Form states for Extend Modal
  const [extendMonths, setExtendMonths] = useState("3");
  const [extendNotes, setExtendNotes] = useState("");
  const [extendSubmitting, setExtendSubmitting] = useState(false);

  // Form states for Revoke Modal
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (planFilter) params.set("planId", planFilter);

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setSubscriptions(data.subscriptions || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery, planFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Compute calculated preview expiry date for grant modal
  const selectedPlanObj = SUBSCRIPTION_PLANS[grantPlanId] || SUBSCRIPTION_PLANS.plan_3m;
  const calculatedExpiryDate = computeCalendarMonthExpiry(
    grantStartDate,
    selectedPlanObj?.durationMonths || 3
  );

  const handleGrantSubmit = async (e) => {
    e.preventDefault();
    if (!grantProfileId.trim()) {
      alert("Please provide the candidate's Profile ID or User ID.");
      return;
    }

    try {
      setGrantSubmitting(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant",
          profileId: grantProfileId.trim(),
          planId: grantPlanId,
          startDate: grantStartDate,
          assignmentMethod: grantPaymentMethod === "complimentary" ? "complimentary" : "manual",
          paymentMethod: grantPaymentMethod,
          paymentStatus: grantPaymentMethod === "complimentary" ? "not_applicable" : grantPaymentStatus,
          paymentReference: grantPaymentRef,
          notes: grantNotes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to grant subscription");
      }

      setGrantModalOpen(false);
      showToast(data.message || "Subscription successfully granted!");
      // Reset form
      setGrantProfileId("");
      setGrantNotes("");
      setGrantPaymentRef("");
      fetchSubscriptions();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setGrantSubmitting(false);
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      setExtendSubmitting(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extend",
          subscriptionId: selectedSub.id,
          monthsToAdd: extendMonths,
          notes: extendNotes
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to extend subscription");
      }

      setExtendModalOpen(false);
      showToast(data.message || "Subscription extended successfully!");
      fetchSubscriptions();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setExtendSubmitting(false);
    }
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!revokeReason.trim()) {
      alert("Please enter a mandatory revocation reason.");
      return;
    }

    try {
      setRevokeSubmitting(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          subscriptionId: selectedSub.id,
          reason: revokeReason
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to revoke subscription");
      }

      setRevokeModalOpen(false);
      showToast(data.message || "Subscription revoked.");
      fetchSubscriptions();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRevokeSubmitting(false);
    }
  };

  const getStatusBadge = (sub) => {
    if (sub.status === "revoked") {
      return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Revoked</span>;
    }
    const isExpired = new Date(sub.end_date).getTime() < Date.now();
    if (isExpired) {
      return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#f3f4f6", color: "#4b5563", fontSize: "0.75rem", fontWeight: "700" }}>Expired</span>;
    }
    const diffDays = Math.ceil((new Date(sub.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700" }}>Expiring in {diffDays}d</span>;
    }
    return <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Active</span>;
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
            <CreditCard size={24} color="#059669" /> Subscription & Membership Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Grant, renew, extend, or revoke memberships across the 3 official plans: 3M (₹499), 6M (₹899), 12M (₹1,199).
          </p>
        </div>

        <button
          onClick={() => setGrantModalOpen(true)}
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
          <PlusCircle size={16} /> Grant Subscription
        </button>
      </div>

      {/* Plan Price Reference Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <div key={plan.id} style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>{plan.name}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#065f46" }}>₹{plan.priceInr}</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{plan.durationMonths} Months Access</div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crown size={18} color="#059669" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
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
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by candidate name, profile ID, or user ID..."
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
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="">All Plans</option>
          <option value="plan_3m">3 Months (₹499)</option>
          <option value="plan_6m">6 Months (₹899)</option>
          <option value="plan_12m">12 Months (₹1,199)</option>
        </select>

        <button
          onClick={fetchSubscriptions}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "0.55rem 1rem",
            background: "#f3f4f6",
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

      {/* Subscriptions Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Member / Candidate</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Plan</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Start Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Expiry Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Payment / Method</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Assigned By</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const planMeta = SUBSCRIPTION_PLANS[sub.plan_id] || { name: sub.plan_id, priceInr: 0 };
                  const isRevoked = sub.status === "revoked";
                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: "700", color: "#111827" }}>{sub.user_name || "Member"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>PID: {sub.profile_id}</div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{ fontWeight: "700", color: "#065f46" }}>{planMeta.name}</span>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>₹{sub.amount_paid || planMeta.priceInr}</div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "#4b5563" }}>
                        {new Date(sub.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>

                      <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "#4b5563" }}>
                        {new Date(sub.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        {getStatusBadge(sub)}
                      </td>

                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ textTransform: "capitalize", fontWeight: "600", color: "#374151" }}>
                          {sub.payment_method || "UPI"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: sub.is_manual ? "#d97706" : "#059669" }}>
                          {sub.is_manual ? "Manual Admin Grant" : "Online Gateway"}
                        </div>
                      </td>

                      <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#4b5563" }}>
                        {sub.assigned_by || "System"}
                      </td>

                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        {!isRevoked && (
                          <div style={{ display: "inline-flex", gap: "4px" }}>
                            <button
                              onClick={() => { setSelectedSub(sub); setExtendModalOpen(true); }}
                              style={{
                                padding: "0.35rem 0.65rem",
                                background: "#ecfdf5",
                                color: "#065f46",
                                border: "1px solid #a7f3d0",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => { setSelectedSub(sub); setRevokeModalOpen(true); }}
                              style={{
                                padding: "0.35rem 0.65rem",
                                background: "#fee2e2",
                                color: "#991b1b",
                                border: "1px solid #fca5a5",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1rem",
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          fontSize: "0.85rem",
          color: "#4b5563"
        }}>
          <div>
            Showing <strong>{subscriptions.length}</strong> of <strong>{totalCount}</strong> subscriptions
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem" }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                opacity: page >= totalPages ? 0.5 : 1
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. GRANT SUBSCRIPTION MODAL */}
      {grantModalOpen && (
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
            maxWidth: "550px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Crown size={22} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>
                  Grant Premium Subscription
                </h3>
              </div>
              <button
                onClick={() => setGrantModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Candidate Profile ID / User ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 or candidate email"
                  value={grantProfileId}
                  onChange={(e) => setGrantProfileId(e.target.value)}
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
                  Select Subscription Plan *
                </label>
                <select
                  value={grantPlanId}
                  onChange={(e) => setGrantPlanId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="plan_3m">3 Months — ₹499</option>
                  <option value="plan_6m">6 Months — ₹899</option>
                  <option value="plan_12m">12 Months — ₹1,199</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={grantStartDate}
                    onChange={(e) => setGrantStartDate(e.target.value)}
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
                    Calculated Expiry (Calendar Month)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={calculatedExpiryDate ? new Date(calculatedExpiryDate).toLocaleDateString("en-IN") : "Calculating..."}
                    style={{
                      width: "100%",
                      padding: "0.55rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      color: "#065f46"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                    Payment Method
                  </label>
                  <select
                    value={grantPaymentMethod}
                    onChange={(e) => setGrantPaymentMethod(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.55rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="upi">UPI (GPay/PhonePe/Paytm)</option>
                    <option value="bank_transfer">Bank NEFT/IMPS</option>
                    <option value="cash">Cash / Direct</option>
                    <option value="complimentary">Complimentary (₹0 Revenue)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                    Payment Status
                  </label>
                  <select
                    value={grantPaymentStatus}
                    onChange={(e) => setGrantPaymentStatus(e.target.value)}
                    disabled={grantPaymentMethod === "complimentary"}
                    style={{
                      width: "100%",
                      padding: "0.55rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.85rem"
                    }}
                  >
                    <option value="paid">Paid & Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {grantPaymentMethod !== "complimentary" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                    Payment Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref: 310928471928"
                    value={grantPaymentRef}
                    onChange={(e) => setGrantPaymentRef(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.55rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Grant Reason / Internal Notes
                </label>
                <textarea
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="Record why this subscription was assigned manually..."
                  rows={2}
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
                  onClick={() => setGrantModalOpen(false)}
                  disabled={grantSubmitting}
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
                  disabled={grantSubmitting}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: grantSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {grantSubmitting ? "Granting..." : "Confirm & Grant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EXTEND MODAL */}
      {extendModalOpen && selectedSub && (
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
            maxWidth: "480px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>
              Extend Membership
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#4b5563" }}>
              Member: <strong>{selectedSub.user_name}</strong> (PID: {selectedSub.profile_id})
            </p>

            <form onSubmit={handleExtendSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Months to Add
                </label>
                <select
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="1">+1 Month</option>
                  <option value="3">+3 Months</option>
                  <option value="6">+6 Months</option>
                  <option value="12">+12 Months</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Extension Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complimentary 1-month courtesy extension"
                  value={extendNotes}
                  onChange={(e) => setExtendNotes(e.target.value)}
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
                  onClick={() => setExtendModalOpen(false)}
                  disabled={extendSubmitting}
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
                  disabled={extendSubmitting}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: extendSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {extendSubmitting ? "Extending..." : "Confirm Extension"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. REVOKE MODAL */}
      {revokeModalOpen && selectedSub && (
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
            maxWidth: "480px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: "800", color: "#dc2626" }}>
              Revoke Subscription
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#4b5563" }}>
              This will revoke premium privileges immediately for <strong>{selectedSub.user_name}</strong>.
            </p>

            <form onSubmit={handleRevokeSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Mandatory Revocation Reason *
                </label>
                <textarea
                  required
                  placeholder="e.g. Payment bounced / refund requested / member request..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setRevokeModalOpen(false)}
                  disabled={revokeSubmitting}
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
                  disabled={revokeSubmitting}
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    fontWeight: "700",
                    cursor: revokeSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {revokeSubmitting ? "Revoking..." : "Confirm Revocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
