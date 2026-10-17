"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Key
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("syed@risthay");
  const [password, setPassword] = useState("syed@risthay@2026");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed.");
      } else {
        router.push("/syedristhay");
      }
    } catch {
      setErrorMessage("Network error connecting to administrative service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #064e3b 0%, #065f46 40%, #047857 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px 16px"
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "36px 28px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
        textAlign: "center"
      }}>
        {/* Brand Logo & Bismillah */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <img
            src="/icon.svg"
            alt="Risthay Logo"
            style={{
              width: "72px",
              height: "72px",
              margin: "0 auto",
              display: "block",
              borderRadius: "18px",
              boxShadow: "0 8px 20px rgba(5, 150, 105, 0.2)"
            }}
          />
        </div>

        <span style={{
          fontFamily: "var(--font-arabic)",
          fontSize: "19px",
          color: "#059669",
          display: "block",
          marginBottom: "4px"
        }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>

        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
          Risthay Admin Console
        </h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0" }}>
          Private Management & Profile Verification Portal
        </p>

        {errorMessage && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "10px 14px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#991b1b",
            fontSize: "13px",
            textAlign: "left"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
              Admin ID
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 12px",
              background: "#f8fafc",
              gap: "8px"
            }}>
              <User size={16} color="#059669" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="syed@risthay"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none",
                  fontWeight: "600"
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 12px",
              background: "#f8fafc",
              gap: "8px"
            }}>
              <Lock size={16} color="#059669" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: "14px",
                  color: "#0f172a",
                  outline: "none"
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "8px",
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
              border: "none"
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Authorized Admin Card */}
        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #e2e8f0", textAlign: "left" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px"
          }}>
            Authorized Administrator Account:
          </div>

          <div
            onClick={() => {
              setEmail("syed@risthay");
              setPassword("syed@risthay@2026");
              setErrorMessage("");
            }}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1.5px solid #a7f3d0",
              background: "#ecfdf5",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#065f46", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={16} color="#059669" />
                Syed (Administrator)
              </div>
              <div style={{ fontSize: "11px", color: "#047857", marginTop: "2px" }}>
                ID: <strong>syed@risthay</strong>
              </div>
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: "800",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#059669",
              color: "#ffffff"
            }}>
              Super Admin
            </span>
          </div>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
        Protected by Supabase Auth & AES-256 • Risthay Matrimonial Platform
      </p>
    </div>
  );
}
