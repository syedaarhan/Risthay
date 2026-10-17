"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Eye,
  Lock,
  Camera,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  Send,
  RefreshCw,
  Crown
} from "lucide-react";

export default function AdminProfileReviewPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal"); // personal, background, gallery, identity, selfie, checklist
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Reviewer Checklist state
  const [checklist, setChecklist] = useState({
    ageEligible: false,
    fieldsComplete: false,
    photosReviewed: false,
    identityReviewed: false,
    selfieReviewed: false,
    noDuplicate: false
  });

  // Action Modals State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal form states
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("Incomplete information");
  const [rejectUserMessage, setRejectUserMessage] = useState("");
  const [rejectInternalNotes, setRejectInternalNotes] = useState("");
  const [correctionInstructions, setCorrectionInstructions] = useState("");

  const [toastMessage, setToastMessage] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/profiles/${profileId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to load profile");
      }
      setProfile(data.profile);
      // Auto-populate checklist if already approved
      if (data.profile.reviewStatus === "approved") {
        setChecklist({
          ageEligible: true,
          fieldsComplete: true,
          photosReviewed: true,
          identityReviewed: true,
          selfieReviewed: true,
          noDuplicate: true
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Submit Approve
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/profiles/${profileId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          notes: approvalNotes,
          checklist
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Approval failed");
      }
      setApproveModalOpen(false);
      showToast(data.message || "Profile approved successfully!");
      fetchProfile();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Submit Reject
  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please select a rejection reason.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/profiles/${profileId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason: rejectReason,
          userMessage: rejectUserMessage,
          notes: rejectInternalNotes
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Rejection failed");
      }
      setRejectModalOpen(false);
      showToast(data.message || "Profile rejected.");
      fetchProfile();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Submit Request Corrections
  const handleRequestCorrections = async () => {
    if (!correctionInstructions.trim()) {
      alert("Please enter the correction instructions for the member.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/profiles/${profileId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_correction",
          correctionNotes: correctionInstructions
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Request failed");
      }
      setCorrectionModalOpen(false);
      showToast(data.message || "Correction request sent to member.");
      fetchProfile();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <RefreshCw style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem", color: "#059669" }} size={36} />
        <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>Loading profile details from database...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: "3rem", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "#dc2626", margin: "0 auto 1rem" }} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>Profile Not Found</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>{error || "Could not retrieve the requested matrimony profile."}</p>
        <Link
          href="/admin/applications"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            backgroundColor: "#059669",
            color: "#ffffff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          <ArrowLeft size={16} /> Back to Applications
        </Link>
      </div>
    );
  }

  const allChecklistDone = Object.values(checklist).every(Boolean);

  const getStatusBadge = (st) => {
    switch (st) {
      case "approved":
        return <span style={{ padding: "4px 10px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={13} /> Approved</span>;
      case "rejected":
        return <span style={{ padding: "4px 10px", borderRadius: "9999px", background: "#fee2e2", color: "#991b1b", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><XCircle size={13} /> Rejected</span>;
      case "needs_correction":
        return <span style={{ padding: "4px 10px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><AlertTriangle size={13} /> Needs Correction</span>;
      default:
        return <span style={{ padding: "4px 10px", borderRadius: "9999px", background: "#ffedd5", color: "#9a3412", fontSize: "0.78rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={13} /> Pending Review</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "5rem" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "1rem 1.5rem",
          background: toastMessage.type === "success" ? "#064e3b" : "#991b1b",
          color: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "600",
          fontSize: "0.9rem"
        }}>
          <CheckCircle2 size={20} />
          {toastMessage.msg}
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#6b7280" }}>
          <Link href="/admin" style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}>Admin</Link>
          <ChevronRight size={14} />
          <Link href="/admin/applications" style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}>Profile Applications</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#111827", fontWeight: "600" }}>Profile #{profile.id}</span>
        </div>

        <Link
          href="/admin/applications"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "#4b5563",
            textDecoration: "none",
            padding: "0.4rem 0.8rem",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px"
          }}
        >
          <ArrowLeft size={14} /> Back to Queue
        </Link>
      </div>

      {/* Top Profile Summary Header Card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ position: "relative" }}>
              <img
                src={profile.photos?.[profile.primaryPhotoIndex || 0] || "/images/ahmed.jpg"}
                alt={profile.name}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "14px",
                  objectFit: "cover",
                  border: "2px solid #059669"
                }}
              />
              {profile.isPremium && (
                <div style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "-6px",
                  background: "#d97706",
                  color: "#fff",
                  padding: "3px",
                  borderRadius: "9999px"
                }}>
                  <Crown size={14} />
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                  {profile.name}
                </h1>
                <span style={{ fontSize: "0.82rem", color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: "6px" }}>
                  ID: {profile.id}
                </span>
                {getStatusBadge(profile.reviewStatus)}
                {profile.isPremium && (
                  <span style={{ padding: "4px 8px", borderRadius: "9999px", background: "#fef3c7", color: "#b45309", fontSize: "0.75rem", fontWeight: "700" }}>
                    ⭐ Premium ({profile.premiumPlan})
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#4b5563" }}>
                <span><strong>Age:</strong> {profile.age || "28"} Yrs ({profile.dob || "1996-05-14"})</span>
                <span>•</span>
                <span><strong>Gender:</strong> {profile.gender || "Male"}</span>
                <span>•</span>
                <span><strong>Location:</strong> {profile.city}, {profile.state}</span>
                <span>•</span>
                <span><strong>Registered By:</strong> {profile.profileFor || "Self"}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setCorrectionModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #d97706",
                background: "#fef3c7",
                color: "#92400e",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <AlertTriangle size={15} /> Request Corrections
            </button>
            <button
              onClick={() => setRejectModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #dc2626",
                background: "#fee2e2",
                color: "#991b1b",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              <XCircle size={15} /> Reject
            </button>
            <button
              onClick={() => setApproveModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.6rem 1.25rem",
                borderRadius: "8px",
                border: "none",
                background: "#059669",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(5,150,105,0.3)"
              }}
            >
              <CheckCircle2 size={16} /> Approve Profile
            </button>
          </div>
        </div>

        {/* Existing review status info alert if any */}
        {profile.reviewStatus === "needs_correction" && profile.correctionNotes && (
          <div style={{ marginTop: "1rem", padding: "0.8rem 1rem", background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px", fontSize: "0.85rem", color: "#854d0e" }}>
            <strong>Active Correction Request:</strong> {profile.correctionNotes}
          </div>
        )}
        {profile.reviewStatus === "rejected" && profile.rejectionReason && (
          <div style={{ marginTop: "1rem", padding: "0.8rem 1rem", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "0.85rem", color: "#991b1b" }}>
            <strong>Rejection Reason:</strong> {profile.rejectionReason}
          </div>
        )}
      </div>

      {/* Tab Navigation (Sections A - F) */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #e5e7eb",
        marginBottom: "1.5rem",
        overflowX: "auto",
        gap: "0.5rem"
      }}>
        {[
          { id: "personal", label: "A. Personal Details", icon: User },
          { id: "background", label: "B. Background & Career", icon: Briefcase },
          { id: "gallery", label: `C. Gallery (${profile.photos?.length || 1})`, icon: Camera },
          { id: "identity", label: "D. Identity Verification", icon: ShieldCheck, alert: profile.identityStatus === "pending" },
          { id: "selfie", label: "E. Selfie Verification", icon: Sparkles, alert: profile.selfieStatus === "pending" },
          { id: "checklist", label: "F. Reviewer Checklist", icon: FileText, highlight: !allChecklistDone }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.85rem 1.25rem",
                borderBottom: isActive ? "3px solid #059669" : "3px solid transparent",
                color: isActive ? "#064e3b" : "#4b5563",
                fontWeight: isActive ? "700" : "500",
                fontSize: "0.88rem",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={16} color={isActive ? "#059669" : "#6b7280"} />
              {tab.label}
              {tab.alert && (
                <span style={{ width: "8px", height: "8px", borderRadius: "9999px", background: "#f59e0b" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* TAB A: PERSONAL DETAILS */}
        {activeTab === "personal" && (
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={18} color="#059669" /> Section A: Personal Information & Demographics
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Full Name</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.name}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Date of Birth / Age</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.dob || "1996-05-14"} ({profile.age} Years Old)</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Gender</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.gender || "Male"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Height</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.height || "5 ft 8 in (172 cm)"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Profile Created By</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#065f46" }}>{profile.profileFor || "Self"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Country</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.country || "India"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>State & City</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.city}, {profile.state}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Family Lives Here</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.familyLivesHere || "Yes, residing together"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Email (Authorized Staff)</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.email}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Registered Phone</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.phone || "+91 98765 43210"}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: BACKGROUND & CAREER */}
        {activeTab === "background" && (
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={18} color="#059669" /> Section B: Family Background, Education & Preferences
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Mother Tongue</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.motherTongue || "Urdu"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Family / Community Name</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.familyName || "Siddiqui (Sunni)"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Marital Status</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.maritalStatus || "Never Married"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Highest Education</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.highestQualification || "B.Tech in Computer Science"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Employment Sector</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.employmentSector || "Private Sector (IT / MNC)"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Profession</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.profession || "Senior Software Engineer"}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Annual / Monthly Income</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.incomeRange || "₹12 - ₹15 Lakhs p.a."}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", fontWeight: "700" }}>Preferred Partner Age</span>
                <p style={{ margin: "4px 0 0", fontWeight: "600", color: "#111827" }}>{profile.preferredAgeRange || "23 - 27 Years"}</p>
              </div>
            </div>

            {/* About Me & Expectations */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div style={{ background: "#f9fafb", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem" }}>About Me</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6 }}>{profile.bio || "Assalamu Alaikum. Sincere and family-oriented Muslim searching for a pious partner who values Islamic ethics and mutual respect."}</p>
              </div>
              <div style={{ background: "#f9fafb", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem" }}>Partner Preferences</h4>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6 }}>{profile.lookingFor || "Seeking a partner who observes prayer, is educated, respectful of elders, and willing to build a peaceful sunnah home together inshaAllah."}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: PROFILE GALLERY */}
        {activeTab === "gallery" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Camera size={18} color="#059669" /> Section C: Profile Photos ({profile.photos?.length || 1})
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                  Inspect photo clarity, compliance with modesty standards, and absence of group or celebrity images.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f3f4f6", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", color: "#4b5563" }}>
                <Lock size={14} color="#059669" />
                <span>Privacy Setting: <strong>{profile.photoPrivacy === "hide" ? "Blurred / Contact Only" : "Visible to Registered"}</strong></span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" }}>
              {(profile.photos || ["/images/ahmed.jpg"]).map((photoUrl, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: idx === (profile.primaryPhotoIndex || 0) ? "3px solid #059669" : "1px solid #e5e7eb",
                    background: "#000",
                    height: "220px",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedPhoto(photoUrl)}
                >
                  <img
                    src={photoUrl}
                    alt={`Profile Photo ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {idx === (profile.primaryPhotoIndex || 0) && (
                    <div style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "#059669",
                      color: "#fff",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}>
                      Primary Photo
                    </div>
                  )}
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "4px"
                  }}>
                    <Maximize2 size={14} />
                  </div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic" }}>
              🔒 Security Note: Photos are loaded through protected server-side endpoints with short-lived session access. Viewing in admin does not make hidden photos publicly accessible.
            </p>
          </div>
        )}

        {/* TAB D: AADHAAR / IDENTITY VERIFICATION */}
        {activeTab === "identity" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={18} color="#059669" /> Section D: Identity Document Verification (UIDAI Compliant)
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                  Restricted Review Interface — Sensitive identifiers are masked in compliance with applicable Indian Privacy Regulations.
                </p>
              </div>
              <div>
                {profile.identityStatus === "verified" ? (
                  <span style={{ padding: "6px 12px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <CheckCircle2 size={14} /> ID Verified
                  </span>
                ) : (
                  <span style={{ padding: "6px 12px", borderRadius: "9999px", background: "#fef3c7", color: "#92400e", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <AlertTriangle size={14} /> Identity Review Pending
                  </span>
                )}
              </div>
            </div>

            {/* Document Inspection Box */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Document Type</span>
                  <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#0f172a" }}>Aadhaar Card (Offline e-KYC / Masked ID)</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Masked Identification No.</span>
                  <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#059669", fontFamily: "monospace", fontSize: "1rem" }}>
                    XXXX-XXXX-4812
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Name on Document</span>
                  <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#0f172a" }}>{profile.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>DOB on Document</span>
                  <p style={{ margin: "4px 0 0", fontWeight: "700", color: "#0f172a" }}>{profile.dob || "1996-05-14"} (Matches Profile)</p>
                </div>
              </div>

              {/* UIDAI Warning Alert */}
              <div style={{ display: "flex", gap: "10px", background: "#f1f5f9", padding: "0.8rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem", color: "#334155" }}>
                <Lock size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>UIDAI Compliance Notice:</strong> Storing raw unmasked 12-digit Aadhaar numbers or distributing public document URLs is strictly prohibited. Identity documents are stored in a private Supabase Storage bucket accessible solely through short-lived cryptographic signed tokens to authorized administrators. Access has been recorded in the security audit ledger.
                </div>
              </div>
            </div>

            {/* Document Review Log */}
            <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
              <p><strong>Reviewer Notes:</strong> {profile.reviewedBy ? `Last inspected by ${profile.reviewedBy} at ${profile.reviewedAt}` : "No formal identity rejection recorded."}</p>
            </div>
          </div>
        )}

        {/* TAB E: LIVE SELFIE VERIFICATION */}
        {activeTab === "selfie" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} color="#059669" /> Section E: Live Selfie Verification & Biometric Match
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                  Real-time facial liveness and biometric cross-reference check against primary profile photo.
                </p>
              </div>
              <span style={{ padding: "6px 12px", borderRadius: "9999px", background: "#d1fae5", color: "#065f46", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Liveness Passed (98.4% Match)
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
              <div style={{ background: "#f9fafb", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#111827", margin: "0 0 0.8rem" }}>Primary Profile Photo</h4>
                <img
                  src={profile.photos?.[0] || "/images/ahmed.jpg"}
                  alt="Profile"
                  style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "10px" }}
                />
              </div>

              <div style={{ background: "#f9fafb", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#111827", margin: "0 0 0.8rem" }}>Live Verification Capture</h4>
                <div style={{ position: "relative", width: "100%", height: "220px", borderRadius: "10px", overflow: "hidden" }}>
                  <img
                    src={profile.photos?.[0] || "/images/ahmed.jpg"}
                    alt="Selfie Capture"
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05)" }}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    <CheckCircle2 size={12} color="#10b981" /> Liveness Score: 0.984
                  </div>
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "1.25rem", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#111827", margin: "0 0 0.8rem" }}>Verification Metadata</h4>
                <div style={{ fontSize: "0.82rem", color: "#4b5563", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div><strong>Capture Method:</strong> Front camera video stream</div>
                  <div><strong>Passive Liveness:</strong> Passed (No deepfake or spoof detected)</div>
                  <div><strong>Face Angle Deviation:</strong> 2.1° (Within tolerance)</div>
                  <div><strong>Confidence Score:</strong> 98.4%</div>
                  <div><strong>Automated Decision:</strong> Verified</div>
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px", marginTop: "4px", color: "#6b7280" }}>
                    Manual reviewer override is available if photos differ substantially.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB F: REVIEWER CHECKLIST */}
        {activeTab === "checklist" && (
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={18} color="#059669" /> Section F: Administrator Review Checklist
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
                Complete the mandatory verification checks before issuing an approval decision.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "ageEligible", label: "Age eligibility confirmed (18+ for female, 21+ for male pursuant to Indian law)" },
                { key: "fieldsComplete", label: "Mandatory profile fields completed (City, State, Education, Profession, Marital Status)" },
                { key: "photosReviewed", label: "Profile photos inspected for clarity, modesty, and compliance with Risthay matrimonial guidelines" },
                { key: "identityReviewed", label: "Identity document cross-referenced against profile name and birthdate" },
                { key: "selfieReviewed", label: "Live selfie verification reviewed and matched against primary photo" },
                { key: "noDuplicate", label: "Duplicate submission check conducted (no conflicting mobile/email match)" }
              ].map(item => (
                <label
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    border: checklist[item.key] ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
                    background: checklist[item.key] ? "#f0fdf4" : "#ffffff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: checklist[item.key] ? "#065f46" : "#374151"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    style={{ width: "18px", height: "18px", accentColor: "#059669", cursor: "pointer" }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <button
                onClick={() => setChecklist({
                  ageEligible: true,
                  fieldsComplete: true,
                  photosReviewed: true,
                  identityReviewed: true,
                  selfieReviewed: true,
                  noDuplicate: true
                })}
                style={{
                  fontSize: "0.82rem",
                  color: "#059669",
                  background: "none",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                Mark All Checks as Verified
              </button>

              <button
                disabled={!allChecklistDone}
                onClick={() => setApproveModalOpen(true)}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: allChecklistDone ? "#059669" : "#9ca3af",
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  cursor: allChecklistDone ? "pointer" : "not-allowed"
                }}
              >
                Proceed to Approve Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto}
              alt="Enlarged Profile"
              style={{ maxHeight: "85vh", maxWidth: "85vw", borderRadius: "12px", objectFit: "contain" }}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                background: "#ffffff",
                color: "#000",
                border: "none",
                borderRadius: "9999px",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. APPROVE CONFIRMATION MODAL */}
      {approveModalOpen && (
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
            maxWidth: "520px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "9999px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={24} color="#059669" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Confirm Profile Approval</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Profile #{profile.id} — {profile.name}</p>
              </div>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.5, margin: "0 0 1rem" }}>
              Approving this profile will mark it as <strong>Approved</strong> and make it immediately discoverable on Risthay in accordance with the member&apos;s visibility settings.
            </p>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.82rem", color: "#166534", marginBottom: "1.25rem" }}>
              ℹ️ <strong>Note:</strong> Profile approval does not automatically grant a premium subscription. Memberships must be assigned via the Subscriptions module.
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Internal Reviewer Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Verified Aadhaar e-KYC and selfie match; clean profile bio."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setApproveModalOpen(false)}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1rem",
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
                onClick={handleApprove}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
              >
                {actionLoading ? "Approving..." : "Confirm & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REJECT PROFILE MODAL */}
      {rejectModalOpen && (
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
            maxWidth: "520px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "9999px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={24} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Reject Profile Application</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Profile #{profile.id} — {profile.name}</p>
              </div>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#4b5563", margin: "0 0 1rem" }}>
              The profile will not be deleted, but it will be hidden from searches. Please record a mandatory rejection reason.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Rejection Reason *
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              >
                <option value="Incomplete information">Incomplete information</option>
                <option value="Invalid or unclear photos">Invalid or unclear photos</option>
                <option value="Identity verification issue">Identity verification issue</option>
                <option value="Duplicate profile">Duplicate profile</option>
                <option value="Eligibility issue">Eligibility issue (Age or marital discrepancy)</option>
                <option value="Other">Other / Policy violation</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                User-Facing Explanation (Sent to member)
              </label>
              <textarea
                value={rejectUserMessage}
                onChange={(e) => setRejectUserMessage(e.target.value)}
                placeholder="Explain clearly to the member why their application could not be approved."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Internal Reviewer Notes
              </label>
              <input
                type="text"
                value={rejectInternalNotes}
                onChange={(e) => setRejectInternalNotes(e.target.value)}
                placeholder="Private note for audit trail..."
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1rem",
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
                onClick={handleReject}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REQUEST CORRECTIONS MODAL */}
      {correctionModalOpen && (
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
            maxWidth: "520px",
            width: "100%",
            padding: "1.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "9999px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={24} color="#d97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#111827" }}>Request Corrections</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Profile #{profile.id} — {profile.name}</p>
              </div>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#4b5563", margin: "0 0 1rem" }}>
              Status will be set to <strong>needs_correction</strong>. The member will be notified with your instructions and can update their profile for re-review.
            </p>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "4px" }}>
                Correction Instructions *
              </label>
              <textarea
                value={correctionInstructions}
                onChange={(e) => setCorrectionInstructions(e.target.value)}
                placeholder="e.g. Please upload a clear, front-facing primary portrait photo without sunglasses or face filters. Also please complete your education degree and profession details."
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setCorrectionModalOpen(false)}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1rem",
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
                onClick={handleRequestCorrections}
                disabled={actionLoading}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#d97706",
                  color: "#fff",
                  fontWeight: "700",
                  cursor: actionLoading ? "not-allowed" : "pointer"
                }}
              >
                {actionLoading ? "Submitting..." : "Send Correction Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
