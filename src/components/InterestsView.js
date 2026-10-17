"use client";

import React, { useState } from "react";
import { 
  Heart, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Info,
  Check,
  X,
  Lock,
  MessageSquare
} from "lucide-react";

export default function InterestsView({
  receivedInterests = [],
  sentInterests = [],
  onAcceptInterest,
  onDeclineInterest,
  onUndoDecline,
  declinedList = [],
  onViewProfile,
  onOpenChatWithMatch,
  isPremium = false,
  onUpgradeToPremium
}) {
  const [subTab, setSubTab] = useState("received"); // 'received' | 'sent'
  const [sentFilter, setSentFilter] = useState("all"); // 'all' | 'pending' | 'accepted' | 'declined'

  const filteredSent = sentInterests.filter(item => {
    if (sentFilter === "all") return true;
    return item.status === sentFilter;
  });

  return (
    <div className="interests-view-container animate-fade" style={{ paddingBottom: "70px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header Tabs (Matches 13_screen.png & 14_screen.png) */}
      <div style={{
        background: "#ffffff",
        borderRadius: "24px",
        padding: "8px",
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <button
          onClick={() => setSubTab("received")}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "18px",
            fontWeight: "700",
            fontSize: "14px",
            background: subTab === "received" ? "var(--primary)" : "transparent",
            color: subTab === "received" ? "#ffffff" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <Heart size={18} fill={subTab === "received" ? "#ffffff" : "none"} />
          <span>Received Interests ({receivedInterests.length})</span>
        </button>

        <button
          onClick={() => setSubTab("sent")}
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "18px",
            fontWeight: "700",
            fontSize: "14px",
            background: subTab === "sent" ? "var(--primary)" : "transparent",
            color: subTab === "sent" ? "#ffffff" : "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          <Send size={18} />
          <span>Sent Interests ({sentInterests.length})</span>
        </button>
      </div>

      {/* RECEIVED INTERESTS CONTENT (Matches 13_screen.png) */}
      {subTab === "received" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              NEW REQUESTS ({receivedInterests.length})
            </span>
            <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>
              Mark all read
            </span>
          </div>

          {receivedInterests.length === 0 ? (
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "40px",
              textAlign: "center",
              border: "1px solid var(--border-light)",
              marginBottom: "24px"
            }}>
              <Heart size={36} color="var(--primary)" style={{ margin: "0 auto 10px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>No pending received interests</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                Keep your profile updated with complete family details to receive more responses.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {receivedInterests.map(req => (
                <div
                  key={req.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "20px",
                    border: "1px solid var(--border-card)",
                    boxShadow: "var(--shadow-sm)"
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <div style={{ position: "relative" }}>
                        <img 
                          src={req.avatar} 
                          alt={req.name}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            filter: isPremium ? "none" : "blur(7px)"
                          }} 
                        />
                        <span style={{
                          position: "absolute",
                          bottom: "1px",
                          right: "1px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#059669",
                          border: "2px solid #ffffff"
                        }} />
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                            {req.name}
                          </h3>
                          {req.verified && (
                            <CheckCircle2 size={16} color="#059669" />
                          )}
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          {req.age} yrs • {req.profession}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <MapPin size={12} /> {req.city}
                        </p>
                      </div>
                    </div>

                    <span style={{
                      background: "#f1f5f9",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--text-muted)"
                    }}>
                      {req.timestamp}
                    </span>
                  </div>

                  {req.note && (
                    <div style={{
                      background: "#f8fafc",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontStyle: "italic",
                      marginBottom: "16px",
                      borderLeft: "3px solid var(--primary)"
                    }}>
                      &ldquo;{req.note}&rdquo;
                    </div>
                  )}

                  {/* Actions (Matches 13_screen.png: Decline & Accept Interest) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "12px" }}>
                    <button
                      onClick={() => onDeclineInterest(req)}
                      className="btn-outline-action"
                      style={{ padding: "10px", fontSize: "13px" }}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => onAcceptInterest(req)}
                      className="btn-primary-action"
                      style={{ padding: "10px", fontSize: "13px" }}
                    >
                      <Check size={16} /> Accept Interest
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Earlier Declined Section (Matches 13_screen.png) */}
          {declinedList.length > 0 && (
            <div>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "12px" }}>
                EARLIER DECLINED
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {declinedList.map(item => (
                  <div 
                    key={item.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      padding: "14px 18px",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img 
                        src={item.avatar} 
                        alt={item.name}
                        style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", opacity: 0.8, filter: isPremium ? "none" : "blur(6px)" }} 
                      />
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "700" }}>{item.name}</h4>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Declined • Just now</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUndoDecline(item)}
                      style={{
                        color: "var(--primary)",
                        fontWeight: "700",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <RotateCcw size={14} /> Undo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SENT INTERESTS CONTENT (Matches 14_screen.png) */}
      {subTab === "sent" && (
        <div>
          {/* Status Filter Chips (Matches 14_screen.png) */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
            <button
              onClick={() => setSentFilter("all")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: sentFilter === "all" ? "var(--primary-subtle)" : "#f1f5f9",
                color: sentFilter === "all" ? "var(--primary)" : "var(--text-secondary)",
                border: sentFilter === "all" ? "1px solid var(--primary-border)" : "1px solid transparent"
              }}
            >
              All ({sentInterests.length})
            </button>

            <button
              onClick={() => setSentFilter("pending")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: sentFilter === "pending" ? "#fffbeb" : "#f1f5f9",
                color: sentFilter === "pending" ? "#b45309" : "var(--text-secondary)",
                border: sentFilter === "pending" ? "1px solid #fde68a" : "1px solid transparent"
              }}
            >
              Pending ({sentInterests.filter(i => i.status === "pending").length})
            </button>

            <button
              onClick={() => setSentFilter("accepted")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: sentFilter === "accepted" ? "#ecfdf5" : "#f1f5f9",
                color: sentFilter === "accepted" ? "#047857" : "var(--text-secondary)",
                border: sentFilter === "accepted" ? "1px solid #a7f3d0" : "1px solid transparent"
              }}
            >
              Accepted ({sentInterests.filter(i => i.status === "accepted").length})
            </button>

            <button
              onClick={() => setSentFilter("declined")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: sentFilter === "declined" ? "#f1f5f9" : "#f1f5f9",
                color: sentFilter === "declined" ? "#64748b" : "var(--text-secondary)",
                border: sentFilter === "declined" ? "1px solid #cbd5e1" : "1px solid transparent"
              }}
            >
              Declined ({sentInterests.filter(i => i.status === "declined").length})
            </button>
          </div>

          {/* Sent Items List (Matches 14_screen.png) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
            {filteredSent.map(item => (
              <div 
                key={item.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "18px 20px",
                  border: "1px solid var(--border-card)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <img 
                    src={item.avatar || "/images/ayesha.jpg"} 
                    alt={item.name}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      filter: isPremium ? "none" : "blur(6px)"
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                      {item.name}
                    </h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      {item.age} yrs • {item.profession}
                    </p>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.timestamp}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {item.status === "pending" && (
                    <span style={{
                      background: "#fffbeb",
                      color: "#b45309",
                      padding: "6px 14px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid #fde68a"
                    }}>
                      <Clock size={13} /> Pending
                    </span>
                  )}

                  {item.status === "accepted" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        background: "#ecfdf5",
                        color: "#059669",
                        padding: "6px 14px",
                        borderRadius: "14px",
                        fontSize: "12px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "1px solid #a7f3d0"
                      }}>
                        <CheckCircle2 size={13} /> Accepted
                      </span>

                      <button
                        onClick={() => (isPremium ? onOpenChatWithMatch(item.profileId) : onUpgradeToPremium?.())}
                        className="btn-primary-action"
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          background: isPremium ? undefined : "linear-gradient(135deg, #1e1b4b, #312e81)"
                        }}
                      >
                        {isPremium ? <MessageSquare size={13} /> : <Lock size={13} />}
                        {isPremium ? "Chat" : "Unlock Chat"}
                      </button>
                    </div>
                  )}

                  {item.status === "declined" && (
                    <span style={{
                      background: "#f1f5f9",
                      color: "#64748b",
                      padding: "6px 14px",
                      borderRadius: "14px",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <XCircle size={13} /> Declined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Halal Auto-Expiry Notice (Matches 14_screen.png) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "12px",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "16px"
          }}>
            <Info size={15} color="var(--primary)" />
            <span>Requests are automatically expired after 30 days if no action is taken.</span>
          </div>
        </div>
      )}
    </div>
  );
}
