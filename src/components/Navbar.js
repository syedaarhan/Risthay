"use client";

import React, { useState } from "react";
import { 
  Heart, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Bell, 
  Settings, 
  Smartphone, 
  Monitor, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  UserPlus,
  Compass
} from "lucide-react";

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  receivedCount = 3, 
  unreadMessagesCount = 2,
  isMobileDeviceView,
  setIsMobileDeviceView,
  onOpenSettings,
  onOpenWizard
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: "Ayesha Khan accepted your Salaam", time: "10 mins ago", unread: true },
    { id: 2, title: "Aadhaar Verification Completed: 100% Verified", time: "1 hour ago", unread: false },
    { id: 3, title: "Dr. Zainab Parveen viewed your profile", time: "3 hours ago", unread: false }
  ];

  return (
    <header className="glass-header sticky top-0 z-50 transition-all">
      {/* Top Halal Ribbon */}
      <div style={{
        background: "linear-gradient(90deg, #064e3b 0%, #059669 50%, #047857 100%)",
        color: "#ecfdf5",
        padding: "6px 16px",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        letterSpacing: "0.3px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ 
            fontFamily: "var(--font-arabic)", 
            fontSize: "15px", 
            color: "#fef3c7",
            letterSpacing: "1px" 
          }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span style={{ opacity: 0.9 }}>
            India&apos;s Dedicated Halal Matrimony Platform • 100% Aadhaar Verified Profiles
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ 
            background: "rgba(255,255,255,0.15)", 
            padding: "2px 8px", 
            borderRadius: "12px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontWeight: "500"
          }}>
            <MapPin size={12} color="#a7f3d0" /> Only in India (28 States & UTs)
          </span>

          {/* Device Mockup Toggle */}
          <button
            onClick={() => setIsMobileDeviceView(!isMobileDeviceView)}
            style={{
              background: isMobileDeviceView ? "#fef3c7" : "rgba(255,255,255,0.2)",
              color: isMobileDeviceView ? "#92400e" : "#ffffff",
              padding: "3px 10px",
              borderRadius: "14px",
              fontSize: "11px",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
            title="Toggle between full responsive desktop view and smartphone app frame"
          >
            {isMobileDeviceView ? <Monitor size={12} /> : <Smartphone size={12} />}
            {isMobileDeviceView ? "Switch to Desktop View" : "View App Mockup Frame"}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab("home")}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <img 
            src="/images/logo.png" 
            alt="Risthay Muslim Matrimony" 
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              objectFit: "contain",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
            }} 
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ 
                fontSize: "24px", 
                fontWeight: "800", 
                letterSpacing: "-0.5px",
                color: "#0f172a"
              }}>
                Risthay
              </span>
              <span style={{
                background: "linear-gradient(135deg, #059669, #10b981)",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                India
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500", marginTop: "-2px" }}>
              Halal Muslim Matrimony
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }} className="desktop-nav">
          <button
            onClick={() => setCurrentTab("home")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: currentTab === "home" ? "700" : "500",
              color: currentTab === "home" ? "var(--primary)" : "var(--text-secondary)",
              background: currentTab === "home" ? "var(--primary-subtle)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Compass size={17} /> Home
          </button>

          <button
            onClick={() => setCurrentTab("browse")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: currentTab === "browse" ? "700" : "500",
              color: currentTab === "browse" ? "var(--primary)" : "var(--text-secondary)",
              background: currentTab === "browse" ? "var(--primary-subtle)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Users size={17} /> Search Profiles
          </button>

          <button
            onClick={() => setCurrentTab("interests")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: currentTab === "interests" ? "700" : "500",
              color: currentTab === "interests" ? "var(--primary)" : "var(--text-secondary)",
              background: currentTab === "interests" ? "var(--primary-subtle)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              position: "relative"
            }}
          >
            <Heart size={17} /> Interests
            {receivedCount > 0 && (
              <span style={{
                background: "#059669",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "1px 6px",
                borderRadius: "10px",
                marginLeft: "2px"
              }}>
                {receivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab("messages")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: currentTab === "messages" ? "700" : "500",
              color: currentTab === "messages" ? "var(--primary)" : "var(--text-secondary)",
              background: currentTab === "messages" ? "var(--primary-subtle)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <MessageSquare size={17} /> Halal Chat
            {unreadMessagesCount > 0 && (
              <span style={{
                background: "#ef4444",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
                padding: "1px 6px",
                borderRadius: "10px",
                marginLeft: "2px"
              }}>
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab("guides")}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: currentTab === "guides" ? "700" : "500",
              color: currentTab === "guides" ? "var(--primary)" : "var(--text-secondary)",
              background: currentTab === "guides" ? "var(--primary-subtle)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <BookOpen size={17} /> Halal Guides
          </button>
        </nav>

        {/* Right CTA & Profile Area */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onOpenWizard}
            className="btn-primary-action"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              borderRadius: "12px"
            }}
          >
            <UserPlus size={16} /> Create Profile (7 Steps)
          </button>

          {/* Notifications Trigger */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                position: "relative"
              }}
            >
              <Bell size={18} />
              <span style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "8px",
                height: "8px",
                background: "#ef4444",
                borderRadius: "50%",
                border: "2px solid #ffffff"
              }} />
            </button>

            {showNotifications && (
              <div 
                className="animate-slide-up"
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "320px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-elevated)",
                  border: "1px solid var(--border-light)",
                  padding: "16px",
                  zIndex: 100
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px" }}>Notifications</span>
                  <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>
                    Mark all read
                  </span>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: "10px",
                    borderRadius: "10px",
                    background: n.unread ? "var(--primary-subtle)" : "#f8fafc",
                    marginBottom: "8px",
                    fontSize: "12px"
                  }}>
                    <p style={{ fontWeight: "600", color: "#0f172a" }}>{n.title}</p>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)"
            }}
            title="Privacy & Account Settings"
          >
            <Settings size={18} />
          </button>

          {/* User Profile Avatar Pill */}
          <div 
            onClick={() => setCurrentTab("myProfile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#ffffff",
              padding: "4px 10px 4px 4px",
              borderRadius: "30px",
              border: "1px solid var(--border-light)",
              cursor: "pointer",
              boxShadow: "var(--shadow-sm)"
            }}
          >
            <div style={{ position: "relative" }}>
              <img 
                src="/images/ahmed.jpg" 
                alt="Ahmed"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
              <span style={{
                position: "absolute",
                bottom: "-1px",
                right: "-1px",
                width: "10px",
                height: "10px",
                background: "#059669",
                borderRadius: "50%",
                border: "2px solid #ffffff"
              }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", lineHeight: 1.1 }}>Ahmed R.</span>
              <span style={{ fontSize: "10px", color: "#059669", fontWeight: "600" }}>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
