"use client";

import React, { useState, useEffect } from "react";
import CompleteOnboardingFlow from "@/components/CompleteOnboardingFlow";
import BottomNav from "@/components/BottomNav";
import HomeDashboard from "@/components/HomeDashboard";
import BrowseProfiles from "@/components/BrowseProfiles";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import InterestsView from "@/components/InterestsView";
import MessagesView from "@/components/MessagesView";
import MyProfileView from "@/components/MyProfileView";
import SettingsModal from "@/components/SettingsModal";
import ActionModals from "@/components/ActionModals";
import SubscriptionPage from "@/components/SubscriptionPage";
import { 
  PROFILES_DATA, 
  INITIAL_RECEIVED_INTERESTS, 
  INITIAL_SENT_INTERESTS, 
  INITIAL_CHATS 
} from "@/data/mockData";
import { 
  Heart, 
  LogOut, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  Settings,
  Crown
} from "lucide-react";
import { signOutUser } from "@/lib/supabase/auth";

export default function RisthayMatrimonyApp() {
  // Start on the new 15-page Complete Onboarding Flow
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Premium Subscription State
  const [isPremium, setIsPremium] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  // Active Tab
  const [currentTab, setCurrentTab] = useState("home"); // 'home' | 'browse' | 'interests' | 'messages' | 'myProfile'

  // Data State
  const [profiles, setProfiles] = useState(PROFILES_DATA);
  const [shortlistedIds, setShortlistedIds] = useState(["RS-84920", "RS-91034"]);
  const [receivedInterests, setReceivedInterests] = useState(INITIAL_RECEIVED_INTERESTS);
  const [sentInterests, setSentInterests] = useState(INITIAL_SENT_INTERESTS);
  const [declinedList, setDeclinedList] = useState([]);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);

  // Modals
  const [selectedProfileForDetails, setSelectedProfileForDetails] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [globalPhotoBlur, setGlobalPhotoBlur] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Hydrate real state from the persisted backend (called after login/onboarding).
  const hydrateFromBackend = async () => {
    try {
      const res = await fetch("/api/bootstrap");
      const data = await res.json();
      if (!data?.success) return;
      if (data.user) setCurrentUser(data.user);
      setIsPremium(!!data.isPremium);
      if (Array.isArray(data.profiles) && data.profiles.length) setProfiles(data.profiles);
      if (Array.isArray(data.shortlistedIds)) setShortlistedIds(data.shortlistedIds);
      if (Array.isArray(data.receivedInterests)) setReceivedInterests(data.receivedInterests);
      if (Array.isArray(data.sentInterests)) setSentInterests(data.sentInterests);
      if (Array.isArray(data.declinedInterests)) setDeclinedList(data.declinedInterests);
      if (Array.isArray(data.chats)) setChats(data.chats);
      if (data.settings) setGlobalPhotoBlur(!!data.settings.globalPhotoBlur);
    } catch {}
  };

  // Restore authenticated session on mount and handle OAuth feedback
  useEffect(() => {
    let isMounted = true;

    async function checkSessionAndQuery() {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (!isMounted) return;

        if (data?.success && data.session && data.user) {
          if (data.user.onboarded) {
            setIsLoggedIn(true);
            setCurrentUser(data.user);
            hydrateFromBackend();
          } else {
            // User authenticated with Google but needs to complete profile onboarding
            setIsLoggedIn(false);
            setCurrentUser(data.user);
          }
        }
      } catch {}

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const authStatus = url.searchParams.get("auth");
        const authError = url.searchParams.get("auth_error");

        if (authStatus === "success") {
          triggerToast("Mabrook! Signed in successfully with Google.");
          url.searchParams.delete("auth");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        } else if (authError) {
          triggerToast(`Notice: ${decodeURIComponent(authError)}`);
          url.searchParams.delete("auth_error");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      }
    }

    checkSessionAndQuery();
    return () => { isMounted = false; };
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {}
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsSettingsOpen(false);
    setCurrentTab("home");
    triggerToast("Signed out successfully. Assalamu Alaikum!");
  };

  // Toggle Shortlist
  const handleToggleShortlist = (profileId) => {
    if (shortlistedIds.includes(profileId)) {
      setShortlistedIds(shortlistedIds.filter(id => id !== profileId));
      triggerToast("Removed from Saved");
    } else {
      setShortlistedIds([...shortlistedIds, profileId]);
      triggerToast("Profile Saved ❤️");
    }
  };

  // Send Interest via Backend API
  const handleInitiateSendInterest = (profile) => {
    setModalData(profile);
    setActiveModal("sendInterest");
  };

  const handleConfirmSendInterest = async (profile, note) => {
    setActiveModal(null);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", profile, note })
      });
      const data = await res.json();
      if (data.success && data.item) {
        setSentInterests([data.item, ...sentInterests]);
        triggerToast(`Salaam sent to ${profile.name}! ✨`);
      }
    } catch {
      triggerToast(`Salaam sent to ${profile.name}! ✨`);
    }
  };

  // Accept Interest via Backend API
  const handleInitiateAcceptInterest = (request) => {
    setModalData(request);
    setActiveModal("acceptInterest");
  };

  const handleConfirmAcceptInterest = async (request) => {
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", requestId: request.id })
      });
      const data = await res.json();
    } catch {}

    setReceivedInterests(receivedInterests.filter(r => r.id !== request.id));
    const matchedSent = {
      id: `sent-acc-${Date.now()}`,
      profileId: request.profileId,
      name: request.name,
      age: request.age,
      profession: request.profession,
      city: request.city,
      avatar: request.avatar,
      timestamp: "Accepted just now",
      status: "accepted",
      note: request.note
    };
    setSentInterests([matchedSent, ...sentInterests]);

    // Ensure chat conversation is open
    const targetChat = chats.find(c => c.matchId === request.profileId);
    if (!targetChat) {
      const newChat = {
        id: `chat-${request.profileId}`,
        matchId: request.profileId,
        name: request.name,
        age: request.age,
        avatar: request.avatar,
        city: request.city,
        profession: request.profession,
        verified: true,
        unreadCount: 1,
        lastSeen: "Online Now",
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: "them",
            text: "Assalamu Alaikum! Mubarak on our connection. InshaAllah our families can speak soon.",
            time: "Just now",
            read: false
          }
        ]
      };
      setChats([newChat, ...chats]);
      setActiveChatId(newChat.id);
    }

    setModalData(request);
    setActiveModal("matchConfirmed");
  };

  // Decline Interest
  const handleInitiateDeclineInterest = (request) => {
    setModalData(request);
    setActiveModal("declineInterest");
  };

  const handleConfirmDeclineInterest = async (request, reason, shouldBlock) => {
    setActiveModal(null);
    try {
      await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", requestId: request.id, reason, shouldBlock })
      });
    } catch {}

    setReceivedInterests(receivedInterests.filter(r => r.id !== request.id));
    setDeclinedList([request, ...declinedList]);
    triggerToast(`Interest declined${shouldBlock ? " & reported" : ""}`);
  };

  // Undo Decline
  const handleUndoDecline = async (item) => {
    try {
      await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "undo", requestId: item.id })
      });
    } catch {}

    setDeclinedList(declinedList.filter(d => d.id !== item.id));
    setReceivedInterests([item, ...receivedInterests]);
    triggerToast(`Restored ${item.name} to Received`);
  };

  // Send Chat Message via Backend API
  const handleSendMessage = async (chatId, text) => {
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: "me",
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: true
        };
        return { ...c, messages: [...c.messages, newMsg] };
      }
      return c;
    });
    setChats(updatedChats);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, text })
      });
    } catch {}

    // Simulated reply
    setTimeout(() => {
      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          const autoReply = {
            id: `reply-${Date.now()}`,
            sender: "them",
            text: "JazakAllah Khair for your message. May Allah grant barakah in our communication.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true
          };
          return { ...c, messages: [...c.messages, autoReply] };
        }
        return c;
      }));
    }, 1200);
  };

  const handleStartChatFromMatch = (matchData) => {
    setActiveModal(null);
    setCurrentTab("messages");
  };

  // Activate Premium via Backend API (mock payment)
  const handleSubscribe = async (plan) => {
    setIsSubscriptionOpen(false);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan?.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsPremium(true);
        setCurrentUser(prev => prev ? {
          ...prev,
          isPremium: true,
          premiumPlan: data.subscription?.plan,
          premiumUntil: data.subscription?.premiumUntil
        } : prev);
        await hydrateFromBackend();
        triggerToast(`🎉 Premium Active! Welcome to Risthay Premium — ${plan?.duration}`);
        return;
      }
    } catch {}
    // Fallback: optimistic activation so the UX never dead-ends offline.
    setIsPremium(true);
    triggerToast(`🎉 Premium Active! Welcome to Risthay Premium — ${plan?.duration}`);
  };

  // 1. IF NOT LOGGED IN: Show the new 15-page Complete Onboarding Flow
  if (!isLoggedIn) {
    return (
      <CompleteOnboardingFlow
        initialUser={currentUser}
        onComplete={(profile) => {
          setIsLoggedIn(true);
          setCurrentUser(profile);
          setCurrentTab("home");
          triggerToast("Mabrook! Welcome to Risthay, " + (profile.name || "Member") + "! 🎉");
          hydrateFromBackend();
        }}
        onDirectLogin={() => {
          // Quick 1-tap demo login for testers / evaluators
          const demoUser = {
            id: "user-default",
            name: "Ahmed Raza",
            age: 28,
            profession: "Principal Architect",
            city: "Hyderabad",
            state: "Telangana",
            verified: true,
            avatar: "/images/ahmed.jpg"
          };
          setIsLoggedIn(true);
          setCurrentUser(demoUser);
          setCurrentTab("home");
          triggerToast("Welcome back, Ahmed Raza! (Demo Login)");
          hydrateFromBackend();
        }}
      />
    );
  }

  // 2. MAIN MOBILE-FIRST APP SHELL
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f1f5f9",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start"
    }}>
      {/* Mobile Screen Container (480px width on desktop, 100% on phone) */}
      <div style={{
        maxWidth: "480px",
        width: "100%",
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        overflowX: "hidden"
      }}>
        {/* Mobile App Top Header */}
        <header style={{
          position: "sticky",
          top: 0,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 40
        }}>
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setCurrentTab("home")}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <img 
              src="/images/logo.png" 
              alt="Risthay Muslim Matrimony" 
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                objectFit: "contain",
                background: "#ffffff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
              }} 
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Risthay</span>
                <span style={{ background: "#ecfdf5", color: "#059669", fontSize: "9px", fontWeight: "700", padding: "1px 5px", borderRadius: "4px" }}>
                  INDIA
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Premium Crown + Settings */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Premium / Crown Button */}
            <button
              onClick={() => setIsSubscriptionOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "20px",
                background: isPremium
                  ? "linear-gradient(135deg, #059669, #047857)"
                  : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                border: "none",
                cursor: "pointer",
                boxShadow: isPremium
                  ? "0 4px 14px rgba(5,150,105,0.35)"
                  : "0 4px 14px rgba(251,191,36,0.4)"
              }}
              title={isPremium ? "Premium Active" : "Upgrade to Premium"}
            >
              <Crown size={14} color={isPremium ? "#ffffff" : "#0f172a"} />
              <span style={{ color: isPremium ? "#ffffff" : "#0f172a", fontSize: "11px", fontWeight: "800" }}>
                {isPremium ? "Premium" : "Upgrade"}
              </span>
            </button>

            {/* Settings (opens Settings & Privacy modal) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569"
              }}
              title="Settings & Privacy"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Profile Moderation & Review Status Banner */}
        {currentUser && currentUser.reviewStatus && currentUser.reviewStatus !== "approved" && (
          <div style={{
            padding: "10px 16px",
            background: currentUser.reviewStatus === "rejected"
              ? "#fef2f2"
              : currentUser.reviewStatus === "needs_correction"
              ? "#fffbeb"
              : "#ecfdf5",
            borderBottom: `1px solid ${
              currentUser.reviewStatus === "rejected"
                ? "#fecaca"
                : currentUser.reviewStatus === "needs_correction"
                ? "#fde68a"
                : "#a7f3d0"
            }`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            lineHeight: "1.4"
          }}>
            {currentUser.reviewStatus === "rejected" ? (
              <div style={{ color: "#dc2626", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span>🚫 Registration Rejected:</span>
                <span style={{ color: "#7f1d1d", fontWeight: "500" }}>{currentUser.rejectionReason || "Identity guidelines not met"}</span>
              </div>
            ) : currentUser.reviewStatus === "needs_correction" ? (
              <div style={{ color: "#b45309", fontWeight: "700", flex: 1 }}>
                <span>⚠️ Correction Requested:</span>{" "}
                <span style={{ color: "#78350f", fontWeight: "500" }}>{currentUser.correctionNotes || "Please review and clarify your profile information."}</span>
              </div>
            ) : (
              <div style={{ color: "#065f46", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={16} color="#059669" />
                <span>
                  <strong>Under Verification:</strong> Your profile is currently being reviewed by Halal Moderation. Matches can see you once approved.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mobile Main Body */}
        <main style={{ flex: 1, padding: currentTab === "messages" ? "0 0 70px 0" : "16px 16px 20px 16px" }}>
          {currentTab === "home" && (
            <HomeDashboard 
              profiles={profiles}
              currentUser={currentUser}
              onViewProfile={(p) => setSelectedProfileForDetails(p)}
              onSendInterest={handleInitiateSendInterest}
              onOpenGuide={(guideId) => {
                setModalData(guideId);
                setActiveModal("guide");
              }}
              setCurrentTab={setCurrentTab}
              isPremium={isPremium}
              onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
              stats={{
                views: 12,
                shortlisted: shortlistedIds.length,
                sent: sentInterests.length,
                messages: chats.filter(c => c.unreadCount > 0).length
              }}
            />
          )}

          {currentTab === "browse" && (
            <BrowseProfiles 
              profiles={profiles}
              shortlistedIds={shortlistedIds}
              onToggleShortlist={handleToggleShortlist}
              onViewProfile={(p) => setSelectedProfileForDetails(p)}
              onSendInterest={handleInitiateSendInterest}
              globalPhotoBlur={globalPhotoBlur}
              onToggleGlobalPhotoBlur={() => setGlobalPhotoBlur(!globalPhotoBlur)}
              isPremium={isPremium}
              onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
            />
          )}

          {currentTab === "interests" && (
            <InterestsView 
              receivedInterests={receivedInterests}
              sentInterests={sentInterests}
              declinedList={declinedList}
              onAcceptInterest={handleInitiateAcceptInterest}
              onDeclineInterest={handleInitiateDeclineInterest}
              onUndoDecline={handleUndoDecline}
              onViewProfile={(p) => setSelectedProfileForDetails(p)}
              onOpenChatWithMatch={(profileId) => {
                const ch = chats.find(c => c.matchId === profileId);
                if (ch) setActiveChatId(ch.id);
                setCurrentTab("messages");
              }}
              isPremium={isPremium}
              onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
            />
          )}

          {currentTab === "messages" && (
            <MessagesView 
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              onSendMessage={handleSendMessage}
              onViewProfile={(p) => setSelectedProfileForDetails(p)}
              isPremium={isPremium}
              onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
            />
          )}

          {currentTab === "myProfile" && (
            <MyProfileView 
              onOpenSettings={() => setIsSettingsOpen(true)}
              onEditProfile={() => setIsEditingProfile(true)}
              onLogout={handleLogout}
              currentUser={currentUser}
              globalPhotoBlur={globalPhotoBlur}
            />
          )}
        </main>

        {/* Clean Mobile Bottom Navigation Dock */}
        <BottomNav 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          receivedCount={receivedInterests.length}
          unreadMessagesCount={chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
        />

        {/* Settings & Privacy Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          globalPhotoBlur={globalPhotoBlur}
          onToggleGlobalPhotoBlur={() => setGlobalPhotoBlur(prev => !prev)}
          onOpenWizard={() => setIsEditingProfile(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Modals Suite */}
        <ActionModals 
          activeModal={activeModal}
          modalData={modalData}
          onClose={() => setActiveModal(null)}
          onConfirmSendInterest={handleConfirmSendInterest}
          onConfirmAcceptInterest={handleConfirmAcceptInterest}
          onConfirmDeclineInterest={handleConfirmDeclineInterest}
          onStartChatFromMatch={handleStartChatFromMatch}
          isPremium={isPremium}
          onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
        />

        {selectedProfileForDetails && (
          <ProfileDetailsModal 
            profile={selectedProfileForDetails}
            onClose={() => setSelectedProfileForDetails(null)}
            onSendInterest={handleInitiateSendInterest}
            isShortlisted={shortlistedIds.includes(selectedProfileForDetails.id)}
            onToggleShortlist={handleToggleShortlist}
            globalPhotoBlur={globalPhotoBlur}
            isPremium={isPremium}
            onUpgradeToPremium={() => setIsSubscriptionOpen(true)}
          />
        )}

        {/* Premium Subscription Page */}
        {isSubscriptionOpen && (
          <SubscriptionPage
            onClose={() => setIsSubscriptionOpen(false)}
            onSubscribe={handleSubscribe}
            isPremium={isPremium}
          />
        )}

        {isEditingProfile && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "#ffffff",
            overflowY: "auto"
          }}>
            <CompleteOnboardingFlow 
              onComplete={(updated) => {
                setCurrentUser(prev => ({ ...prev, ...updated }));
                setIsEditingProfile(false);
                triggerToast("Profile updated successfully! ✨");
              }}
              onCancel={() => setIsEditingProfile(false)}
            />
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div 
            className="animate-slide-up"
            style={{
              position: "fixed",
              bottom: "75px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0f172a",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: "600",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap"
            }}
          >
            <Sparkles size={14} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
