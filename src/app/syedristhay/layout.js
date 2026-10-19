import React, { Suspense } from "react";
import AdminClientLayout from "./AdminClientLayout";

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={
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
      </div>
    }>
      <AdminClientLayout>{children}</AdminClientLayout>
    </Suspense>
  );
}
