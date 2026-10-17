"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";

export default function AdminApplicationsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusTab, setStatusTab] = useState("pending"); // "pending", "needs_correction", "all"
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("");

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15"
      });

      if (statusTab !== "all") {
        params.set("status", statusTab);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (genderFilter) {
        params.set("gender", genderFilter);
      }
      if (relationshipFilter) {
        params.set("relationship", relationshipFilter);
      }

      const res = await fetch(`/api/admin/profiles?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        setProfiles(data.profiles || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusTab, searchQuery, genderFilter, relationshipFilter]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span style={{ padding: "4px 8px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.75rem", fontWeight: "700" }}>Approved</span>;
      case "rejected":
        return <span style={{ padding: "4px 8px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.75rem", fontWeight: "700" }}>Rejected</span>;
      case "needs_correction":
        return <span style={{ padding: "4px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={12} /> Needs Info</span>;
      default:
        return <span style={{ padding: "4px 8px", borderRadius: "9999px", background: "#ffedd5", color: "#9a3412", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> Pending Review</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Users size={24} color="#059669" /> Profile Applications Queue
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.88rem" }}>
            Review, verify, and approve incoming matrimony profile registrations.
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
          { key: "pending", label: "Pending Review" },
          { key: "needs_correction", label: "Needs Correction" },
          { key: "all", label: "All Submissions" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusTab(tab.key); setPage(1); }}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: "8px",
              border: "none",
              background: statusTab === tab.key ? "#ffffff" : "transparent",
              color: statusTab === tab.key ? "#064e3b" : "#4b5563",
              fontWeight: statusTab === tab.key ? "700" : "500",
              fontSize: "0.85rem",
              boxShadow: statusTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
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
        <form onSubmit={handleSearchSubmit} style={{ flex: "1 1 280px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by candidate name, profile ID, or email..."
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
            Search
          </button>
        </form>

        <select
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="">All Genders</option>
          <option value="Male">Groom (Male)</option>
          <option value="Female">Bride (Female)</option>
        </select>

        <select
          value={relationshipFilter}
          onChange={(e) => { setRelationshipFilter(e.target.value); setPage(1); }}
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "0.85rem",
            background: "#fff",
            color: "#374151"
          }}
        >
          <option value="">All Relationships</option>
          <option value="Self">Self</option>
          <option value="Son">Son</option>
          <option value="Daughter">Daughter</option>
          <option value="Brother">Brother</option>
          <option value="Sister">Sister</option>
          <option value="Relative">Relative</option>
        </select>
      </div>

      {/* Applications Table */}
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
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Profile / Candidate</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Demographics</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Location</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Created By</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Verifications</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Approval Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700" }}>Registered</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: "700", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 0.5rem", color: "#059669" }} size={24} />
                    Loading applications queue...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
                    No applications found matching your criteria.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {/* Profile Candidate */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img
                          src={p.avatar || "/images/ahmed.jpg"}
                          alt={p.name}
                          style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#111827" }}>{p.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>ID: {p.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Demographics */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div>{p.gender || "Male"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.age || "28"} yrs • {p.dob || "1996"}</div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div>{p.city || "Mumbai"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.state || "Maharashtra"}</div>
                    </td>

                    {/* Created By */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "#f3f4f6",
                        color: "#374151",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}>
                        {p.registered_relationship || "Self"}
                      </span>
                    </td>

                    {/* Verifications */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: p.identity_status === "verified" ? "#065f46" : "#b45309" }}>
                          <ShieldCheck size={12} /> ID: {p.identity_status || "pending"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: p.selfie_status === "verified" ? "#065f46" : "#6b7280" }}>
                          <Sparkles size={12} /> Selfie: {p.selfie_status || "verified"}
                        </span>
                      </div>
                    </td>

                    {/* Approval Status */}
                    <td style={{ padding: "0.85rem 1rem" }}>
                      {getStatusBadge(p.review_status)}
                    </td>

                    {/* Registered Date */}
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <Link
                        href={`/syedristhay/profiles/${p.id}`}
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
                          textDecoration: "none"
                        }}
                      >
                        Review <ChevronRight size={14} />
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
            Showing <strong>{profiles.length}</strong> of <strong>{totalCount}</strong> applications
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
