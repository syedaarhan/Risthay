"use client";

import React from "react";
import { Home, Compass, Heart, MessageSquare, User } from "lucide-react";

export default function BottomNav({ 
  currentTab, 
  setCurrentTab, 
  receivedCount = 3, 
  unreadMessagesCount = 2 
}) {
  return (
    <div 
      className="mobile-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        padding: "8px 16px 12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.06)"
      }}
    >
      {/* Home */}
      <button
        onClick={() => setCurrentTab("home")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: currentTab === "home" ? "var(--primary)" : "var(--text-muted)",
          fontWeight: currentTab === "home" ? "700" : "500",
          fontSize: "11px",
          padding: "4px 8px"
        }}
      >
        <Home size={22} color={currentTab === "home" ? "var(--primary)" : "#64748b"} />
        <span>Home</span>
      </button>

      {/* Search Profiles */}
      <button
        onClick={() => setCurrentTab("browse")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: currentTab === "browse" ? "var(--primary)" : "var(--text-muted)",
          fontWeight: currentTab === "browse" ? "700" : "500",
          fontSize: "11px",
          padding: "4px 8px"
        }}
      >
        <Compass size={22} color={currentTab === "browse" ? "var(--primary)" : "#64748b"} />
        <span>Search</span>
      </button>

      {/* Center Elevated Interests Heart Button */}
      <button
        onClick={() => setCurrentTab("interests")}
        style={{
          position: "relative",
          marginTop: "-20px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          boxShadow: "0 6px 18px rgba(5, 150, 105, 0.45)",
          border: "4px solid #ffffff"
        }}
      >
        <Heart size={24} fill="#ffffff" stroke="none" />
        {receivedCount > 0 && (
          <span style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            background: "#ef4444",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: "700",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #ffffff"
          }}>
            {receivedCount}
          </span>
        )}
      </button>

      {/* Chats */}
      <button
        onClick={() => setCurrentTab("messages")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: currentTab === "messages" ? "var(--primary)" : "var(--text-muted)",
          fontWeight: currentTab === "messages" ? "700" : "500",
          fontSize: "11px",
          padding: "4px 8px",
          position: "relative"
        }}
      >
        <div style={{ position: "relative" }}>
          <MessageSquare size={22} color={currentTab === "messages" ? "var(--primary)" : "#64748b"} />
          {unreadMessagesCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-6px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "9px",
              fontWeight: "700",
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #ffffff"
            }}>
              {unreadMessagesCount}
            </span>
          )}
        </div>
        <span>Chats</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => setCurrentTab("myProfile")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: currentTab === "myProfile" ? "var(--primary)" : "var(--text-muted)",
          fontWeight: currentTab === "myProfile" ? "700" : "500",
          fontSize: "11px",
          padding: "4px 8px"
        }}
      >
        <User size={22} color={currentTab === "myProfile" ? "var(--primary)" : "#64748b"} />
        <span>Profile</span>
      </button>
    </div>
  );
}
