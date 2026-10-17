"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  UserCheck
} from "lucide-react";

const DEMO_ADMINS = [
  {
    role: "Super Admin",
    name: "Director Syed Irfan",
    email: "admin@risthay.com",
    badge: "Full Access",
    desc: "Complete operational, review, financial, and settings privileges"
  },
  {
    role: "Profile Reviewer",
    name: "Farhana Begum",
    email: "reviewer@risthay.com",
    badge: "Reviewer",
    desc: "Review, approve, reject, and request profile corrections"
  },
  {
    role: "Membership Manager",
    name: "Tariq Mansoor",
    email: "manager@risthay.com",
    badge: "Finance & Plans",
    desc: "Grant, extend, renew, and revoke premium subscriptions"
  },
  {
    role: "Read-Only Admin",
    name: "Zubair Hashmi",
    email: "readonly@risthay.com",
    badge: "Auditor",
    desc: "Inspect records and analytics without mutation authority"
  }
];

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@risthay.com");
  const [password, setPassword] = useState("admin123");
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
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Authentication failed.");
      } else {
        router.push("/admin");
      }
    } catch {
      setErrorMessage("Network error connecting to administrative service.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoAdmin = (admin) => {
    setEmail(admin.email);
    setPassword("admin123");
    setErrorMessage("");
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
            src="/images/logo.png"
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
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
          Authorized Personnel • Profile Verification & Governance
        </p>

        {/* Security Warning */}
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "12px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          textAlign: "left"
        }}>
          <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#065f46", fontWeight: "600", lineHeight: 1.4 }}>
            Access restricted to verified administrators. All administrative activities are cryptographically audit-logged.
          </span>
        </div>

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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: "left" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
              Administrator Email
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
              <Mail size={16} color="#64748b" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@risthay.com"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  fontSize: "14px",
                  color: "#0f172a"
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
              <Lock size={16} color="#64748b" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
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
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Role Tester Presets */}
        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #e2e8f0", textAlign: "left" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "10px"
          }}>
            1-Click Demo Accounts (Select Role):
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {DEMO_ADMINS.map((adm) => {
              const isSelected = email === adm.email;
              return (
                <div
                  key={adm.email}
                  onClick={() => handleSelectDemoAdmin(adm)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: isSelected ? "1.5px solid #059669" : "1px solid #e2e8f0",
                    background: isSelected ? "#ecfdf5" : "#f8fafc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                      {adm.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      {adm.email} • {adm.desc}
                    </div>
                  </div>
                  <span style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: isSelected ? "#059669" : "#e2e8f0",
                    color: isSelected ? "#ffffff" : "#475569"
                  }}>
                    {adm.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
        Protected by Supabase Auth & AES-256 • India Halal Matrimonial Platform
      </p>
    </div>
  );
}
