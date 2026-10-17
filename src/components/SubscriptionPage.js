"use client";

import React, { useState } from "react";
import {
  Crown,
  Check,
  X,
  ShieldCheck,
  MessageSquare,
  Eye,
  Star,
  Zap,
  Heart,
  BadgeCheck,
  Gift,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

const PLANS = [
  {
    id: "plan_3m",
    duration: "3 Months",
    price: 499,
    perMonth: 166,
    badge: null,
    gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
  },
  {
    id: "plan_6m",
    duration: "6 Months",
    price: 899,
    perMonth: 150,
    badge: "Most Popular",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  },
  {
    id: "plan_12m",
    duration: "12 Months",
    price: 1199,
    perMonth: 100,
    badge: "Best Value",
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
  },
];

const PREMIUM_FEATURES = [
  { icon: Eye, label: "View Full Profile Photos", free: false, premium: true },
  { icon: MessageSquare, label: "Halal Chat with Matches", free: false, premium: true },
  { icon: Heart, label: "Send & Receive Interests", free: true, premium: true },
  { icon: ShieldCheck, label: "View Aadhaar Verified Profiles", free: true, premium: true },
  { icon: Star, label: "Profile Featured in Search", free: false, premium: true },
  { icon: Zap, label: "Instant Match Notifications", free: false, premium: true },
  { icon: BadgeCheck, label: "Premium Member Badge", free: false, premium: true },
  { icon: Gift, label: "Priority Customer Support", free: false, premium: true },
];

export default function SubscriptionPage({ onClose, onSubscribe, isPremium = false }) {
  const [selectedPlan, setSelectedPlan] = useState("plan_6m");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (isPremium || isProcessing) return;
    const plan = PLANS.find(p => p.id === selectedPlan);
    setIsProcessing(true);
    try {
      await new Promise(res => setTimeout(res, 2200));
      setPaymentSuccess(true);
      await new Promise(res => setTimeout(res, 1800));
      if (onSubscribe) onSubscribe(plan);
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------- SUCCESS STATE (light theme) ---------- */
  if (paymentSuccess) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px"
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "28px",
          padding: "40px 28px",
          textAlign: "center",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.15), 0 10px 20px -5px rgba(15, 23, 42, 0.08)",
          maxWidth: "360px",
          width: "100%"
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 30px rgba(251, 191, 36, 0.4)"
          }}>
            <Crown size={40} color="#ffffff" />
          </div>
          <h2 style={{ color: "#0f172a", fontSize: "23px", fontWeight: "800", marginBottom: "8px" }}>
            Welcome to Premium! 🎉
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
            Mabrook! You now have full access to view profile photos and start halal conversations.
          </p>
          <div style={{
            marginTop: "20px",
            padding: "12px 16px",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "14px",
            color: "#047857",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            ✨ بِسْمِ اللَّهِ — May Allah bless your journey
          </div>
        </div>
      </div>
    );
  }

  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#f1f5f9",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      overflowY: "auto"
    }}>
      {/* Mobile Screen Container (matches app shell width) */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)"
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0,
          padding: "14px 16px",
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 5
        }}>
          <button
            onClick={onClose}
            aria-label="Close premium page"
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#475569", cursor: "pointer", flexShrink: 0
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "#0f172a", fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
              Risthay Premium
              <span style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#ffffff", fontSize: "9px", fontWeight: "800",
                padding: "2px 7px", borderRadius: "6px", letterSpacing: "0.4px"
              }}>
                GOLD
              </span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "12px" }}>
              Unlock full access to find your perfect match
            </p>
          </div>
        </div>

        <div style={{ padding: "20px 16px 130px", position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 10px 30px rgba(251,191,36,0.35)"
            }}>
              <Crown size={34} color="#ffffff" />
            </div>
            <h2 style={{ color: "#0f172a", fontSize: "22px", fontWeight: "800", marginBottom: "8px", lineHeight: 1.3 }}>
              {isPremium ? "Your Premium Membership" : "Upgrade to Premium"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, maxWidth: "360px", margin: "0 auto" }}>
              {isPremium
                ? "You have full access to view profile photos, start halal chats and enjoy priority visibility."
                : "View profile photos, start halal chats & get noticed faster with a verified premium badge."}
            </p>
          </div>

          {/* Active membership banner */}
          {isPremium && (
            <div style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              borderRadius: "18px",
              padding: "16px",
              display: "flex", alignItems: "center", gap: "12px",
              marginBottom: "24px",
              boxShadow: "0 6px 18px rgba(5, 150, 105, 0.22)"
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <CheckCircle2 size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ color: "#ffffff", fontSize: "14px", fontWeight: "800" }}>
                  Premium Active
                </div>
                <div style={{ color: "#d1fae5", fontSize: "12px" }}>
                  All features below are unlocked on your account.
                </div>
              </div>
            </div>
          )}

          {/* Plans */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {PLANS.map(p => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => !isPremium && setSelectedPlan(p.id)}
                  role="button"
                  tabIndex={isPremium ? -1 : 0}
                  onKeyDown={(e) => {
                    if (!isPremium && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      setSelectedPlan(p.id);
                    }
                  }}
                  style={{
                    background: isSelected ? "#ecfdf5" : "#ffffff",
                    border: `2px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                    borderRadius: "20px",
                    padding: "18px 20px",
                    cursor: isPremium ? "default" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    transform: isSelected && !isPremium ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected ? "0 8px 24px rgba(5, 150, 105, 0.16)" : "0 1px 3px rgba(0,0,0,0.03)",
                    opacity: isPremium && !isSelected ? 0.6 : 1
                  }}
                >
                  {p.badge && (
                    <div style={{
                      position: "absolute", top: "14px", right: "14px",
                      background: p.gradient,
                      color: "#ffffff",
                      fontSize: "10px", fontWeight: "700",
                      padding: "3px 8px", borderRadius: "20px",
                      letterSpacing: "0.5px"
                    }}>
                      {p.badge}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%",
                      border: `2px solid ${isSelected ? "#059669" : "#cbd5e1"}`,
                      background: isSelected ? "#059669" : "#ffffff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#0f172a", fontSize: "16px", fontWeight: "700", marginBottom: "3px" }}>
                        {p.duration}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "12px" }}>
                        ₹{p.perMonth}/month · Billed once
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#0f172a", fontSize: "22px", fontWeight: "800" }}>
                        ₹{p.price}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "11px" }}>total</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison */}
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
          }}>
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid #eef2f6",
              display: "grid", gridTemplateColumns: "1fr auto auto",
              gap: "8px", alignItems: "center"
            }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px" }}>Feature</span>
              <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", textAlign: "center", minWidth: "44px" }}>Free</span>
              <span style={{ color: "#d97706", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", textAlign: "center", minWidth: "56px" }}>Premium</span>
            </div>
            {PREMIUM_FEATURES.map((f, idx) => (
              <div
                key={idx}
                style={{
                  padding: "13px 20px",
                  borderBottom: idx < PREMIUM_FEATURES.length - 1 ? "1px solid #f1f5f9" : "none",
                  display: "grid", gridTemplateColumns: "1fr auto auto",
                  gap: "8px", alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <f.icon size={15} color="#64748b" />
                  <span style={{ color: "#334155", fontSize: "13px" }}>{f.label}</span>
                </div>
                <div style={{ textAlign: "center", minWidth: "44px" }}>
                  {f.free
                    ? <Check size={16} color="#059669" />
                    : <X size={16} color="#cbd5e1" />
                  }
                </div>
                <div style={{ textAlign: "center", minWidth: "56px" }}>
                  <Check size={16} color="#d97706" />
                </div>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            {[
              { icon: "🔒", label: "Secure\nPayment" },
              { icon: "↩️", label: "Easy\nCancel" },
              { icon: "🛡️", label: "100%\nHalal" },
            ].map((t, i) => (
              <div key={i} style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "12px 8px",
                textAlign: "center",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ fontSize: "22px", marginBottom: "4px" }}>{t.icon}</div>
                <div style={{ color: "#64748b", fontSize: "10px", fontWeight: "600", whiteSpace: "pre-line", lineHeight: 1.3 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Bottom CTA */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: "480px",
          padding: "16px 16px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid #e2e8f0",
          zIndex: 6
        }}>
          <button
            onClick={handleSubscribe}
            disabled={isProcessing || isPremium}
            style={{
              width: "100%",
              padding: "16px",
              background: (isProcessing || isPremium)
                ? "#e2e8f0"
                : "linear-gradient(135deg, #fbbf24, #f59e0b)",
              color: (isProcessing || isPremium) ? "#94a3b8" : "#0f172a",
              fontWeight: "800",
              fontSize: "16px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              boxShadow: (isProcessing || isPremium) ? "none" : "0 8px 24px rgba(251,191,36,0.4)",
              border: "none",
              cursor: (isProcessing || isPremium) ? "not-allowed" : "pointer"
            }}
          >
            {isProcessing ? (
              <>
                <div style={{
                  width: "18px", height: "18px",
                  border: "2px solid rgba(15,23,42,0.2)",
                  borderTop: "2px solid #0f172a",
                  borderRadius: "50%",
                  animation: "sub-spin 0.8s linear infinite"
                }} />
                Processing Payment…
              </>
            ) : isPremium ? (
              <>
                <CheckCircle2 size={18} />
                You&apos;re Premium — Enjoy!
              </>
            ) : (
              <>
                <Crown size={18} />
                Get Premium — ₹{plan?.price}
              </>
            )}
          </button>
          <p style={{
            textAlign: "center", color: "#94a3b8",
            fontSize: "11px", marginTop: "8px"
          }}>
            UPI · Cards · Net Banking accepted · No auto-renewal
          </p>
        </div>
      </div>

      <style>{`
        @keyframes sub-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
