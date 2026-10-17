"use client";

import React from "react";
import { 
  Eye, 
  Heart, 
  Send, 
  Mail, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight, 
  BookOpen, 
  Lock 
} from "lucide-react";

export default function HomeDashboard({ 
  onViewProfile, 
  onSendInterest, 
  onOpenGuide, 
  setCurrentTab,
  currentUser = null,
  isPremium = false,
  onUpgradeToPremium,
  stats = { views: 12, shortlisted: 5, sent: 3, messages: 2 },
  profiles = []
}) {
  const dailyMatch = profiles.find(p => p.id === "RS-84920") || profiles[0];
  const recommendedMatches = profiles.filter(p => p.id !== dailyMatch?.id).slice(0, 3);
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "Ahmed";

  return (
    <div className="home-dashboard-container animate-fade" style={{ paddingBottom: "70px" }}>
      {/* Mobile-Native Greeting Card */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        color: "#ffffff",
        borderRadius: "20px",
        padding: "20px 18px",
        marginBottom: "16px",
        boxShadow: "0 6px 20px rgba(5, 150, 105, 0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{
            fontFamily: "var(--font-arabic)",
            fontSize: "14px",
            color: "#fef3c7"
          }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span style={{
            background: "rgba(255,255,255,0.2)",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "10px",
            fontWeight: "700"
          }}>
            🇮🇳 India Only
          </span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "2px" }}>
          Assalamu Alaikum, {firstName}
        </h1>
        <p style={{ fontSize: "12px", color: "#ecfdf5", opacity: 0.9 }}>
          May Allah bless your search today. Here are your latest matches.
        </p>
      </div>

      {/* Premium Upsell Banner for Free Users */}
      {!isPremium && (
        <div
          onClick={onUpgradeToPremium}
          role="button"
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "1px solid #fde68a",
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(217, 119, 6, 0.15)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 10px rgba(251, 191, 36, 0.4)"
            }}>
              <Lock size={17} color="#ffffff" />
            </div>
            <div>
              <div style={{ color: "#78350f", fontSize: "13px", fontWeight: "800" }}>Unlock Photos &amp; Halal Chat</div>
              <div style={{ color: "#b45309", fontSize: "11px" }}>Upgrade to Premium to connect with your matches</div>
            </div>
          </div>
          <ChevronRight size={16} color="#d97706" />
        </div>
      )}

      {/* 4 Clean Stats Tiles (Matches 9_screen.png) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        marginBottom: "20px"
      }}>
        {/* Views */}
        <div 
          onClick={() => setCurrentTab("browse")}
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 6px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: "pointer"
          }}
        >
          <Eye size={16} color="#059669" style={{ margin: "0 auto 4px" }} />
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", display: "block" }}>{stats.views}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>Views</span>
        </div>

        {/* Shortlisted */}
        <div 
          onClick={() => setCurrentTab("browse")}
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 6px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: "pointer"
          }}
        >
          <Heart size={16} color="#db2777" style={{ margin: "0 auto 4px" }} />
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", display: "block" }}>{stats.shortlisted}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>Saved</span>
        </div>

        {/* Requests Sent */}
        <div 
          onClick={() => setCurrentTab("interests")}
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 6px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: "pointer"
          }}
        >
          <Send size={16} color="#2563eb" style={{ margin: "0 auto 4px" }} />
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", display: "block" }}>{stats.sent}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>Sent</span>
        </div>

        {/* Messages */}
        <div 
          onClick={() => setCurrentTab("messages")}
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 6px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: "pointer"
          }}
        >
          <Mail size={16} color="#d97706" style={{ margin: "0 auto 4px" }} />
          <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", display: "block" }}>{stats.messages}</span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600" }}>Chat</span>
        </div>
      </div>

      {/* Daily Match Card (Matches 9_screen.png) */}
      {dailyMatch && (
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>Daily Recommended Match</span>
            <span className="badge-pill badge-green" style={{ fontSize: "10px", padding: "2px 8px" }}>
              <Sparkles size={10} /> 98% Match
            </span>
          </div>

          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1.5px solid #a7f3d0",
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(5, 150, 105, 0.08)"
          }}>
            {/* Photo with overlay */}
            <div style={{ position: "relative", height: "200px" }}>
              <img 
                src={dailyMatch.avatar} 
                alt={dailyMatch.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: isPremium ? "none" : "blur(14px)", transform: isPremium ? "none" : "scale(1.1)" }}
              />
              {!isPremium && (
                <button
                  onClick={onUpgradeToPremium}
                  style={{
                    position: "absolute", inset: 0,
                    width: "100%", height: "100%",
                    background: "rgba(15, 23, 42, 0.35)",
                    border: "none", cursor: "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <span style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <Lock size={18} color="#312e81" />
                  </span>
                  <span style={{ color: "#ffffff", fontSize: "12px", fontWeight: "700" }}>Upgrade to View Photo</span>
                </button>
              )}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "12px 14px",
                background: "linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 100%)",
                color: "#ffffff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800" }}>{dailyMatch.name}, {dailyMatch.age}</h3>
                  <CheckCircle2 size={16} color="#10b981" />
                </div>
                <p style={{ fontSize: "12px", opacity: 0.9 }}>{dailyMatch.profession} • {dailyMatch.city}, {dailyMatch.state}</p>
              </div>
            </div>

            {/* Content & Action Buttons */}
            <div style={{ padding: "14px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
                <span className="badge-pill badge-gray" style={{ fontSize: "11px" }}>{dailyMatch.religiousPractice || "Practicing"}</span>
                <span className="badge-pill badge-gray" style={{ fontSize: "11px" }}>{dailyMatch.height}</span>
                <span className="badge-pill badge-green" style={{ fontSize: "11px" }}>Aadhaar Verified</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "8px" }}>
                <button
                  onClick={() => onViewProfile(dailyMatch)}
                  className="btn-outline-action"
                  style={{ padding: "9px", fontSize: "12px" }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => onSendInterest(dailyMatch)}
                  className="btn-primary-action"
                  style={{ padding: "9px", fontSize: "12px" }}
                >
                  <Send size={13} /> Send Salaam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Matches List (Clean Mobile Cards) */}
      <div style={{ marginBottom: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>More Matches Near You</span>
          <button 
            onClick={() => setCurrentTab("browse")}
            style={{ color: "var(--primary)", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center" }}
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recommendedMatches.map(p => (
            <div
              key={p.id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "12px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img 
                  src={p.avatar || "/images/ayesha.jpg"} 
                  alt={p.name}
                  style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", filter: isPremium ? "none" : "blur(6px)" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{p.name}, {p.age}</h4>
                    {p.verified && <CheckCircle2 size={13} color="#059669" />}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{p.profession}</p>
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{p.city}, {p.state}</span>
                </div>
              </div>

              <button
                onClick={() => onViewProfile(p)}
                className="btn-outline-action"
                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "10px" }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Halal Marriage Guide Shortcut */}
      <div 
        onClick={() => onOpenGuide("taaruf-questions")}
        style={{
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "16px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={20} color="#059669" />
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>15 Questions for Halal Taaruf</h4>
            <p style={{ fontSize: "11px", color: "#047857" }}>Essential questions to ask a potential spouse</p>
          </div>
        </div>
        <ChevronRight size={16} color="#059669" />
      </div>
    </div>
  );
}
