"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UserX,
  Search,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Eye
} from "lucide-react";

export default function AdminRejectedProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status: "rejected"
      });

      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/profiles?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setProfiles(data.profiles || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch rejected profiles:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <UserX size={24} color="#dc2626" /> Rejected Profiles
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Applications declined due to policy violations, unclear photos, duplicate accounts, or false information.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
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

      {/* Search Bar */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "1.25rem",
        display: "flex",
        gap: "0.75rem",
        alignItems: "center"
      }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: "1", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search rejected candidates by name, profile ID, or email..."
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
              background: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </form>
      </div>

      {/* Rejected Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>City & State</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Rejection Reason</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Reviewed By</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Rejection Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#dc2626" }} size={24} />
                    Loading rejected records...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No rejected profiles found in the registry.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={p.avatar || "/images/ahmed.jpg"}
                          alt={p.name}
                          style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover", opacity: 0.8 }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#111827" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>ID: {p.id} • {p.gender}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div>{p.city || "N/A"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.state || "N/A"}</div>
                    </td>

                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}>
                        <XCircle size={12} /> {p.rejection_reason || "Policy Violation"}
                      </span>
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.8rem", color: "#4b5563" }}>
                      {p.reviewed_by || "Administrator"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {p.reviewed_at ? new Date(p.reviewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                    </td>

                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <Link
                        href={`/admin/profiles/${p.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "0.4rem 0.8rem",
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          textDecoration: "none"
                        }}
                      >
                        <RotateCcw size={13} /> Re-evaluate
                      </Link>
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
            Showing <strong>{profiles.length}</strong> of <strong>{totalCount}</strong> rejected records
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
