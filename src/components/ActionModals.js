"use client";

import React, { useState } from "react";
import { 
  X, 
  Check, 
  Heart, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  AlertTriangle, 
  Lock, 
  BookOpen, 
  CheckCircle2,
  ThumbsUp,
  UserX
} from "lucide-react";
import { HALAL_GUIDES } from "@/data/mockData";

export default function ActionModals({
  activeModal, // null | 'sendInterest' | 'acceptInterest' | 'declineInterest' | 'matchConfirmed' | 'reportUser' | 'guide'
  modalData,
  onClose,
  onConfirmSendInterest,
  onConfirmAcceptInterest,
  onConfirmDeclineInterest,
  onConfirmReport,
  onStartChatFromMatch,
  isPremium = false,
  onUpgradeToPremium
}) {
  const [introMessage, setIntroMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("Compatibility");
  const [blockUserCheck, setBlockUserCheck] = useState(false);
  const [reportReason, setReportReason] = useState("Fake Profile");
  const [reportDetails, setReportDetails] = useState("");

  if (!activeModal) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "28px 24px",
          maxWidth: "460px",
          borderRadius: "26px"
        }}
      >
        {/* MODAL 1: Send Interest (Matches 3_screen.png) */}
        {activeModal === "sendInterest" && modalData && (
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 16px" }}>
              <img 
                src={modalData.avatar || "/images/ayesha.jpg"} 
                alt={modalData.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                background: "#059669",
                borderRadius: "50%",
                padding: "3px",
                border: "2px solid #ffffff",
                display: "flex",
                color: "#ffffff"
              }}>
                <CheckCircle2 size={13} />
              </span>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
              Send Interest to {modalData.name}?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600", marginBottom: "14px" }}>
              {modalData.profession} • {modalData.age} yrs • {modalData.city}
            </p>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "18px" }}>
              Bismillah. Are you sure you want to proceed? This is the first step towards a sincere and halal connection.
            </p>

            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                Introductory Message (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add a respectful greeting to introduce yourself and family background..."
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "14px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  background: "#f8fafc",
                  resize: "none"
                }}
              />
            </div>

            <div style={{
              background: "#ecfdf5",
              borderRadius: "14px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "22px",
              textAlign: "left"
            }}>
              <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#065f46", lineHeight: 1.4 }}>
                Risthay encourages respectful interactions. Please ensure your message is polite and sincere.
              </span>
            </div>

            <button
              onClick={() => onConfirmSendInterest(modalData, introMessage)}
              className="btn-primary-action"
              style={{ width: "100%", padding: "12px", fontSize: "14px", marginBottom: "10px" }}
            >
              <Send size={16} /> Confirm & Send
            </button>

            <button
              onClick={onClose}
              style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", padding: "6px" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* MODAL 2: Accept Interest (Matches 0_screen.png) */}
        {activeModal === "acceptInterest" && modalData && (
          <div style={{ textAlign: "center" }}>
            <span style={{
              fontSize: "11px",
              letterSpacing: "1px",
              color: "#059669",
              fontWeight: "700",
              textTransform: "uppercase",
              display: "block",
              marginBottom: "14px",
              fontFamily: "var(--font-arabic)"
            }}>
              BISMILLAH HIR RAHMAN NIR RAHIM
            </span>

            {/* Linked avatars with heart */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "-12px", marginBottom: "18px" }}>
              <img 
                src="/images/ahmed.jpg" 
                alt="Ahmed"
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #ffffff", boxShadow: "var(--shadow-sm)" }}
              />
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 2,
                margin: "0 -8px"
              }}>
                <Heart size={14} fill="#059669" color="#059669" />
              </div>
              <img 
                src={modalData.avatar || "/images/ayesha.jpg"} 
                alt={modalData.name}
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #ffffff", boxShadow: "var(--shadow-sm)" }}
              />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
              Accept Interest from {modalData.name}?
            </h2>

            <span className="badge-pill badge-green" style={{ marginBottom: "16px" }}>
              <ShieldCheck size={13} /> Verified Profile & Halal Interaction
            </span>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
              This will create a match and open a private chat room. By confirming, you agree to interact with sincerity, dignity, and mutual respect.
            </p>

            <button
              onClick={() => onConfirmAcceptInterest(modalData)}
              className="btn-primary-action"
              style={{ width: "100%", padding: "13px", fontSize: "14px", marginBottom: "10px" }}
            >
              <CheckCircle2 size={16} /> Confirm Acceptance
            </button>

            <button
              onClick={onClose}
              style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: "600", padding: "6px" }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* MODAL 3: Match Confirmed Celebration (Matches 4_screen.png) */}
        {activeModal === "matchConfirmed" && modalData && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#059669"
            }}>
              <Sparkles size={36} />
            </div>

            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
              Interest Accepted, <span style={{ color: "var(--primary)" }}>Mubarak!</span>
            </h2>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "22px" }}>
              Alhamdulillah! You and {modalData.name} are now connected. May Allah bless this communication and make it the start of a righteous union.
            </p>

            <button
              onClick={() => (isPremium ? onStartChatFromMatch(modalData) : onUpgradeToPremium?.())}
              className="btn-primary-action"
              style={{
                width: "100%", padding: "13px", fontSize: "14px", marginBottom: "10px",
                background: isPremium ? undefined : "linear-gradient(135deg, #1e1b4b, #312e81)"
              }}
            >
              {isPremium ? <MessageSquare size={16} /> : <Lock size={16} />}
              {isPremium ? "Start Halal Chat" : "Unlock Halal Chat"}
            </button>

            <button
              onClick={onClose}
              className="btn-outline-action"
              style={{ width: "100%", padding: "12px", fontSize: "13px", marginBottom: "20px" }}
            >
              Keep Browsing
            </button>

            {/* Halal Tip Box (Matches 4_screen.png) */}
            <div style={{
              background: "#f0fdf4",
              borderRadius: "16px",
              padding: "14px 16px",
              border: "1px solid #bbf7d0",
              textAlign: "left",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start"
            }}>
              <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#065f46" }}>Halal Tip</span>
                <p style={{ fontSize: "12px", color: "#166534", marginTop: "2px", lineHeight: 1.4 }}>
                  We recommend involving families early for a blessed and transparent union. Keep all conversations respectful.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: Decline Interest (Matches 2_screen.png) */}
        {activeModal === "declineInterest" && modalData && (
          <div style={{ textAlign: "center" }}>
            <img 
              src={modalData.avatar || "/images/ayesha.jpg"} 
              alt={modalData.name}
              style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 14px" }}
            />

            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Decline interest from {modalData.name}?
            </h2>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "18px" }}>
              Are you sure? This action cannot be undone and you will no longer appear in their matches.
            </p>

            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                REASON (OPTIONAL)
              </span>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {["Compatibility", "Distance", "Other"].map(r => (
                  <button
                    key={r}
                    onClick={() => setDeclineReason(r)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: declineReason === r ? "#ecfdf5" : "#f1f5f9",
                      color: declineReason === r ? "#065f46" : "#475569",
                      border: `1px solid ${declineReason === r ? "#a7f3d0" : "#e2e8f0"}`
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: "#f8fafc",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <input 
                type="checkbox"
                checked={blockUserCheck}
                onChange={(e) => setBlockUserCheck(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#ef4444" }}
              />
              <span style={{ fontSize: "12px", color: "#334155", fontWeight: "500" }}>
                Block and report this profile
              </span>
            </div>

            <button
              onClick={onClose}
              className="btn-primary-action"
              style={{ width: "100%", padding: "12px", fontSize: "14px", marginBottom: "10px" }}
            >
              No, Keep Interest
            </button>

            <button
              onClick={() => onConfirmDeclineInterest(modalData, declineReason, blockUserCheck)}
              style={{ color: "#ef4444", fontSize: "13px", fontWeight: "700", padding: "6px" }}
            >
              Yes, Decline
            </button>
          </div>
        )}

        {/* MODAL 5: Halal Guides (Taaruf / Istikhara) */}
        {activeModal === "guide" && (
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className="badge-pill badge-green">HALAL KNOWLEDGE</span>
              <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>

            {modalData === "istikhara-guide" ? (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                  Istikhara Prayer & Dua Guide
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  How to seek Allah&apos;s counsel with conviction when considering marriage.
                </p>

                <div style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  padding: "16px",
                  borderRadius: "16px",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  <p style={{ fontFamily: "var(--font-arabic)", fontSize: "18px", color: "#92400e", lineHeight: 1.8 }}>
                    اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ
                  </p>
                  <p style={{ fontSize: "12px", color: "#78350f", marginTop: "8px", fontStyle: "italic" }}>
                    &ldquo;O Allah, I seek Your guidance through Your knowledge, and I seek ability through Your power...&rdquo;
                  </p>
                </div>

                <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                  <p style={{ fontWeight: "700", marginBottom: "6px" }}>Core Steps:</p>
                  <ol style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <li>Pray two Rak&apos;ahs of Nafl prayer with focused khushu.</li>
                    <li>Recite the Istikhara Dua with presence of heart, naming the person.</li>
                    <li>Istikhara is about Allah facilitating what is blessed, not needing a miraculous dream.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                  15 Halal Questions in Taaruf
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Essential topics to discuss with respect and your guardian&apos;s knowledge.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto" }}>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>1. Daily Deen & Salah</h4>
                    <p style={{ fontSize: "12px", color: "#475569" }}>How do you manage your five daily prayers? What are your spiritual aspirations?</p>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>2. Living in India & Family</h4>
                    <p style={{ fontSize: "12px", color: "#475569" }}>What are your expectations regarding joint family vs nuclear home? How are family ties valued?</p>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>3. Financials & Dowry-Free Nikah</h4>
                    <p style={{ fontSize: "12px", color: "#475569" }}>Are you committed to a simple Sunnah wedding free of dowry demands? How do you view halal earnings?</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-primary-action"
              style={{ width: "100%", padding: "11px", marginTop: "20px", fontSize: "13px" }}
            >
              JazakAllah Khair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
