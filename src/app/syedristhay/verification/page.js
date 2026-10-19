"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Camera,
  FileText
} from "lucide-react";

export default function AdminVerificationCenterPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Review modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [docDecision, setDocDecision] = useState("verified");
  const [selfieDecision, setSelfieDecision] = useState("verified");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/verifications?status=${statusFilter}&page=${page}&limit=15`);
      const data = await res.json();
      if (data?.success) {
        setItems(data.records || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load verifications:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedItem.id,
          docDecision,
          selfieDecision,
          notes: reviewNotes
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to update verification status");
      }
      setSelectedItem(null);
      showToast("Verification decision recorded successfully!");
      fetchVerifications();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
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
            <ShieldCheck size={24} color="#059669" /> Verification Center
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            UIDAI-compliant Aadhaar document validation & real-time live selfie biometric cross-referencing.
          </p>
        </div>

        <button
          onClick={fetchVerifications}
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

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        background: "#f3f4f6",
        padding: "4px",
        borderRadius: "10px",
        width: "fit-content",
        marginBottom: "1.25rem",
        gap: "4px"
      }}>
        {[
          { key: "pending", label: "Pending Verification" },
          { key: "verified", label: "Verified Records" },
          { key: "all", label: "All Items" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: "8px",
              border: "none",
              background: statusFilter === tab.key ? "#ffffff" : "transparent",
              color: statusFilter === tab.key ? "#064e3b" : "#4b5563",
              fontWeight: statusFilter === tab.key ? "700" : "500",
              fontSize: "0.85rem",
              boxShadow: statusFilter === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compliance Alert */}
      <div style={{
        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        <Lock size={18} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.82rem", color: "#334155", lineHeight: 1.5 }}>
          <strong>UIDAI & Digital Personal Data Protection (DPDP) Standard:</strong> All Aadhaar numbers must be masked to show only the last 4 digits (<code>XXXX-XXXX-####</code>). Access to unmasked documents or unencrypted storage URLs is strictly prohibited. Every document inspection is logged in the administrative audit ledger.
        </div>
      </div>

      {/* Verification Queue Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Applicant</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Document Type</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Masked Identity Identifier</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Doc Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Live Selfie Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Submitted Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading verification records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No verification records found in this queue.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={row.avatar || "/images/ahmed.jpg"}
                          alt={row.name}
                          style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#111827" }}>{row.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>ID: {row.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: "600", color: "#374151" }}>Aadhaar e-KYC</div>
                      <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>Masked Digital Copy</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#059669", background: "#f0fdf4", padding: "2px 6px", borderRadius: "4px" }}>
                        XXXX-XXXX-4812
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {row.identity_status === "verified" ? (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <AlertTriangle size={12} /> Pending Review
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      {row.selfie_status === "verified" ? (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Sparkles size={12} /> Liveness Passed
                        </span>
                      ) : (
                        <span style={{ padding: "3px 8px", borderRadius: "9999px", background: "#ffedd5", color: "#9a3412", fontSize: "0.75rem", fontWeight: "700" }}>
                          Pending
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "Recent"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => {
                          setSelectedItem(row);
                          setDocDecision("verified");
                          setSelfieDecision("verified");
                          setReviewNotes("");
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "0.45rem 0.85rem",
                          background: "#059669",
                          color: "#ffffff",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        <ShieldCheck size={14} /> Review & Verify
                      </button>
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
            Showing <strong>{items.length}</strong> of <strong>{totalCount}</strong> verification records
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

      {/* INSPECT & VERIFY MODAL */}
      {selectedItem && (
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={22} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#111827" }}>
                  Verify Applicant Identity
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#4b5563" }}>
              Applicant: <strong>{selectedItem.name}</strong> (ID: {selectedItem.id})
            </p>

            {/* Document Evidence Box */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "6px" }}>DOCUMENT DETAILS</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                <span>Type: <strong>Aadhaar e-KYC (Masked)</strong></span>
                <span>Number: <strong style={{ fontFamily: "monospace", color: "#059669" }}>XXXX-XXXX-4812</strong></span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                Name on record: <strong>{selectedItem.name}</strong>
              </div>
            </div>

            {/* Decision Selectors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Document Verification
                </label>
                <select
                  value={docDecision}
                  onChange={(e) => setDocDecision(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="verified">Approve & Mark Verified</option>
                  <option value="rejected">Reject Document</option>
                  <option value="needs_correction">Request Re-upload</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                  Live Selfie Liveness
                </label>
                <select
                  value={selfieDecision}
                  onChange={(e) => setSelfieDecision(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.85rem"
                  }}
                >
                  <option value="verified">Approve Match (Verified)</option>
                  <option value="rejected">Reject Match</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Reviewer Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional internal remarks for the audit trail..."
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setSelectedItem(null)}
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
                onClick={handleDecisionSubmit}
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
                {submitting ? "Saving..." : "Save Verification Decision"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
