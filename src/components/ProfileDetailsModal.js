"use client";

import React, { useState } from "react";
import { 
  X, 
  Heart, 
  Send, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Home, 
  Sparkles, 
  Share2, 
  Eye, 
  Lock, 
  PhoneCall,
  Clock,
  Compass
} from "lucide-react";

export default function ProfileDetailsModal({ 
  profile, 
  onClose, 
  onSendInterest, 
  isShortlisted, 
  onToggleShortlist,
  globalPhotoBlur = false,
  isPremium = false,
  onUpgradeToPremium
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [revealedPhoto, setRevealedPhoto] = useState(false);

  if (!profile) return null;

  const photoList = profile.photos?.length ? profile.photos : [profile.avatar].filter(Boolean);
  const isBlurActive = (!isPremium || globalPhotoBlur || profile.photoHidden) && !revealedPhoto;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "600px",
          maxHeight: "92vh",
          padding: 0,
          overflowY: "auto",
          borderRadius: "28px",
          background: "#ffffff"
        }}
      >
        {/* Top Hero Photo & Actions (Matches 12_screen.png) */}
        <div style={{ position: "relative", height: "380px", background: "#0f172a", overflow: "hidden" }}>
          {photoList.length > 0 ? (
            <>
              <img 
                src={photoList[selectedPhotoIndex] || photoList[0]} 
                alt={profile.name}
                className={isBlurActive ? "photo-blurred" : "photo-revealed"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              {!isPremium && !revealedPhoto && (
                <div
                  onClick={onUpgradeToPremium}
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(15,23,42,0.55)",
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    borderRadius: "16px",
                    padding: "12px 20px",
                    display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    <Lock size={16} color="#0f172a" />
                    <span style={{ color: "#0f172a", fontWeight: "800", fontSize: "13px" }}>Upgrade to View Photo</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#1e293b",
              color: "#ffffff"
            }}>
              <Lock size={40} color="#10b981" />
              <p style={{ marginTop: "10px", fontWeight: "700" }}>Purdah Observing Member</p>
            </div>
          )}

          {/* Top Bar Controls */}
          <div style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            right: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10
          }}>
            <button
              onClick={onClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(6px)"
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              {(globalPhotoBlur || profile.photoHidden) && (
                <button
                  onClick={() => setRevealedPhoto(!revealedPhoto)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    background: "rgba(15, 23, 42, 0.65)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "600",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Eye size={14} />
                  <span>{revealedPhoto ? "Re-blur" : "Reveal (Taaruf)"}</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: profile.name, text: `Review ${profile.name}'s profile on Risthay` });
                  } else {
                    alert("Profile link copied to clipboard");
                  }
                }}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(6px)"
                }}
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Gradient Overlay Info (Matches 12_screen.png) */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "24px 20px 20px 20px",
            background: "linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "800" }}>
                {profile.name}, {profile.age}
              </h2>
              {profile.verified && (
                <span title="Aadhaar KYC Verified">
                  <CheckCircle2 size={20} color="#10b981" />
                </span>
              )}
            </div>

            <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px", fontWeight: "500" }}>
              {profile.profession} • {profile.city}, {profile.country}
            </p>

            {/* Tags Pills on dark overlay */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <span style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "3px 10px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                backdropFilter: "blur(4px)"
              }}>
                {profile.religiousPractice || "Practicing Muslim"}
              </span>
              <span style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "3px 10px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                backdropFilter: "blur(4px)"
              }}>
                {profile.height}
              </span>
              <span style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: "3px 10px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                backdropFilter: "blur(4px)"
              }}>
                {profile.maritalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body (Matches 12_screen.png) */}
        <div style={{ padding: "20px 24px" }}>
          {/* Photos Horizontal Gallery */}
          {photoList.length > 1 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>Photos</span>
                <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>
                  {photoList.length} Photos
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
                {photoList.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: `2px solid ${selectedPhotoIndex === idx ? "var(--primary)" : "#e2e8f0"}`,
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={photo} 
                      alt="" 
                      className={isBlurActive ? "photo-blurred" : "photo-revealed"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sticky / Floating Action Bar in Details Modal (Matches 12_screen.png) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <button
              onClick={() => onToggleShortlist(profile.id)}
              className="btn-outline-action"
              style={{
                padding: "12px",
                background: isShortlisted ? "#ecfdf5" : "#ffffff",
                borderColor: isShortlisted ? "#059669" : "#e2e8f0",
                color: isShortlisted ? "#059669" : "#0f172a"
              }}
            >
              <Heart size={18} fill={isShortlisted ? "#059669" : "none"} />
              <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
            </button>

            <button
              onClick={() => { onClose(); onSendInterest(profile); }}
              className="btn-primary-action"
              style={{ padding: "12px" }}
            >
              <Send size={18} />
              <span>Send Interest</span>
            </button>
          </div>

          {/* About Me Section */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>👤</span> About Me
            </h3>
            <p style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0"
            }}>
              {profile.bio}
            </p>
          </div>

          {/* Deen & Practice Grid (Matches 12_screen.png) */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>🕌</span> Deen & Practice
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px"
            }}>
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  RELIGIOUS COMMITMENT
                </span>
                <p style={{ fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{profile.religiousPractice || "Practicing Muslim"}</p>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  DAILY PRAYERS
                </span>
                <p style={{ fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{profile.prayers}</p>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  HALAL FOOD
                </span>
                <p style={{ fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{profile.halalFood}</p>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  SMOKING / DRINKING
                </span>
                <p style={{ fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>{profile.smokingDrinking}</p>
              </div>
            </div>
          </div>

          {/* Career & Education (Matches 12_screen.png) */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>🎓</span> Career & Education
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", padding: "14px", borderRadius: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
                  <Briefcase size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: "800", color: "#0f172a" }}>{profile.profession}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{profile.company} • {profile.city}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", padding: "14px", borderRadius: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <p style={{ fontWeight: "800", color: "#0f172a" }}>{profile.education}</p>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Accredited Higher Education in India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Family Details (Matches 12_screen.png) */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>👨‍👩‍👧‍👦</span> Family Details
            </h3>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>FATHER</span>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{profile.familyBackground?.father}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>MOTHER</span>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{profile.familyBackground?.mother}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>SIBLINGS</span>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{profile.familyBackground?.siblings}</p>
                </div>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>FAMILY STATUS</span>
                  <p style={{ fontWeight: "700", color: "#0f172a", fontSize: "13px" }}>{profile.familyBackground?.status}</p>
                </div>
              </div>

              {profile.familyBackground?.origin && (
                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span style={{ fontWeight: "700" }}>Native Roots:</span> {profile.familyBackground.origin}
                </div>
              )}
            </div>
          </div>

          {/* Location & Map Preview (Matches 12_screen.png) */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>📍</span> Location in India
            </h3>

            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              overflow: "hidden"
            }}>
              <div style={{ padding: "14px", display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>LIVES IN</span>
                  <p style={{ fontWeight: "700", color: "#0f172a" }}>{profile.city}, {profile.state}, {profile.country}</p>
                </div>
              </div>

              {/* Stylized Indian City Map Graphic */}
              <div style={{
                height: "120px",
                background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  background: "#ffffff",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "800",
                  fontSize: "12px",
                  color: "#0f172a",
                  letterSpacing: "1px"
                }}>
                  <Compass size={14} color="#059669" />
                  {profile.city.toUpperCase()}, INDIA
                </div>
              </div>
            </div>
          </div>

          {/* Partner Preferences */}
          <div style={{
            background: "#ecfdf5",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid #a7f3d0",
            marginBottom: "20px"
          }}>
            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#065f46", marginBottom: "4px" }}>
              Partner Preferences
            </h4>
            <p style={{ fontSize: "13px", color: "#047857", lineHeight: 1.5 }}>
              {profile.partnerPreferences}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
