"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building,
  Smartphone
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter) params.set("status", statusFilter);
      if (methodFilter) params.set("method", methodFilter);

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setPayments(data.payments || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setTotalRevenue(data.totalRevenueInr || 0);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, methodFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "upi":
        return <Smartphone size={14} color="#059669" />;
      case "bank_transfer":
        return <Building size={14} color="#2563eb" />;
      default:
        return <CreditCard size={14} color="#7c3aed" />;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Receipt size={24} color="#059669" /> Payments & Revenue Ledger
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Audit log of all confirmed subscriber transactions in Indian Rupees (INR).
          </p>
        </div>

        <button
          onClick={fetchPayments}
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

      {/* Revenue Summary Card */}
      <div style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        color: "#ffffff",
        borderRadius: "16px",
        padding: "1.5rem 1.75rem",
        marginBottom: "1.5rem",
        boxShadow: "0 10px 20px rgba(6,78,59,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0", fontWeight: "700" }}>
            Confirmed Matrimony Revenue
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "800", marginTop: "4px", display: "flex", alignItems: "center" }}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#d1fae5", marginTop: "4px" }}>
            * Strictly counts confirmed subscriber payments. Complimentary memberships do not produce false revenue.
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", background: "rgba(255,255,255,0.1)", padding: "0.75rem 1.25rem", borderRadius: "12px" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#d1fae5" }}>Total Transactions</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>{totalCount}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#d1fae5" }}>Currency</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>INR (₹)</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
        <form onSubmit={handleSearchSubmit} style={{ flex: "1 1 260px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by member name, UTR / transaction ID, or profile ID..."
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
          <button
            type="submit"
            style={{
              padding: "0.55rem 1rem",
              background: "#059669",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Filter
          </button>
        </form>

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
          <option value="">All Payment Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="">All Methods</option>
          <option value="upi">UPI</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash / Direct</option>
        </select>
      </div>

      {/* Ledger Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Transaction / UTR ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Subscriber</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Amount</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Method</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Channel</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No payment records match the query.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#111827", fontSize: "0.82rem" }}>
                        {p.transaction_id || p.id}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "700", color: "#111827" }}>{p.member_name || "Member"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>PID: {p.profile_id}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ fontWeight: "800", color: "#065f46", fontSize: "0.95rem" }}>
                        ₹{p.amount?.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", textTransform: "uppercase", fontSize: "0.78rem", fontWeight: "700", color: "#374151" }}>
                        {getMethodIcon(p.payment_method)}
                        {p.payment_method || "UPI"}
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {p.is_manual ? (
                        <span style={{ padding: "2px 6px", borderRadius: "4px", background: "#fef3c7", color: "#92400e", fontSize: "0.72rem", fontWeight: "700" }}>
                          Admin Assigned
                        </span>
                      ) : (
                        <span style={{ padding: "2px 6px", borderRadius: "4px", background: "#f0fdf4", color: "#166534", fontSize: "0.72rem", fontWeight: "700" }}>
                          Online Payment
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {p.payment_status === "confirmed" ? (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} /> Confirmed
                        </span>
                      ) : (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {p.created_at ? new Date(p.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                    </td>
                  </tr>
                ))
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
            Showing <strong>{payments.length}</strong> of <strong>{totalCount}</strong> transactions
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
    </div>
  );
}
