"use client";

import React, { useState } from "react";
import { 
  Heart, 
  ShieldCheck, 
  Phone, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { signInWithGoogle } from "@/lib/supabase/auth";

export default function LoginScreen({ onLoginSuccess, onStartOnboarding }) {
  const [phoneNumber, setPhoneNumber] = useState("9876543210");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: phoneNumber })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to send OTP.");
      } else {
        setOtpSent(true);
        setOtp("7860"); // Pre-fill demo OTP for convenience
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone: phoneNumber, otp })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid OTP.");
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setGoogleLoading(true);
    const { error } = await signInWithGoogle({ next: "/", intent: "login" });
    if (error) {
      setErrorMessage(error.message || "Failed to initiate Google Sign-In.");
      setGoogleLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess({
      id: "user-default",
      name: "Ahmed Raza",
      age: 28,
      profession: "Principal Architect",
      city: "Hyderabad",
      state: "Telangana",
      verified: true,
      avatar: "/images/ahmed.jpg"
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px 16px",
      background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f8fafc 100%)"
    }}>
      {/* Mobile-centric card container */}
      <div style={{
        maxWidth: "420px",
        width: "100%",
        background: "#ffffff",
        borderRadius: "28px",
        padding: "36px 24px",
        boxShadow: "0 20px 45px -10px rgba(5, 150, 105, 0.12), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid #e2e8f0",
        textAlign: "center"
      }}>
        {/* Official App Logo */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img 
            src="/images/logo.png" 
            alt="Risthay Muslim Matrimony" 
            style={{
              width: "110px",
              height: "auto",
              margin: "0 auto",
              display: "block",
              filter: "drop-shadow(0 6px 16px rgba(5, 150, 105, 0.12))"
            }} 
          />
        </div>

        {/* Bismillah Header */}
        <span style={{
          fontFamily: "var(--font-arabic)",
          fontSize: "20px",
          color: "#059669",
          letterSpacing: "1px",
          display: "block",
          marginBottom: "4px"
        }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>

        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
          Risthay
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
          India&apos;s Dedicated Halal Muslim Matrimony
        </p>

        {/* Legal Age & Halal Trust Notice */}
        <div style={{
          background: "#ecfdf5",
          borderRadius: "14px",
          padding: "10px 14px",
          border: "1px solid #a7f3d0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "22px",
          textAlign: "left"
        }}>
          <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#065f46", fontWeight: "600", lineHeight: 1.4 }}>
            Only for Indian residents. Minimum legal age: <strong>21 years or older</strong>. Aadhaar KYC verified.
          </span>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "10px 12px",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textAlign: "left"
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mobile Number & OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                Mobile Number (India)
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid #cbd5e1",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#f8fafc"
              }}>
                <span style={{
                  padding: "12px 14px",
                  background: "#f1f5f9",
                  borderRight: "1px solid #cbd5e1",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#334155"
                }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    border: "none",
                    background: "transparent",
                    fontSize: "14px",
                    color: "#0f172a"
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "700"
              }}
            >
              {loading ? "Sending OTP..." : "Get OTP to Login"} <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                  Enter 4-Digit OTP
                </label>
                <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }} onClick={() => setOtpSent(false)}>
                  Change Number
                </span>
              </div>
              <input
                type="text"
                maxLength={4}
                placeholder="7860"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "14px",
                  fontSize: "18px",
                  textAlign: "center",
                  fontWeight: "800",
                  letterSpacing: "6px",
                  color: "#0f172a",
                  background: "#f8fafc"
                }}
                required
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                Demo OTP: <strong>7860</strong> is pre-filled for you
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-action"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "700"
              }}
            >
              {loading ? "Verifying..." : "Verify & Enter Risthay"} <CheckCircle2 size={16} />
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "var(--text-muted)",
          fontSize: "12px",
          marginBottom: "16px"
        }}>
          <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          <span>OR</span>
          <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
        </div>

        {/* Google OAuth Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="hover-lift"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "14px",
            border: "1.5px solid #cbd5e1",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            cursor: googleLoading ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "13px",
            color: "#1e293b"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? "Connecting to Google..." : "Sign In with Google"}</span>
        </button>

        {/* New Member Registration CTA (Starts Onboarding!) */}
        <button
          onClick={onStartOnboarding}
          className="btn-outline-action"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "14px",
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "12px",
            color: "#059669",
            borderColor: "#a7f3d0",
            background: "#ecfdf5"
          }}
        >
          <Sparkles size={16} color="#059669" />
          <span>New to Risthay? Create Halal Profile</span>
        </button>

        {/* Fast 1-Tap Demo Access */}
        <button
          onClick={handleQuickDemoLogin}
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "12px",
            fontWeight: "600",
            padding: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <UserCheck size={14} />
          <span>Quick 1-Tap Demo Login (Ahmed Raza)</span>
        </button>
      </div>

      <p style={{ marginTop: "24px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
        Protected by Aadhaar KYC • Zero Dowry Pledge • Pure Sunnah Matrimony
      </p>
    </div>
  );
}
