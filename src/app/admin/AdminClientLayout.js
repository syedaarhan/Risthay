"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Bell,
  ShieldAlert,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Profile Applications", icon: Users, badgeKey: "pendingApprovals" },
  { href: "/admin/profiles", label: "Approved Profiles", icon: UserCheck },
  { href: "/admin/rejected", label: "Rejected Profiles", icon: UserX },
  { href: "/admin/verification", label: "Verification Center", icon: ShieldCheck, badgeKey: "pendingIdentity" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, badgeKey: "expiringIn7Days" },
  { href: "/admin/payments", label: "Payments", icon: Receipt },
  { href: "/admin/google-sheets", label: "Google Sheets Sync", icon: FileSpreadsheet },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/users", label: "Admin Users & Permissions", icon: ShieldAlert },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminClientLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({
    pendingApprovals: 0,
    pendingIdentity: 0,
    expiringIn7Days: 0
  });

  // Verify admin session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      // Don't intercept the login page
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        if (!isMounted) return;

        if (data?.success && data.authenticated && data.admin) {
          setAdminUser(data.admin);
          // Load quick badge stats
          fetch("/api/admin/dashboard")
            .then(r => r.json())
            .then(d => {
              if (d?.success && d.stats) {
                setBadgeCounts({
                  pendingApprovals: d.stats.pendingApprovals || 0,
                  pendingIdentity: d.stats.pendingIdentity || 0,
                  expiringIn7Days: d.stats.expiringIn7Days || 0
                });
              }
            })
            .catch(() => {});
        } else {
          router.push("/admin/login");
        }
      } catch {
        if (isMounted) router.push("/admin/login");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();
    return () => { isMounted = false; };
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {}
    router.push("/admin/login");
  };

  // If on login page, render children without sidebar wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#064e3b",
        color: "#ffffff"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.2)",
          borderTopColor: "#10b981",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ marginTop: "16px", fontSize: "14px", fontWeight: "600", letterSpacing: "0.5px" }}>
          Authenticating Risthay Admin Console...
        </p>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const roleLabelMap = {
    super_admin: "Super Admin",
    profile_reviewer: "Profile Reviewer",
    membership_manager: "Membership Manager",
    read_only_admin: "Read-Only Admin"
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f8fafc", color: "#0f172a" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 90,
            backdropFilter: "blur(4px)"
          }}
        />
      )}

      {/* Main Sidebar */}
      <aside style={{
        width: "270px",
        background: "#064e3b",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        transform: sidebarOpen ? "translateX(0)" : "translateX(0)",
        transition: "transform 0.25s ease",
        boxShadow: "4px 0 24px rgba(0,0,0,0.12)"
      }}
      className={sidebarOpen ? "open" : "hidden-mobile"}
      >
        {/* Brand Header */}
        <div style={{
          padding: "20px 20px 16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img
              src="/images/logo.png"
              alt="Risthay Logo"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#ffffff",
                padding: "3px"
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.3px" }}>
                  Risthay
                </span>
                <span style={{
                  fontSize: "9px",
                  fontWeight: "800",
                  background: "#10b981",
                  color: "#064e3b",
                  padding: "1px 6px",
                  borderRadius: "6px",
                  textTransform: "uppercase"
                }}>
                  Admin
                </span>
              </div>
              <p style={{ fontSize: "10px", color: "#a7f3d0", margin: 0, opacity: 0.9 }}>
                Halal Matrimony Console
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="show-mobile-btn"
            style={{
              background: "transparent",
              color: "#ffffff",
              padding: "4px",
              border: "none",
              cursor: "pointer"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "3px"
        }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#ffffff" : "#d1fae5",
                  background: isActive ? "linear-gradient(90deg, #059669, #047857)" : "transparent",
                  boxShadow: isActive ? "0 4px 12px rgba(5,150,105,0.3)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={17} color={isActive ? "#34d399" : "#a7f3d0"} />
                  <span>{item.label}</span>
                </div>

                {badgeCount > 0 && (
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    background: item.badgeKey === "expiringIn7Days" ? "#f59e0b" : "#ef4444",
                    color: "#ffffff",
                    padding: "1px 7px",
                    borderRadius: "10px"
                  }}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Profile Footer */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "14px",
              color: "#ffffff",
              border: "1.5px solid #34d399"
            }}>
              {adminUser?.name ? adminUser.name.charAt(0) : "A"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {adminUser?.name || "Administrator"}
              </div>
              <div style={{
                fontSize: "10px",
                fontWeight: "600",
                color: "#34d399"
              }}>
                {roleLabelMap[adminUser?.role] || "Super Admin"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.1)",
                color: "#d1fae5",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                textDecoration: "none"
              }}
              title="Open public website in new tab"
            >
              <ExternalLink size={12} />
              <span>Live Site</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.2)",
                color: "#fca5a5",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                border: "none",
                cursor: "pointer"
              }}
              title="Sign Out from Admin Panel"
            >
              <LogOut size={12} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: "270px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
      className="main-viewport"
      >
        {/* Top Navbar */}
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="show-mobile-hamburger"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f172a",
                cursor: "pointer"
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontFamily: "var(--font-arabic)",
                fontSize: "16px",
                color: "#059669",
                letterSpacing: "0.5px"
              }}>
                بِسْمِ اللَّهِ
              </span>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                Risthay Admin Verification & Operations
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Quick Live Mode indicator */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "20px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              fontSize: "11px",
              fontWeight: "700",
              color: "#059669"
            }}>
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px #10b981"
              }} />
              <span>Production Console (INR ₹)</span>
            </div>

            {/* Admin identity badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px 4px 5px",
              borderRadius: "24px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0"
            }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "800"
              }}>
                {adminUser?.name ? adminUser.name.charAt(0) : "A"}
              </div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                {adminUser?.name?.split(" ")[0] || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 960px) {
          .hidden-mobile {
            transform: translateX(-100%) !important;
          }
          .open {
            transform: translateX(0) !important;
          }
          .main-viewport {
            margin-left: 0 !important;
          }
          .show-mobile-btn {
            display: block !important;
          }
          .show-mobile-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 961px) {
          .show-mobile-btn {
            display: none !important;
          }
          .show-mobile-hamburger {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
