"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldCheck, 
  Search, 
  Send, 
  CheckCircle2, 
  UserPlus, 
  Lock, 
  ArrowLeft,
  Phone, 
  Sparkles,
  Info,
  CheckCheck,
  User,
  Heart,
  MessageCircle,
  Clock,
  Shield
} from "lucide-react";

export default function MessagesView({ 
  chats = [], 
  activeChatId, 
  setActiveChatId, 
  onSendMessage,
  onViewProfile,
  isPremium = false,
  onUpgradeToPremium
}) {
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);
  const [chatSearch, setChatSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [waliInvited, setWaliInvited] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedChat = chats.find(c => c.id === activeChatId) || null;

  const filteredChats = chats.filter(c => 
    (c.name || "").toLowerCase().includes(chatSearch.toLowerCase()) ||
    (c.profession || "").toLowerCase().includes(chatSearch.toLowerCase())
  );

  // Auto-scroll to bottom of chat thread on new messages
  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !selectedChat) return;

    onSendMessage(selectedChat.id, inputMessage.trim());
    setInputMessage("");
  };

  const sendIcebreaker = (text) => {
    if (!selectedChat) return;
    onSendMessage(selectedChat.id, text);
  };

  return (
    <>
      {/* FREE USER PREMIUM GATE */}
      {!isPremium && (
        <div className="animate-fade" style={{
          width: "100%", padding: "24px 16px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "70vh"
        }}>
          <div style={{
            background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)",
            borderRadius: "28px",
            padding: "36px 28px",
            textAlign: "center",
            border: "1px solid rgba(99,102,241,0.3)",
            width: "100%", maxWidth: "340px"
          }}>
            <div style={{
              width: "70px", height: "70px", borderRadius: "50%",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 30px rgba(251,191,36,0.4)"
            }}>
              <Lock size={30} color="#ffffff" />
            </div>
            <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}>
              Chat is Premium Only
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", lineHeight: 1.7, marginBottom: "24px" }}>
              Halal Chat is an exclusive feature for Premium members. Upgrade to connect with your matches and start meaningful conversations.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {["Private & Moderated Halal Chat", "Read receipts & message history", "Wali / Guardian Chat Invite"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MessageCircle size={11} color="#ffffff" />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", textAlign: "left" }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onUpgradeToPremium}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#0f172a",
                fontWeight: "800",
                fontSize: "15px",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(251,191,36,0.35)"
              }}
            >
              <Shield size={16} />
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM USERS: Full Chat UI */}
      {isPremium && (
        <>
      {/* ============================================================== */}
      {/* VIEW 1: FULL MOBILE CONVERSATIONS LIST (When no chat is active) */}
      {/* ============================================================== */}
      {!selectedChat && (
        <div className="animate-fade" style={{ width: "100%", margin: "0 auto", padding: "16px 16px 20px 16px" }}>
          {/* Header Title & Counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                Messages
              </h1>
              <span style={{
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "11px",
                fontWeight: "800",
                padding: "3px 9px",
                borderRadius: "12px",
                border: "1px solid #a7f3d0"
              }}>
                {chats.length} Active
              </span>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              color: "#059669",
              fontWeight: "700",
              background: "#f0fdf4",
              padding: "4px 10px",
              borderRadius: "14px",
              border: "1px solid #bbf7d0"
            }}>
              <ShieldCheck size={13} />
              <span>Halal Mode</span>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "12px" }} />
            <input 
              type="text"
              placeholder="Search conversations by name or profession..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                borderRadius: "14px",
                border: "1.5px solid #e2e8f0",
                background: "#ffffff",
                fontSize: "13px",
                boxSizing: "border-box",
                outline: "none",
                color: "#0f172a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
              }}
            />
          </div>

          {/* Active Matches Avatars Strip */}
          {chats.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-muted)", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                RECENT MATCHES
              </span>
              <div style={{
                display: "flex",
                gap: "14px",
                overflowX: "auto",
                paddingBottom: "4px",
                scrollbarWidth: "none"
              }}>
                {chats.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                      flexShrink: 0,
                      width: "60px"
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img 
                        src={c.avatar || "/images/ayesha.jpg"} 
                        alt={c.name}
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #059669",
                          padding: "1px"
                        }}
                      />
                      <span style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "2px solid #ffffff"
                      }} />
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#334155",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                      textAlign: "center"
                    }}>
                      {c.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Notice Banner */}
          {showSafetyBanner && (
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
              borderRadius: "16px",
              padding: "12px 14px",
              border: "1px solid #a7f3d0",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.1)"
                }}>
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: "800", color: "#065f46", margin: "0 0 2px 0" }}>
                    Halal Islamic Conduct & Wali Support
                  </h4>
                  <p style={{ fontSize: "11px", color: "#334155", lineHeight: 1.45, margin: 0 }}>
                    Messages are intended for marriage proposals. You can invite your Wali (Guardian) into any conversation with one tap.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSafetyBanner(false)}
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Conversations Cards List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredChats.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #e2e8f0"
              }}>
                <MessageCircle size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>
                  No Conversations Found
                </h3>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                  Explore verified profiles and send Salaams to start connecting!
                </p>
              </div>
            ) : (
              filteredChats.map(chat => {
                const lastMessage = chat.messages[chat.messages.length - 1];

                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }}
                    className="hover-lift"
                  >
                    {/* Avatar with Online indicator */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img 
                        src={chat.avatar || "/images/ayesha.jpg"} 
                        alt={chat.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          objectFit: "cover"
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

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                          <h4 style={{
                            fontSize: "14px",
                            fontWeight: "800",
                            color: "#0f172a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            margin: 0
                          }}>
                            {chat.name}
                          </h4>
                          {chat.verified && (
                            <CheckCircle2 size={13} color="#059669" style={{ flexShrink: 0 }} />
                          )}
                        </div>

                        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", flexShrink: 0 }}>
                          {lastMessage ? lastMessage.time : "Active"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                        <p style={{
                          fontSize: "12px",
                          color: chat.unreadCount > 0 ? "#0f172a" : "#64748b",
                          fontWeight: chat.unreadCount > 0 ? "700" : "500",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          margin: 0
                        }}>
                          {lastMessage ? lastMessage.text : "Assalamu Alaikum..."}
                        </p>

                        {chat.unreadCount > 0 && (
                          <span style={{
                            background: "#059669",
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: "800",
                            padding: "2px 7px",
                            borderRadius: "10px",
                            flexShrink: 0
                          }}>
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: TRUE FULL-SCREEN CHAT ROOM (Immersive Mobile View)     */}
      {/* ============================================================== */}
      {selectedChat && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            maxWidth: "480px",
            margin: "0 auto",
            height: "100dvh",
            zIndex: 1250,
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          className="animate-slide-up"
        >
          {/* Top Sticky Chat Bar */}
          <div style={{
            height: "62px",
            padding: "0 14px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            flexShrink: 0,
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
          }}>
            {/* Left: Back Arrow + Contact Details */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
              <button
                type="button"
                onClick={() => setActiveChatId(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "12px",
                  width: "36px",
                  height: "36px",
                  color: "#0f172a",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s ease"
                }}
                title="Back to messages list"
              >
                <ArrowLeft size={18} />
              </button>

              <div 
                onClick={() => onViewProfile && onViewProfile({
                  id: selectedChat.matchId,
                  name: selectedChat.name,
                  age: selectedChat.age,
                  avatar: selectedChat.avatar,
                  city: selectedChat.city,
                  profession: selectedChat.profession,
                  verified: true
                })}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", minWidth: 0 }}
                title="Click to view full profile"
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img 
                    src={selectedChat.avatar || "/images/ayesha.jpg"} 
                    alt={selectedChat.name}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <span style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "#059669",
                    border: "2px solid #ffffff"
                  }} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <h3 style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: "#0f172a",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {selectedChat.name}
                    </h3>
                    {selectedChat.verified && (
                      <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{
                    fontSize: "11px",
                    color: "#059669",
                    fontWeight: "600",
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    ● {selectedChat.lastSeen || "Active now"} • Halal Monitored
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action Icons: Wali Mode & Voice Call */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setShowCallModal(true)}
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "10px",
                  width: "34px",
                  height: "34px",
                  color: "#059669",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Guardian / Wali Voice Call"
              >
                <Phone size={15} />
              </button>

              <button
                type="button"
                onClick={() => setWaliInvited(!waliInvited)}
                style={{
                  background: waliInvited ? "#059669" : "#f8fafc",
                  color: waliInvited ? "#ffffff" : "#475569",
                  border: `1px solid ${waliInvited ? "#059669" : "#cbd5e1"}`,
                  padding: "6px 10px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                title="Involve Wali or Guardian in this chat for full halal transparency"
              >
                <UserPlus size={12} />
                <span>{waliInvited ? "Wali Active ✓" : "Invite Wali"}</span>
              </button>
            </div>
          </div>

          {/* Full Screen Chat Thread Stream */}
          <div style={{
            flex: 1,
            padding: "16px 14px",
            overflowY: "auto",
            background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            {/* Halal Reminder Header Pill */}
            <div style={{
              margin: "0 auto 8px",
              background: "#ffffff",
              border: "1px solid #d1fae5",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              color: "#065f46",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 6px rgba(5, 150, 105, 0.06)"
            }}>
              <Lock size={12} color="#059669" />
              <span>Halal Matrimonial Room • Messages Monitored for Adab</span>
            </div>

            {/* Date divider */}
            <div style={{ textAlign: "center", margin: "2px 0 8px" }}>
              <span style={{
                background: "#e2e8f0",
                color: "#64748b",
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 10px",
                borderRadius: "10px"
              }}>
                Today
              </span>
            </div>

            {/* Messages Stream */}
            {selectedChat.messages.map(msg => {
              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMe ? "flex-end" : "flex-start",
                    maxWidth: "82%",
                    alignSelf: isMe ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe ? "linear-gradient(135deg, #059669 0%, #047857 100%)" : "#ffffff",
                    color: isMe ? "#ffffff" : "#0f172a",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: isMe ? "none" : "1px solid #e2e8f0",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    wordBreak: "break-word"
                  }}>
                    {msg.text}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px", padding: "0 4px" }}>
                    <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "500" }}>
                      {msg.time}
                    </span>
                    {isMe && (
                      <CheckCheck size={12} color="#059669" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Halal Icebreaker Suggestions */}
          <div style={{
            padding: "8px 12px",
            background: "#ffffff",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollbarWidth: "none"
          }}>
            {[
              "Assalamu Alaikum! Mubarak on our match.",
              "May I know about your family background?",
              "What are your core religious priorities?",
              "Would your family be open to speaking soon?"
            ].map((txt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendIcebreaker(txt)}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "5px 12px",
                  borderRadius: "14px",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#334155",
                  cursor: "pointer",
                  flexShrink: 0
                }}
                className="hover-lift"
              >
                💬 {txt}
              </button>
            ))}
          </div>

          {/* Sticky Bottom Input Bar */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: "10px 14px 14px 14px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "#ffffff",
              flexShrink: 0
            }}
          >
            <input 
              type="text"
              placeholder="Type a respectful message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: "11px 16px",
                borderRadius: "20px",
                border: "1.5px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: "13px",
                color: "#0f172a",
                outline: "none"
              }}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="btn-primary-action"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                padding: 0,
                opacity: inputMessage.trim() ? 1 : 0.4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Wali / Phone Check Modal */}
      {showCallModal && (
        <div className="modal-backdrop" onClick={() => setShowCallModal(false)} style={{ zIndex: 1400 }}>
          <div
            className="modal-content-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "380px", padding: "26px 22px", textAlign: "center" }}
          >
            <div style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Phone size={28} />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Family & Wali Voice Call
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, marginBottom: "20px" }}>
              In adherence with Islamic matrimonial values, direct calls are enabled after mutual family / Wali consent is acknowledged.
            </p>

            <button
              onClick={() => {
                setShowCallModal(false);
                sendIcebreaker("Assalamu Alaikum. Would your parents/Wali be available for an introductory family phone call?");
              }}
              className="btn-primary-action"
              style={{ width: "100%", padding: "12px", borderRadius: "14px", fontSize: "13px", marginBottom: "8px" }}
            >
              Request Wali Call Intro
            </button>

            <button
              onClick={() => setShowCallModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "14px",
                background: "transparent",
                border: "none",
                fontSize: "12px",
                color: "#64748b",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </>
  );
}
