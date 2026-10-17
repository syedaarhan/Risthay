"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Send, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  X
} from "lucide-react";

export default function BrowseProfiles({ 
  profiles = [], 
  shortlistedIds = [], 
  onToggleShortlist, 
  onViewProfile, 
  onSendInterest,
  globalPhotoBlur = false,
  onToggleGlobalPhotoBlur,
  isPremium = false,
  onUpgradeToPremium
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'shortlisted' | 'verified' | 'nearby'

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      if (activeFilter === "shortlisted" && !shortlistedIds.includes(profile.id)) return false;
      if (activeFilter === "verified" && !profile.verified) return false;
      if (activeFilter === "nearby" && !["Maharashtra", "Telangana"].includes(profile.state)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (profile.name || "").toLowerCase().includes(q);
        const matchesProf = (profile.profession || "").toLowerCase().includes(q);
        const matchesCity = (profile.city || "").toLowerCase().includes(q);
        if (!matchesName && !matchesProf && !matchesCity) return false;
      }

      return true;
    });
  }, [profiles, activeFilter, shortlistedIds, searchQuery]);

  return (
    <div className="browse-profiles-container animate-fade" style={{ paddingBottom: "70px" }}>
      {/* Premium Upgrade Banner for Free Users */}
      {!isPremium && (
        <div
          onClick={onUpgradeToPremium}
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
            borderRadius: "16px",
            padding: "14px 16px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            border: "1px solid rgba(99,102,241,0.3)"
          }}
        >
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Lock size={18} color="#ffffff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: "700" }}>Upgrade to See Full Photos</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>Free plan: photos are blurred. Tap to unlock.</div>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "#0f172a", fontSize: "11px", fontWeight: "800",
            padding: "6px 12px", borderRadius: "12px", whiteSpace: "nowrap"
          }}>Upgrade ✨</div>
        </div>
      )}

      {/* Search Header (Matches 7_screen.png) */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "13px" }} />
          <input 
            type="text"
            placeholder="Search by ID, profession or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px 11px 38px",
              borderRadius: "14px",
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              fontSize: "13px",
              color: "#0f172a"
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "12px", top: "11px", color: "var(--text-muted)" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 4 Simple Filter Chips (Matches 7_screen.png) */}
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none"
        }}>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "11px",
              fontWeight: "700",
              background: activeFilter === "all" ? "var(--primary)" : "#ffffff",
              color: activeFilter === "all" ? "#ffffff" : "var(--text-secondary)",
              border: "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }}
          >
            All Profiles ({profiles.length})
          </button>

          <button
            onClick={() => setActiveFilter("nearby")}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "11px",
              fontWeight: "700",
              background: activeFilter === "nearby" ? "var(--primary)" : "#ffffff",
              color: activeFilter === "nearby" ? "#ffffff" : "var(--text-secondary)",
              border: "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }}
          >
            Near Me (Mumbai/Hyd)
          </button>

          <button
            onClick={() => setActiveFilter("verified")}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "11px",
              fontWeight: "700",
              background: activeFilter === "verified" ? "var(--primary)" : "#ffffff",
              color: activeFilter === "verified" ? "#ffffff" : "var(--text-secondary)",
              border: "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }}
          >
            Verified Only
          </button>

          <button
            onClick={() => setActiveFilter("shortlisted")}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              fontSize: "11px",
              fontWeight: "700",
              background: activeFilter === "shortlisted" ? "var(--primary)" : "#ffffff",
              color: activeFilter === "shortlisted" ? "#ffffff" : "var(--text-secondary)",
              border: "1px solid #e2e8f0",
              whiteSpace: "nowrap"
            }}
          >
            Saved ({shortlistedIds.length})
          </button>
        </div>
      </div>

      {/* Profiles Cards Feed (Matches 7_screen.png & 10_screen.png) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filteredProfiles.map(profile => {
          const isShortlisted = shortlistedIds.includes(profile.id);
          const isBlur = !isPremium || globalPhotoBlur || profile.photoHidden;

          return (
            <div
              key={profile.id}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              {/* Profile Top Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ position: "relative", width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "#f1f5f9" }}>
                    {profile.photoHidden && !profile.avatar ? (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ecfdf5" }}>
                        <Lock size={20} color="#059669" />
                      </div>
                    ) : (
                      <>
                        <img 
                          src={profile.avatar} 
                          alt={profile.name}
                          className={isBlur ? "photo-blurred" : "photo-revealed"}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {!isPremium && (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(15,23,42,0.3)"
                          }}>
                            <Lock size={14} color="#ffffff" />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                        {profile.name}, {profile.age}
                      </h3>
                      {profile.verified && <CheckCircle2 size={15} color="#059669" />}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>
                      {profile.profession}
                    </p>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={11} /> {profile.city}, {profile.state}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleShortlist(profile.id)}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: isShortlisted ? "#ecfdf5" : "#f1f5f9",
                    color: isShortlisted ? "#059669" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {isShortlisted ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>

              {/* Tag Pills (Matches 7_screen.png) */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <span className="badge-pill badge-gray" style={{ fontSize: "10px" }}>{profile.religiousPractice || "Practicing"}</span>
                <span className="badge-pill badge-gray" style={{ fontSize: "10px" }}>{profile.height}</span>
                <span className="badge-pill badge-gray" style={{ fontSize: "10px" }}>{profile.maritalStatus}</span>
                <span className="badge-pill badge-green" style={{ fontSize: "10px" }}>Aadhaar Verified</span>
              </div>

              {/* Action Buttons (Matches 7_screen.png: View Profile & Send Salaam) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "8px" }}>
                <button
                  onClick={() => onViewProfile(profile)}
                  className="btn-outline-action"
                  style={{ padding: "9px", fontSize: "12px", borderRadius: "12px" }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => onSendInterest(profile)}
                  className="btn-primary-action"
                  style={{ padding: "9px", fontSize: "12px", borderRadius: "12px" }}
                >
                  <Send size={13} /> Send Salaam
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
