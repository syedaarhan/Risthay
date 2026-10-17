"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Bell, 
  HelpCircle, 
  Mail, 
  LogOut, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  User,
  Users,
  Shield,
  PhoneCall,
  Trash2
} from "lucide-react";

export default function SettingsModal({
  isOpen,
  onClose,
  globalPhotoBlur = false,
  onToggleGlobalPhotoBlur,
  onOpenWizard,
  currentUser = null,
  onLogout
}) {
  const [hideName, setHideName] = useState(false);
  const [waliRequired, setWaliRequired] = useState(true);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyInterests, setNotifyInterests] = useState(true);
  const [showStatusReviewModal, setShowStatusReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingNotice, setSavingNotice] = useState("");

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteModal(false);
        onClose();
        if (onLogout) onLogout();
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Load existing settings from backend on open
  useEffect(() => {
    if (!isOpen) return;
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          if (typeof data.settings.hideName === "boolean") setHideName(data.settings.hideName);
          if (typeof data.settings.waliInChat === "boolean") setWaliRequired(data.settings.waliInChat);
          if (typeof data.settings.notifyMatches === "boolean") setNotifyMatches(data.settings.notifyMatches);
          if (typeof data.settings.notifyMessages === "boolean") setNotifyMessages(data.settings.notifyMessages);
          if (typeof data.settings.notifyInterests === "boolean") setNotifyInterests(data.settings.notifyInterests);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, [isOpen]);

  const saveSettingToBackend = async (key, value) => {
    try {
      setSavingNotice("Saving...");
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value })
      });
      setTimeout(() => setSavingNotice(""), 1200);
    } catch {
      setSavingNotice("");
    }
  };

  if (!isOpen) return null;

  const displayName = currentUser?.name || "Ahmed Raza";
  const displayId = currentUser?.id || "RS-72104";
  const displayEmail = currentUser?.email || "user@risthay.in";
  const displayAvatar = currentUser?.avatar || "/images/ahmed.jpg";

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          maxHeight: "92vh",
          padding: "24px 20px",
          overflowY: "auto"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Settings & Privacy
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Manage your halal preferences & account security
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)" 
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Mini Banner */}
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          borderRadius: "20px",
          padding: "16px",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "20px",
          boxShadow: "0 6px 18px rgba(5, 150, 105, 0.2)"
        }}>
          <img 
            src={displayAvatar} 
            alt={displayName}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ffffff",
              background: "#ffffff"
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff" }}>
                {displayName}
              </h3>
              <CheckCircle2 size={16} fill="#ffffff" color="#059669" />
            </div>
            <p style={{ fontSize: "11px", color: "#d1fae5" }}>
              ID: {displayId} • {displayEmail}
            </p>
            <span style={{
              display: "inline-block",
              background: "rgba(255, 255, 255, 0.2)",
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "10px",
              fontWeight: "700",
              marginTop: "4px"
            }}>
              🇮🇳 Aadhaar KYC Verified
            </span>
          </div>
        </div>

        {savingNotice && (
          <div style={{
            fontSize: "11px",
            color: "#059669",
            fontWeight: "700",
            marginBottom: "12px",
            textAlign: "right"
          }}>
            ✓ {savingNotice}
          </div>
        )}

        {/* ACCOUNT SECTION */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>
            ACCOUNT DETAILS
          </span>

          <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div 
              onClick={() => { onClose(); if (onOpenWizard) onOpenWizard(); }}
              style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid #e2e8f0" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
                  <User size={16} />
                </div>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>Edit Profile & Photos</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Update bio, education, income, and pictures</span>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            <div 
              onClick={() => setShowStatusReviewModal(true)}
              style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "block" }}>Aadhaar Account Status</span>
                  <p style={{ fontSize: "11px", color: "#059669", fontWeight: "600" }}>Verified • View manual KYC review details</p>
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* PRIVACY & HALAL SECURITY SECTION */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>
            PRIVACY & HALAL INTEGRITY
          </span>

          <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {/* Blur Photos Toggle */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ paddingRight: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Lock size={14} color="#059669" />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Blur Photos (Purdah Protection)</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Keeps photos blurred until mutual Salaam & Interest accepted
                </p>
              </div>
              <input 
                type="checkbox"
                checked={globalPhotoBlur}
                onChange={() => {
                  if (onToggleGlobalPhotoBlur) onToggleGlobalPhotoBlur();
                  saveSettingToBackend("globalPhotoBlur", !globalPhotoBlur);
                }}
                style={{ width: "22px", height: "22px", accentColor: "#059669", cursor: "pointer" }}
              />
            </div>

            {/* Hide Name Toggle */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ paddingRight: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={14} color="#0284c7" />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Hide My Full Name</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Shows name as &ldquo;Member (ID: {displayId})&rdquo; until interest is mutual
                </p>
              </div>
              <input 
                type="checkbox"
                checked={hideName}
                onChange={(e) => {
                  setHideName(e.target.checked);
                  saveSettingToBackend("hideName", e.target.checked);
                }}
                style={{ width: "22px", height: "22px", accentColor: "#059669", cursor: "pointer" }}
              />
            </div>

            {/* Wali involvement */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ paddingRight: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Users size={14} color="#8b5cf6" />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Wali Supervision in Chat</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Allow family / Wali participation in all direct messages
                </p>
              </div>
              <input 
                type="checkbox"
                checked={waliRequired}
                onChange={(e) => {
                  setWaliRequired(e.target.checked);
                  saveSettingToBackend("waliInChat", e.target.checked);
                }}
                style={{ width: "22px", height: "22px", accentColor: "#059669", cursor: "pointer" }}
              />
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS SECTION */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>
            NOTIFICATIONS & ALERTS
          </span>

          <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>New Compatible Matches in India</span>
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Weekly recommendations based on preferences and age</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifyMatches} 
                onChange={(e) => {
                  setNotifyMatches(e.target.checked);
                  saveSettingToBackend("notifyMatches", e.target.checked);
                }} 
                style={{ width: "18px", height: "18px", accentColor: "#059669" }} 
              />
            </div>

            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Direct Messages & Wali Alerts</span>
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Notifications when matches reply in chat</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifyMessages} 
                onChange={(e) => {
                  setNotifyMessages(e.target.checked);
                  saveSettingToBackend("notifyMessages", e.target.checked);
                }} 
                style={{ width: "18px", height: "18px", accentColor: "#059669" }} 
              />
            </div>

            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Salaam & Interests Received</span>
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>Instant alert when someone sends you a Rishta request</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifyInterests} 
                onChange={(e) => {
                  setNotifyInterests(e.target.checked);
                  saveSettingToBackend("notifyInterests", e.target.checked);
                }} 
                style={{ width: "18px", height: "18px", accentColor: "#059669" }} 
              />
            </div>
          </div>
        </div>

        {/* SUPPORT & CONTACT */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "10px" }}>
            SUPPORT & HALAL MATRIMONIAL GUIDELINES
          </span>

          <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div 
              onClick={() => alert("Risthay Zero-Dowry Policy:\n\nRisthay strictly prohibits any demand or discussion of Jahez (dowry) on the platform. All members are verified with Aadhaar to ensure sincere, Sunnah-compliant proposals.")}
              style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid #e2e8f0" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <HelpCircle size={16} color="#059669" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Zero-Dowry & Halal Guidelines</span>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>

            <div 
              onClick={() => alert("Risthay India Helpdesk:\n\nWhatsApp Support: +91 98200 78601\nEmail: salam@risthay.in\nMon - Sat: 9:00 AM to 8:00 PM IST")}
              style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <PhoneCall size={16} color="#0284c7" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Contact India Support (Mumbai / Hyd)</span>
              </div>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON IN SETTINGS PAGE (PROMINENT & HIGH VISIBILITY) */}
        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              }
              onClose();
            }}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "16px",
              background: "#fee2e2",
              color: "#dc2626",
              border: "1.5px solid #fecaca",
              fontWeight: "800",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(220, 38, 38, 0.08)",
              transition: "transform 0.15s ease"
            }}
          >
            <LogOut size={18} color="#dc2626" />
            <span>Sign Out of Risthay</span>
          </button>
        </div>

        {/* DANGER ZONE: DELETE PROFILE */}
        <div style={{
          marginBottom: "24px",
          background: "#fff1f2",
          border: "1.5px dashed #f43f5e",
          borderRadius: "18px",
          padding: "16px"
        }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#e11d48", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
            DANGER ZONE
          </span>
          <p style={{ fontSize: "11px", color: "#881337", marginBottom: "14px", lineHeight: 1.45 }}>
            Permanently delete your matrimonial profile, photos, received Salaams, and chat history. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#e11d48",
              color: "#ffffff",
              border: "none",
              fontWeight: "800",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(225, 29, 72, 0.25)"
            }}
          >
            <Trash2 size={16} color="#ffffff" />
            <span>Delete Profile Permanently</span>
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>
          Risthay Muslim Matrimony India • v2.14.0
        </p>

        {/* Sub-Modal: Account Status */}
        {showStatusReviewModal && (
          <div className="modal-backdrop" onClick={() => setShowStatusReviewModal(false)} style={{ zIndex: 1300 }}>
            <div 
              className="modal-content-card animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: "28px 22px", textAlign: "center", maxWidth: "420px" }}
            >
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: "#ecfdf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#059669"
              }}>
                <ShieldCheck size={38} />
              </div>

              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                Assalamu Alaikum! Your Profile is Verified
              </h2>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
                To ensure a sincere, halal, and secure community across India, our moderation team verifies member identity using Aadhaar KYC and live selfie verification.
              </p>

              <div style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "16px",
                textAlign: "left",
                marginBottom: "20px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Aadhaar Manual Verification</h5>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Authenticity confirmed. Biometric data is never shared publicly.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Full Matrimonial Privileges</h5>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Unlimited browsing, Salaam requests, and supervised chat are active.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowStatusReviewModal(false)}
                className="btn-primary-action"
                style={{ width: "100%", padding: "12px", fontSize: "13px" }}
              >
                Close Verification Details
              </button>
            </div>
          </div>
        )}

        {/* Sub-Modal: Delete Profile Confirmation */}
        {showDeleteModal && (
          <div className="modal-backdrop" onClick={() => !isDeleting && setShowDeleteModal(false)} style={{ zIndex: 1300 }}>
            <div 
              className="modal-content-card animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{ padding: "28px 22px", textAlign: "center", maxWidth: "420px" }}
            >
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#e11d48"
              }}>
                <Trash2 size={32} />
              </div>

              <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                Delete Your Profile?
              </h2>

              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5, marginBottom: "22px" }}>
                Are you sure you want to permanently delete your Risthay account? All your personal information, Aadhaar verification status, photos, matches, and chats will be completely removed.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "14px",
                    background: "#e11d48",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    opacity: isDeleting ? 0.7 : 1,
                    boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)"
                  }}
                >
                  {isDeleting ? "Deleting Profile..." : "Yes, Delete My Account"}
                </button>

                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "14px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Cancel & Keep My Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
