"use client";

import React from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Share2, 
  Eye, 
  Edit3, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Lock, 
  Sparkles,
  Settings,
  PlusCircle,
  LogOut,
  ChevronRight,
  Shield,
  UserCheck
} from "lucide-react";

export default function MyProfileView({ 
  onOpenSettings, 
  onEditProfile,
  currentUser = null,
  onLogout,
  globalPhotoBlur = false 
}) {
  const user = {
    id: currentUser?.id || "RS-72104",
    name: currentUser?.name || "Ahmed Raza",
    age: currentUser?.age || 28,
    profession: currentUser?.profession || "Principal Architect",
    education: currentUser?.education || "Master of Architecture (M.Arch)",
    city: currentUser?.city || "Hyderabad",
    state: currentUser?.state || "Telangana",
    religiousPractice: currentUser?.religiousPractice || "Practicing Muslim",
    verified: currentUser?.verified !== false,
    avatar: currentUser?.avatar || "/images/ahmed.jpg",
    bio: currentUser?.bio || "Assalamu Alaikum. Sincere and family-oriented Muslim searching for a pious partner in the light of Sunnah.",
    incomeRange: currentUser?.incomeRange || "₹18 - ₹25 Lakhs p.a.",
    maritalStatus: currentUser?.maritalStatus || "Never Married",
    motherTongue: currentUser?.motherTongue || "Urdu"
  };

  return (
    <div className="my-profile-container animate-fade" style={{ paddingBottom: "80px", maxWidth: "680px", margin: "0 auto" }}>
      {/* Header Profile Card */}
      <div style={{
        background: "#ffffff",
        borderRadius: "28px",
        padding: "28px 20px 22px 20px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        textAlign: "center",
        marginBottom: "20px",
        position: "relative"
      }}>
        {/* Settings shortcut button on top right of profile */}
        <button
          onClick={onOpenSettings}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          title="Open Settings & Privacy"
        >
          <Settings size={18} />
        </button>

        {/* Avatar with Ring & Verified Badge */}
        <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 14px" }}>
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            padding: "4px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            boxShadow: "0 6px 18px rgba(5, 150, 105, 0.25)"
          }}>
            <img 
              src={user.avatar} 
              alt={user.name}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                background: "#ffffff",
                filter: globalPhotoBlur ? "blur(6px)" : "none"
              }}
            />
          </div>
          {user.verified && (
            <span style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              background: "#059669",
              borderRadius: "50%",
              padding: "4px",
              border: "3px solid #ffffff",
              color: "#ffffff",
              display: "flex"
            }}>
              <CheckCircle2 size={16} />
            </span>
          )}
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
          {user.name}, {user.age}
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
          ID: {user.id} • {user.city}, {user.state}
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", color: "#059669", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "18px" }}>
          <Briefcase size={13} /> {user.profession}
        </div>

        {/* Profile Completeness Bar */}
        <div style={{
          background: "#f8fafc",
          borderRadius: "18px",
          padding: "16px",
          border: "1px solid #e2e8f0",
          marginBottom: "20px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Profile Completeness</span>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#059669" }}>90%</span>
          </div>

          <div style={{ height: "7px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "6px" }}>
            <div style={{ width: "90%", height: "100%", background: "#059669", borderRadius: "10px" }} />
          </div>

          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Aadhaar verification complete. Your profile has high visibility in {user.state}.
          </p>
        </div>

        {/* Quick Action Icons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          <button
            onClick={onEditProfile}
            style={{
              padding: "12px 8px",
              borderRadius: "14px",
              background: "#f1f5f9",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Edit3 size={17} color="#059669" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onOpenSettings}
            style={{
              padding: "12px 8px",
              borderRadius: "14px",
              background: "#f1f5f9",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Settings size={17} color="#0284c7" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Risthay profile link copied to clipboard!");
            }}
            style={{
              padding: "12px 8px",
              borderRadius: "14px",
              background: "#f1f5f9",
              color: "#0f172a",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            <Share2 size={17} color="#8b5cf6" />
            <span>Share Profile</span>
          </button>
        </div>
      </div>

      {/* About Me Section */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>About Me</h2>
          <button onClick={onEditProfile} style={{ color: "#059669", fontSize: "12px", fontWeight: "700" }}>Edit</button>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {user.bio}
        </p>
      </div>

      {/* Religious & Personal Background */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Religious & Personal Details</h2>
          <button onClick={onEditProfile} style={{ color: "#059669", fontSize: "12px", fontWeight: "700" }}>Edit</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>RELIGIOUS PRACTICE</span>
            <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px", marginTop: "2px" }}>{user.religiousPractice}</p>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>MARITAL STATUS</span>
            <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px", marginTop: "2px" }}>{user.maritalStatus}</p>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>MOTHER TONGUE</span>
            <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px", marginTop: "2px" }}>{user.motherTongue}</p>
          </div>
          <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "14px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>ANNUAL INCOME</span>
            <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px", marginTop: "2px" }}>{user.incomeRange}</p>
          </div>
        </div>
      </div>

      {/* Education & Career */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "20px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Career & Education</h2>
          <button onClick={onEditProfile} style={{ color: "#059669", fontSize: "12px", fontWeight: "700" }}>Edit</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <Briefcase size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.profession}</h4>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Working in {user.city}, {user.state}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
            <GraduationCap size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.education}</h4>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Verified qualification credentials</p>
          </div>
        </div>
      </div>

      {/* Settings & Privacy Action Card */}
      <div 
        onClick={onOpenSettings}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "16px 20px",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
            <Settings size={18} />
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", display: "block" }}>Settings & Privacy</span>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Aadhaar verification status, photo purdah & notifications</span>
          </div>
        </div>
        <ChevronRight size={18} color="var(--text-muted)" />
      </div>

      {/* Prominent Sign Out Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "16px",
            background: "#fee2e2",
            color: "#dc2626",
            border: "1.5px solid #fecaca",
            fontWeight: "700",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer"
          }}
        >
          <LogOut size={16} color="#dc2626" />
          <span>Sign Out of Account</span>
        </button>
      )}
    </div>
  );
}
