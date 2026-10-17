"use client";

import React, { useState } from "react";
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Camera, 
  UploadCloud, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  User, 
  Heart, 
  MapPin, 
  AlertCircle
} from "lucide-react";
import { INDIAN_STATES_CITIES, MOTHER_TONGUES } from "@/data/mockData";
import MobileSelect from "@/components/MobileSelect";
import { calculateAgeClient as calculateAge } from "@/lib/clientUtils";

export default function OnboardingWizard({ onClose, onProfileCreated }) {
  const [step, setStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Syed Rehan Ali",
    hideNameUntilMatch: false,
    gender: "Male",
    dob: "1999-04-12", // Default ~27 yrs (>=21)
    height: "5' 10\"",
    motherTongue: "Urdu",

    familyName: "Syed / Quadri",
    fatherOccupation: "Executive Engineer (Retd)",
    motherOccupation: "Homemaker",
    siblingsCount: 2,

    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400050",
    willingToRelocate: "Yes",

    maritalStatus: "Never Married",
    hasChildren: "No",

    religiousPractice: "Very Practicing",
    highestQualification: "Bachelor's Degree",
    jobTitle: "Software Engineer",
    incomeRange: "₹18 - ₹24 Lakhs p.a.",

    timeline: "3-6 Months",
    bio: "Assalamu Alaikum. Sincere and family-oriented Muslim brother seeking a pious life partner in the light of Sunnah.",

    docType: "Aadhaar Card",
    docUploaded: true,
    selfieVerified: true
  });

  // Calculate age dynamically from Date of Birth
  const currentAge = calculateAge(formData.dob);
  const isUnderage = currentAge < 21;

  const handleNext = () => {
    setApiError("");

    // Age validation on Step 1
    if (step === 1) {
      if (!formData.fullName || formData.fullName.trim().length < 3) {
        setApiError("Please enter your full name (minimum 3 characters).");
        return;
      }
      if (isUnderage) {
        setApiError(`Legal requirement: You must be at least 21 years old to register. Your current calculated age is ${currentAge} years.`);
        return;
      }
    }

    if (step < 7) {
      setStep(step + 1);
    } else {
      submitToBackend();
    }
  };

  const submitToBackend = async () => {
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiError(data.error || "Failed to submit profile.");
        setLoading(false);
      } else {
        setIsCompleted(true);
      }
    } catch (err) {
      setApiError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setApiError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const progressPercentage = Math.round((step / 7) * 100);

  // If Completed, show Mabrook Screen (Matches 17_screen.png)
  if (isCompleted) {
    return (
      <div className="modal-backdrop">
        <div 
          className="modal-content-card animate-slide-up"
          style={{ padding: "36px 24px", textAlign: "center", maxWidth: "420px" }}
        >
          {/* Green Star Shield (Matches 17_screen.png) */}
          <div style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            background: "#ecfdf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            position: "relative"
          }}>
            <ShieldCheck size={48} color="#059669" />
            <span style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "#f59e0b",
              borderRadius: "50%",
              padding: "4px",
              color: "#ffffff"
            }}>
              <Sparkles size={14} />
            </span>
          </div>

          <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
            Mabrook! You are Approved
          </h2>

          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "22px" }}>
            Alhamdulillah! Your profile meets the age requirement (21+) and your Indian Aadhaar document is verified.
          </p>

          <div style={{
            background: "#f8fafc",
            borderRadius: "16px",
            padding: "14px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                <CheckCircle2 size={18} />
              </div>
              <div style={{ textAlign: "left" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700" }}>100% Verified Member</h4>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Safe & Halal Matchmaking</p>
              </div>
            </div>
            <CheckCircle2 size={20} color="#059669" />
          </div>

          <button
            onClick={() => {
              onProfileCreated(formData);
              onClose();
            }}
            className="btn-primary-action"
            style={{ width: "100%", padding: "13px", fontSize: "14px" }}
          >
            <Heart size={16} fill="#ffffff" /> View My Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content-card animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          padding: "20px 22px",
          maxHeight: "92vh"
        }}
      >
        {/* Top Progress & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <button
            onClick={step === 1 ? onClose : prevStep}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            <ArrowLeft size={16} /> {step === 1 ? "Cancel" : "Back"}
          </button>

          <span className="badge-pill badge-green" style={{ fontSize: "11px" }}>
            STEP {step} OF 7 • {progressPercentage}%
          </span>

          <button onClick={onClose} style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar Line */}
        <div style={{ height: "4px", background: "#f1f5f9", borderRadius: "10px", marginBottom: "16px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progressPercentage}%`,
            background: "linear-gradient(90deg, #059669 0%, #10b981 100%)",
            borderRadius: "10px",
            transition: "width 0.3s ease"
          }} />
        </div>

        {/* Error notification banner */}
        {apiError && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "10px 12px",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textAlign: "left"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* STEP 1: Basic Identity (Matches 18_screen.png) */}
        {step === 1 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Basic Identity
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Handled with dignity. Minimum legal age in India is 21.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "13px" }} />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{ width: "100%", padding: "11px 12px 11px 36px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Gender</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {["Male", "Female"].map(g => (
                    <div
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g })}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        border: `2px solid ${formData.gender === g ? "#059669" : "#e2e8f0"}`,
                        background: formData.gender === g ? "#ecfdf5" : "#ffffff",
                        textAlign: "center",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "13px",
                        color: formData.gender === g ? "#065f46" : "#475569"
                      }}
                    >
                      {g === "Male" ? "♂ Male" : "♀ Female"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date of Birth with Real-time Backend Age Rule (>=21) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700" }}>Date of Birth</label>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: isUnderage ? "#dc2626" : "#059669"
                  }}>
                    Age: {currentAge} years {isUnderage ? "(Must be 21+)" : "✓ Eligible"}
                  </span>
                </div>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    border: `1.5px solid ${isUnderage ? "#ef4444" : "#cbd5e1"}`,
                    background: isUnderage ? "#fef2f2" : "#ffffff"
                  }}
                />

                {isUnderage && (
                  <p style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600", marginTop: "4px" }}>
                    ⚠️ Legal requirement in India: Age must be 21 or older to register for matrimony.
                  </p>
                )}
              </div>

              {/* Height & Language */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Height</label>
                  <MobileSelect
                    value={formData.height}
                    onChange={(v) => setFormData({ ...formData, height: v })}
                    options={["4' 10\"", "5' 0\"", "5' 2\"", "5' 4\"", "5' 6\"", "5' 8\"", "5' 10\"", "6' 0\""]}
                    placeholder="Select Height"
                    label="Select Height"
                    searchable={false}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Mother Tongue</label>
                  <MobileSelect
                    value={formData.motherTongue}
                    onChange={(v) => setFormData({ ...formData, motherTongue: v })}
                    options={MOTHER_TONGUES}
                    placeholder="Mother Tongue"
                    label="Select Mother Tongue"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Family Background */}
        {step === 2 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Family Background
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Help other Indian families learn about your lineage.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Family Surname / Clan</label>
                <input
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Syed, Khan, Shaikh, Siddiqui"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Father&apos;s Occupation</label>
                <input
                  type="text"
                  value={formData.fatherOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Engineer, Business, Retired"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Mother&apos;s Occupation</label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Homemaker, Teacher, Doctor"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Siblings Count</label>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <button
                    onClick={() => setFormData({ ...formData, siblingsCount: Math.max(0, formData.siblingsCount - 1) })}
                    style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#f1f5f9", fontWeight: "700" }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: "16px", fontWeight: "800" }}>{formData.siblingsCount}</span>
                  <button
                    onClick={() => setFormData({ ...formData, siblingsCount: formData.siblingsCount + 1 })}
                    style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", fontWeight: "700" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location in India */}
        {step === 3 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Location in India
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Risthay exclusively serves Muslim families in India.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>State in India</label>
                <MobileSelect
                  value={formData.state}
                  onChange={(st) => {
                    const cities = INDIAN_STATES_CITIES[st] || ["Mumbai"];
                    setFormData({ ...formData, state: st, city: cities[0] });
                  }}
                  options={Object.keys(INDIAN_STATES_CITIES)}
                  placeholder="Select State"
                  label="State in India"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>City / Town</label>
                  <MobileSelect
                    value={formData.city}
                    onChange={(v) => setFormData({ ...formData, city: v })}
                    options={(INDIAN_STATES_CITIES[formData.state] || ["Mumbai"])}
                    placeholder="Select City"
                    label="City / Town"
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                    placeholder="e.g. 400050"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Marital History */}
        {step === 4 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Marital Status
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Please be honest in the light of Islamic principles.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Never Married", "Divorced", "Widowed", "Khula"].map(status => (
                <div
                  key={status}
                  onClick={() => setFormData({ ...formData, maritalStatus: status })}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: `2px solid ${formData.maritalStatus === status ? "#059669" : "#e2e8f0"}`,
                    background: formData.maritalStatus === status ? "#ecfdf5" : "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "13px"
                  }}
                >
                  <span>{status}</span>
                  {formData.maritalStatus === status && <CheckCircle2 size={16} color="#059669" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Deen & Career */}
        {step === 5 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Deen & Career
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Professional and religious balance.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Religious Practice</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["Very Practicing", "Practicing", "Moderate"].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setFormData({ ...formData, religiousPractice: lvl })}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: formData.religiousPractice === lvl ? "#059669" : "#f1f5f9",
                        color: formData.religiousPractice === lvl ? "#ffffff" : "#475569"
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Job Title / Profession</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  placeholder="e.g. Software Engineer, Doctor, CA"
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Income Bracket (INR)</label>
                <MobileSelect
                  value={formData.incomeRange}
                  onChange={(v) => setFormData({ ...formData, incomeRange: v })}
                  options={["₹6 - ₹10 Lakhs p.a.", "₹10 - ₹18 Lakhs p.a.", "₹18 - ₹24 Lakhs p.a.", "₹25+ Lakhs p.a."]}
                  placeholder="Select Income Bracket"
                  label="Income Bracket (INR)"
                  searchable={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Nikah Intentions */}
        {step === 6 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Nikah Intentions
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Share your timeline and personal bio.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Preferred Timeline</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {["ASAP", "3-6 Months", "6-12 Months", "Flexible"].map(t => (
                    <button
                      key={t}
                      onClick={() => setFormData({ ...formData, timeline: t })}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background: formData.timeline === t ? "#ecfdf5" : "#ffffff",
                        color: formData.timeline === t ? "#065f46" : "#475569",
                        border: `1.5px solid ${formData.timeline === t ? "#059669" : "#e2e8f0"}`
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Brief Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", resize: "none" }}
                  placeholder="Introduce yourself and your expectations..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Aadhaar Verification */}
        {step === 7 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>
              Aadhaar & Verification
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Government ID check for zero-fake community.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <CheckCircle2 size={24} color="#059669" style={{ margin: "0 auto 4px" }} />
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#065f46" }}>UIDAI Aadhaar Verified</h4>
                <p style={{ fontSize: "11px", color: "#047857" }}>Document encrypted & validated</p>
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                <Camera size={24} color="#059669" style={{ margin: "0 auto 4px" }} />
                <h4 style={{ fontSize: "13px", fontWeight: "700" }}>Live Selfie Verified</h4>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Matches document photo</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Button */}
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          {step > 1 && (
            <button
              onClick={prevStep}
              disabled={loading}
              className="btn-outline-action"
              style={{ flex: 1, padding: "11px", fontSize: "13px" }}
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={loading || (step === 1 && isUnderage)}
            className="btn-primary-action"
            style={{
              flex: step > 1 ? 1.5 : 1,
              width: "100%",
              padding: "11px",
              fontSize: "13px",
              opacity: (step === 1 && isUnderage) ? 0.6 : 1
            }}
          >
            {loading ? (
              "Verifying Backend..."
            ) : step === 7 ? (
              <>
                <Check size={16} /> Complete & Verify
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
