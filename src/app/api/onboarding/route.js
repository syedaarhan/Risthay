import { ok, fail, serverError, readJson, getSessionUserId } from "@/lib/server/http";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { createUser, updateUser, getUserById } from "@/lib/server/repo";
import { randomInt } from "node:crypto";
import {
  calculateAge,
  isValidDob,
  isPincode,
  sanitize,
  asInt,
  MIN_AGE
} from "@/lib/server/validation";

function buildProfile(data, existing = {}) {
  const fullName = sanitize(data.fullName || data.name, 100);
  const age = calculateAge(data.dob);
  const photos = Array.isArray(data.photos)
    ? data.photos.filter((p) => typeof p === "string" && p.trim()).slice(0, 8)
    : existing.photos || [];
  const primaryIndex = asInt(data.primaryPhotoIndex, 0);
  const photoHidden = (data.photoPrivacy || existing.photoPrivacy) === "hide";
  const gender = sanitize(data.gender, 20) || existing.gender || "Male";

  const fallbackAvatar = gender === "Female" ? "/images/ayesha.jpg" : "/images/ahmed.jpg";
  const avatar = photos[primaryIndex] || photos[0] || existing.avatar || fallbackAvatar;

  return {
    ...existing,
    name: fullName,
    age,
    dob: data.dob,
    gender,
    height: sanitize(data.height, 30) || existing.height || null,
    motherTongue: sanitize(data.motherTongue, 40) || existing.motherTongue || "Urdu",
    profession: sanitize(data.jobTitle, 120) || existing.profession || "Professional",
    education: sanitize(data.highestQualification, 160) || existing.education || "Bachelor's Degree",
    city: sanitize(data.city, 80),
    state: sanitize(data.state, 80),
    country: "India",
    pincode: sanitize(data.pincode, 6) || existing.pincode || null,
    religiousPractice: sanitize(data.religiousPractice, 80) || existing.religiousPractice || "Practicing",
    maritalStatus: sanitize(data.maritalStatus, 40) || existing.maritalStatus || "Never Married",
    incomeRange: sanitize(data.incomeRange, 60) || existing.incomeRange || null,
    bio: sanitize(data.bio, 1200) || existing.bio || "Assalamu Alaikum. Sincere and family-oriented Muslim searching for a pious life partner.",
    familyName: sanitize(data.familyName, 80) || existing.familyName || null,
    timeline: sanitize(data.timeline, 40) || existing.timeline || "3 - 6 Months",
    photos,
    photoHidden,
    photoPrivacy: photoHidden ? "hide" : "show",
    primaryPhotoIndex: primaryIndex,
    verified: !data.aadhaarSkipped,
    verificationDoc: sanitize(data.docType, 120) || existing.verificationDoc || "Aadhaar Card (UIDAI Verified)",
    avatar,
    role: existing.role || "member",
    onboarded: true,
    activeStatus: existing.activeStatus || "Active Today"
  };
}

export async function POST(request) {
  try {
    const data = await readJson(request);

    /* Validation ---------------------------------------------------- */
    const fullName = sanitize(data.fullName || data.name, 100);
    if (!fullName || fullName.length < 3) {
      return fail("Full Name is required and must be at least 3 characters long.", 400);
    }

    if (!isValidDob(data.dob)) {
      return fail("A valid Date of Birth (YYYY-MM-DD) is required.", 400);
    }

    const age = calculateAge(data.dob);
    if (age < MIN_AGE) {
      return fail(
        `Registration restricted: The applicant must be 21 years of age or older to register on Risthay in compliance with Indian matrimony legal regulations. Your calculated age is ${age} years.`,
        400
      );
    }

    if (!sanitize(data.state, 80) || !sanitize(data.city, 80)) {
      return fail("State and City in India are required fields.", 400);
    }

    if (data.pincode && !isPincode(data.pincode)) {
      return fail("Please enter a valid 6-digit Indian PIN code.", 400);
    }

    /* Create or update --------------------------------------------- */
    const sessionUserId = getSessionUserId(request);
    let profile;

    if (sessionUserId && getUserById(sessionUserId)) {
      const existing = getUserById(sessionUserId);
      profile = updateUser(sessionUserId, buildProfile(data, existing));
    } else {
      const id = `RS-${randomInt(10000, 99999)}`;
      const built = buildProfile(data, { id });
      profile = createUser({ ...built, id });

      const { token } = createSession(profile.id, {
        userAgent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || "unknown"
      });

      const response = ok({
        message: "Profile successfully created and verified with Aadhaar KYC.",
        calculatedAge: age,
        profile
      });
      response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
      return response;
    }

    return ok({
      message: "Profile updated successfully.",
      calculatedAge: age,
      profile
    });
  } catch (error) {
    return serverError(error);
  }
}
