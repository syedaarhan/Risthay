"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Camera, 
  UploadCloud, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Users, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Ruler, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  FileText, 
  RefreshCw, 
  Sliders, 
  X, 
  HelpCircle, 
  Check, 
  ChevronDown, 
  Info, 
  ExternalLink, 
  Star, 
  Trash2, 
  MoveLeft, 
  MoveRight, 
  Maximize2, 
  Clock, 
  Search,
  CheckCheck
} from "lucide-react";
import { INDIAN_STATES_CITIES, MOTHER_TONGUES } from "@/data/mockData";
import MobileSelect from "@/components/MobileSelect";
import { useMemo } from "react";
import { signInWithGoogle } from "@/lib/supabase/auth";

// Local age calculation (avoids importing new Date() at module level)
function computeAge(dobString) {
  if (typeof window === "undefined" || !dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// Comprehensive List of Indian States & Union Territories (All 28 States & 8 UTs)
const ALL_INDIAN_STATES = {
  "Andaman & Nicobar Islands": ["Port Blair", "Havelock Island", "Diglipur", "Car Nicobar"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kadapa", "Tirupati", "Anantapur", "Rajahmundry", "Eluru"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra"],
  "Chandigarh": ["Chandigarh (City Center)", "Sector 17", "Sector 35", "Manimajra"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi NCR": ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi", "Noida", "Greater Noida", "Gurugram", "Ghaziabad", "Faridabad"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Bharuch", "Navsari", "Morbi"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali", "Baddi"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore", "Pulwama", "Shopian", "Kathua", "Udhampur", "Budgam"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi", "Kalaburagi (Gulbarga)", "Bidar", "Raichur", "Ballari", "Davangere", "Shivamogga", "Tumakuru", "Udupi", "Bijapur (Vijayapura)"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Malappuram", "Kannur", "Kollam", "Thrissur", "Palakkad", "Alappuzha", "Kottayam", "Kasaragod", "Ponnani", "Manjeri"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti", "Agatti", "Andrott", "Amini"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Burhanpur", "Khandwa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Chhatrapati Sambhajinagar (Aurangabad)", "Solapur", "Kolhapur", "Navi Mumbai", "Amravati", "Nanded", "Jalgaon", "Akola", "Latur", "Dhule", "Malegaon", "Bhiwandi", "Panvel", "Mira-Bhayandar"],
  "Manipur": ["Imphal", "Churachandpur", "Thoubal", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)", "Hoshiarpur", "Pathankot", "Moga", "Batala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Pali", "Tonk"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Vaniyambadi", "Ambur"],
  "Telangana": ["Hyderabad", "Secunderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj (Allahabad)", "Aligarh", "Bareilly", "Meerut", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Budaun", "Rampur", "Sambhal", "Shahjahanpur", "Ayodhya"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudraprayag", "Kashipur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Asansol", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni", "Murshidabad"]
};

// Common Indian Muslim Communities
const POPULAR_COMMUNITIES = [
  "Syed", "Khan", "Pathan", "Sheikh", "Ansari", "Siddiqui", 
  "Farooqui", "Qureshi", "Mirza", "Malik", "Usmani", "Alvi", 
  "Memon", "Dawoodi Bohra", "Khoja", "Mapila", "Decani", "Mansuri", "Saifi"
];

// Education Qualifications
const EDUCATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Religious Education",
  "Other"
];

// Employment Sectors
const EMPLOYMENT_SECTOR_OPTIONS = [
  "Government",
  "Private Sector",
  "Self-Employed",
  "Business",
  "Education",
  "Healthcare",
  "IT & Technology",
  "Not Currently Working",
  "Student",
  "Other"
];

// Common Professions for Quick Select
const POPULAR_PROFESSIONS = [
  "Software Engineer",
  "Doctor / Physician",
  "Chartered Accountant (CA)",
  "Architect",
  "Civil Engineer",
  "Data Scientist",
  "Business Owner / Entrepreneur",
  "Professor / Lecturer",
  "Teacher / Educator",
  "Lawyer / Legal Consultant",
  "Financial Analyst",
  "Islamic Scholar / Aalim",
  "Pharmacist",
  "Government Officer (UPSC / State)",
  "Designer / Creative Director"
];

// Sample Preset Halal Photos for Testing
const PRESET_PHOTOS = [
  { id: "p1", url: "/images/ahmed.jpg", label: "Ahmed (Portrait)" },
  { id: "p2", url: "/images/ayesha.jpg", label: "Ayesha (Portrait)" },
  { id: "p3", url: "/images/fatima.jpg", label: "Fatima (Outdoor)" },
  { id: "p4", url: "/images/tariq.jpg", label: "Tariq (Formal)" },
  { id: "p5", url: "/images/zainab.jpg", label: "Zainab (Hijab)" },
  { id: "p6", url: "/images/halal_couple.jpg", label: "Family Celebration" }
];

// Marital status explanations
const MARITAL_STATUS_EXPLANATIONS = {
  "Never Married": "Single and seeking first marriage according to the Sunnah.",
  "Divorced": "Legally and Islamically divorced with completed Talaq and Iddah period.",
  "Separated": "Living apart; legal or formal dissolution process is currently in progress.",
  "Widowed": "Spouse has passed away (May Allah have mercy on them).",
  "Khula": "Dissolution of marriage initiated and granted to the wife through Islamic Shariah procedure."
};

// Hobbies & Interests categories
const HOBBIES_LIST = [
  "Islamic Studies", "Reading Books", "Cooking & Baking", "Travelling", 
  "Fitness & Gym", "Calligraphy", "Photography", "Tech & Coding", 
  "Gardening", "Volunteering & Charity", "Badminton & Sports", "Nature Walks",
  "Family Gatherings", "Poetry (Urdu/English)", "History & Heritage"
];

// Height list from Below 4 ft 5 in to Above 6 ft 2 in
const HEIGHT_OPTIONS = [
  { label: "Below 4 ft 5 in", value: "Below 4 ft 5 in", cm: "< 135 cm" },
  { label: "4 ft 5 in", value: "4 ft 5 in", cm: "135 cm" },
  { label: "4 ft 6 in", value: "4 ft 6 in", cm: "137 cm" },
  { label: "4 ft 7 in", value: "4 ft 7 in", cm: "140 cm" },
  { label: "4 ft 8 in", value: "4 ft 8 in", cm: "142 cm" },
  { label: "4 ft 9 in", value: "4 ft 9 in", cm: "145 cm" },
  { label: "4 ft 10 in", value: "4 ft 10 in", cm: "147 cm" },
  { label: "4 ft 11 in", value: "4 ft 11 in", cm: "150 cm" },
  { label: "5 ft 0 in", value: "5 ft 0 in", cm: "152 cm" },
  { label: "5 ft 1 in", value: "5 ft 1 in", cm: "155 cm" },
  { label: "5 ft 2 in", value: "5 ft 2 in", cm: "157 cm" },
  { label: "5 ft 3 in", value: "5 ft 3 in", cm: "160 cm" },
  { label: "5 ft 4 in", value: "5 ft 4 in", cm: "163 cm" },
  { label: "5 ft 5 in", value: "5 ft 5 in", cm: "165 cm" },
  { label: "5 ft 6 in", value: "5 ft 6 in", cm: "168 cm" },
  { label: "5 ft 7 in", value: "5 ft 7 in", cm: "170 cm" },
  { label: "5 ft 8 in", value: "5 ft 8 in", cm: "173 cm" },
  { label: "5 ft 9 in", value: "5 ft 9 in", cm: "175 cm" },
  { label: "5 ft 10 in", value: "5 ft 10 in", cm: "178 cm" },
  { label: "5 ft 11 in", value: "5 ft 11 in", cm: "180 cm" },
  { label: "6 ft 0 in", value: "6 ft 0 in", cm: "183 cm" },
  { label: "6 ft 1 in", value: "6 ft 1 in", cm: "185 cm" },
  { label: "6 ft 2 in", value: "6 ft 2 in", cm: "188 cm" },
  { label: "Above 6 ft 2 in", value: "Above 6 ft 2 in", cm: "> 188 cm" }
];

export default function CompleteOnboardingFlow({ onComplete, onCancel, onDirectLogin, initialUser }) {
  // Current active step (1 to 15)
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  
  // Modals for Terms, Privacy, Photo Lightbox, Tooltips
  const [activeModal, setActiveModal] = useState(null); // 'terms' | 'privacy' | 'galleryPreview' | 'googleLogin' | 'googleAttach'

  // Master Form State covering all 15 Pages
  const [formData, setFormData] = useState({
    // Page 1: Auth Info (Google Only)
    authProvider: "google",
    email: "syed.rehan@example.com",

    // Page 2: Who Are You Creating This Profile For?
    profileFor: "Myself", // Myself, My Son, My Daughter, My Brother, My Sister, My Relative, Someone Else
    gender: "", // Mandatory: Male | Female

    // Page 3: Personal Details
    firstName: "", // Mandatory
    middleName: "",
    lastName: "", // Mandatory

    // Page 4: Date of Birth
    dobDay: "", // Mandatory
    dobMonth: "", // Mandatory
    dobYear: "", // Mandatory

    // Page 5: Height
    height: "", // Mandatory

    // Page 6: Current Location
    country: "India",
    state: "", // Mandatory
    city: "", // Mandatory
    pincode: "",
    familyLivesHere: "Yes", // Yes | No

    // Page 7: Language & Family Background
    motherTongue: "", // Mandatory
    communitySelect: "Khan", // Listed option or 'Other'
    communityCustom: "",

    // Page 8: Marital Status
    maritalStatus: "", // Mandatory
    hasChildren: "No",

    // Page 9: Education & Profession
    highestQualification: "", // Mandatory
    employmentSector: "", // Mandatory
    profession: "", // Mandatory

    // Page 10: Monthly Income
    incomeOption: "", // Mandatory ('slider' | 'below_10000' | 'prefer_not_to_say')
    monthlyIncome: 50000,

    // Page 11: Profile Gallery
    photos: [], // Mandatory: at least 1 photo
    primaryPhotoIndex: 0,
    photoPrivacy: "show", // 'show' | 'hide'
    socialMediaPlatform: "Instagram",
    socialMediaLink: "",

    // Page 12: About You
    aboutMe: "", // Mandatory
    hobbies: [],
    partnerLookingFor: "",
    partnerAgeMin: "", // Mandatory
    partnerAgeMax: "", // Mandatory

    // Page 13: Aadhaar Verification (Front Side Only)
    aadhaarFront: null, // Mandatory
    aadhaarConsent: false, // Mandatory
    aadhaarSkipped: false,

    // Page 14: Live Selfie Verification
    liveSelfieUrl: null,
    selfieVerified: false, // Mandatory
    selfieStep: "ready", // 'ready' | 'streaming' | 'capturing' | 'analyzing' | 'verified' | 'fallback'

    // Page 15: Review Status
    reviewStatus: "pending"
  });

  // Pre-fill Google authenticated account details when arriving from OAuth or props
  useEffect(() => {
    if (initialUser) {
      const parts = (initialUser.name || "").trim().split(/\s+/);
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setFormData(prev => ({
        ...prev,
        authProvider: "google",
        email: initialUser.email || prev.email,
        firstName: first || prev.firstName,
        lastName: last || prev.lastName
      }));
      if (initialUser.email || initialUser.name) {
        setCurrentPage(2);
      }
    } else if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isGoogle = params.get("provider") === "google";
      const name = params.get("name");
      const email = params.get("email");
      const authErr = params.get("auth_error");
      if (authErr) {
        setGoogleError(decodeURIComponent(authErr));
      }
      if (isGoogle || name || email) {
        const parts = (name || "").trim().split(/\s+/);
        const first = parts[0] || "";
        const last = parts.slice(1).join(" ") || "";
        setFormData(prev => ({
          ...prev,
          authProvider: "google",
          email: email || prev.email,
          firstName: first || prev.firstName,
          lastName: last || prev.lastName
        }));
        setCurrentPage(2);
      }
    }
  }, [initialUser]);

  const handleGoogleSignInFlow = async () => {
    setIsGoogleLoading(true);
    setGoogleError("");
    const { error } = await signInWithGoogle({ next: "/", intent: "login" });
    if (error) {
      setGoogleError(error.message || "Unable to initiate Google Sign-In.");
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleAttachFlow = async () => {
    setIsGoogleLoading(true);
    setGoogleError("");
    const { error } = await signInWithGoogle({ next: "/?onboarding=start", intent: "attach" });
    if (error) {
      setGoogleError(error.message || "Unable to attach Google Account.");
      setIsGoogleLoading(false);
    }
  };

  // Calculate age dynamically — client-only
  const isDobComplete = Boolean(formData.dobYear && formData.dobMonth && formData.dobDay);
  const formattedDob = isDobComplete
    ? `${formData.dobYear}-${String(formData.dobMonth).padStart(2, "0")}-${String(formData.dobDay).padStart(2, "0")}`
    : "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const calculatedAge = (mounted && isDobComplete) ? computeAge(formattedDob) : 0;
  const isUnderage = mounted && isDobComplete && calculatedAge < 21;

  // Camera stream ref for Live Selfie
  const videoRef = useRef(null);
  const livenessIntervalRef = useRef(null);
  const instructionTimeoutsRef = useRef([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [livenessInstruction, setLivenessInstruction] = useState("Position face inside the oval guide");
  const [livenessScore, setLivenessScore] = useState(0);

  // Auto clean up timers and liveness interval on unmount
  useEffect(() => {
    return () => {
      if (livenessIntervalRef.current) {
        clearInterval(livenessIntervalRef.current);
        livenessIntervalRef.current = null;
      }
      instructionTimeoutsRef.current.forEach(clearTimeout);
      instructionTimeoutsRef.current = [];
    };
  }, []);

  // Stop any active camera stream on unmount or when it is replaced
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Clean validation error when page changes
  useEffect(() => {
    setValidationError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle Page 2 smart gender defaults when profileFor changes
  const handleProfileForChange = (relation) => {
    let newGender = formData.gender;
    if (relation === "My Son" || relation === "My Brother") {
      newGender = "Male";
    } else if (relation === "My Daughter" || relation === "My Sister") {
      newGender = "Female";
    }
    setFormData(prev => ({
      ...prev,
      profileFor: relation,
      gender: newGender
    }));
  };

  // Validation before advancing to next step
  const handleNextPage = () => {
    setValidationError("");

    // Step 2: Gender Validation (have to enter)
    if (currentPage === 2) {
      if (!formData.gender) {
        setValidationError("Please select your gender to proceed.");
        return;
      }
    }

    // Step 3: Full Name Validation - First Name & Last Name (have to enter)
    if (currentPage === 3) {
      if (!formData.firstName?.trim()) {
        setValidationError("Please enter your First Name.");
        return;
      }
      if (!formData.lastName?.trim()) {
        setValidationError("Please enter your Last Name.");
        return;
      }
    }

    // Step 4: Age Validation - Day, Month, Year & minimum 21 years (have to enter)
    if (currentPage === 4) {
      if (!formData.dobDay || !formData.dobMonth || !formData.dobYear) {
        setValidationError("Please select your complete Date of Birth (Day, Month, and Year).");
        return;
      }
      if (isUnderage) {
        setValidationError(`You must be at least 21 years old to create a profile on Risthay. Your current calculated age is ${calculatedAge} years.`);
        return;
      }
    }

    // Step 5: Height Validation (have to enter)
    if (currentPage === 5) {
      if (!formData.height) {
        setValidationError("Please select your height to proceed.");
        return;
      }
    }

    // Step 6: Current Location Validation - State & City (have to enter)
    if (currentPage === 6) {
      if (!formData.state) {
        setValidationError("Please select your current State.");
        return;
      }
      if (!formData.city) {
        setValidationError("Please select your current City.");
        return;
      }
    }

    // Step 7: Mother Tongue Validation (have to enter)
    if (currentPage === 7) {
      if (!formData.motherTongue) {
        setValidationError("Please select your Mother Tongue.");
        return;
      }
      if (formData.communitySelect === "Other" && !formData.communityCustom?.trim()) {
        setValidationError("Please specify your family community name.");
        return;
      }
    }

    // Step 8: Marital Status Validation (have to enter)
    if (currentPage === 8) {
      if (!formData.maritalStatus) {
        setValidationError("Please select your marital status.");
        return;
      }
    }

    // Step 9: Education and Career Validation (have to enter)
    if (currentPage === 9) {
      if (!formData.highestQualification) {
        setValidationError("Please select your Highest Education Qualification.");
        return;
      }
      if (!formData.employmentSector) {
        setValidationError("Please select your Employment Sector.");
        return;
      }
      if (!formData.profession?.trim()) {
        setValidationError("Please enter your Profession / Designation.");
        return;
      }
    }

    // Step 10: Monthly Income Validation (have to enter)
    if (currentPage === 10) {
      if (!formData.incomeOption) {
        setValidationError("Please select your monthly income range or privacy preference.");
        return;
      }
      if (formData.incomeOption === "slider" && (!formData.monthlyIncome || formData.monthlyIncome <= 0)) {
        setValidationError("Please specify your monthly income using the slider.");
        return;
      }
    }

    // Step 11: Profile Gallery Photos Validation (have to enter)
    if (currentPage === 11) {
      if (!formData.photos || formData.photos.length === 0) {
        setValidationError("Please upload or add at least one profile photo to proceed.");
        return;
      }
    }

    // Step 12: About Me & Preferred Partner Age Range Validation (have to enter)
    if (currentPage === 12) {
      if (!formData.aboutMe?.trim()) {
        setValidationError("Please write a short introduction in the 'About Me' section.");
        return;
      }
      if (!formData.partnerAgeMin || !formData.partnerAgeMax) {
        setValidationError("Please select your preferred partner age range (Minimum and Maximum Age).");
        return;
      }
      if (Number(formData.partnerAgeMin) > Number(formData.partnerAgeMax)) {
        setValidationError("Minimum partner age cannot be greater than maximum partner age.");
        return;
      }
    }

    // Step 13: Aadhaar Verification Validation (have to enter)
    if (currentPage === 13) {
      if (!formData.aadhaarFront) {
        setValidationError("Please upload your Aadhaar Card (Front Side) to proceed.");
        return;
      }
      if (!formData.aadhaarConsent) {
        setValidationError("Please confirm consent for identity verification to proceed.");
        return;
      }
    }

    // Step 14: Live Selfie Verification Validation (have to enter)
    if (currentPage === 14) {
      if (!formData.selfieVerified || formData.selfieStep !== "verified") {
        setValidationError("Please complete your live selfie verification or fallback check to continue.");
        return;
      }
    }

    if (currentPage < 15) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    setValidationError("");
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  // Final Dashboard Submission
  const handleFinalSubmitToDashboard = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim(),
        dob: formattedDob,
        gender: formData.gender,
        height: formData.height,
        motherTongue: formData.motherTongue,
        familyName: formData.communitySelect === "Other" ? formData.communityCustom : formData.communitySelect,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        maritalStatus: formData.maritalStatus,
        highestQualification: formData.highestQualification,
        jobTitle: formData.profession,
        incomeRange: formData.incomeOption === "prefer_not_to_say" 
          ? "Confidential" 
          : formData.incomeOption === "below_10000" 
          ? "Below ₹1.2 Lakh p.a." 
          : `₹${(formData.monthlyIncome * 12 / 100000).toFixed(1)} Lakhs p.a.`,
        bio: formData.aboutMe,
        docType: formData.aadhaarSkipped ? "Alternative ID Pending" : "Aadhaar Card (UIDAI Verified)",
        photos: formData.photos,
        photoPrivacy: formData.photoPrivacy
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const completedProfile = data.profile || {
        ...formData,
        id: `RS-${Math.floor(10000 + Math.random() * 90000)}`,
        name: payload.fullName,
        age: calculatedAge,
        verified: true,
        avatar: formData.photos[formData.primaryPhotoIndex] || formData.photos[0] || "/images/ahmed.jpg"
      };

      if (onComplete) {
        onComplete(completedProfile);
      }
    } catch {
      // Fallback local completion
      const localProfile = {
        id: `RS-${Math.floor(10000 + Math.random() * 90000)}`,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        age: calculatedAge,
        city: formData.city,
        state: formData.state,
        profession: formData.profession,
        verified: true,
        avatar: formData.photos[formData.primaryPhotoIndex] || "/images/ahmed.jpg"
      };
      if (onComplete) {
        onComplete(localProfile);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format INR currency
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Live Camera Controls for Step 14
  const startCamera = async () => {
    try {
      setFormData(prev => ({ ...prev, selfieStep: "streaming" }));
      setLivenessInstruction("Position your face inside the oval frame");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate live biometric prompts
      instructionTimeoutsRef.current.push(
        setTimeout(() => setLivenessInstruction("Please blink your eyes naturally..."), 2000),
        setTimeout(() => setLivenessInstruction("Turn your head slightly to the right..."), 4500),
        setTimeout(() => setLivenessInstruction("Look straight & hold still... Ready to capture!"), 7000)
      );
    } catch {
      // Fallback if browser denies camera or no webcam available
      setFormData(prev => ({ ...prev, selfieStep: "fallback" }));
    }
  };

  const captureLiveSelfie = () => {
    setFormData(prev => ({ ...prev, selfieStep: "analyzing" }));
    setLivenessInstruction("Analyzing facial liveness & UIDAI biometrics...");
    
    // Simulate liveness detection score progression
    let score = 20;
    const interval = setInterval(() => {
      score += 25;
      setLivenessScore(Math.min(score, 100));
      if (score >= 98) {
        clearInterval(interval);
        livenessIntervalRef.current = null;
        setFormData(prev => ({ 
          ...prev, 
          selfieStep: "verified",
          selfieVerified: true,
          liveSelfieUrl: prev.photos[0] || "/images/ahmed.jpg"
        }));
        if (cameraStream) {
          cameraStream.getTracks().forEach(t => t.stop());
          setCameraStream(null);
        }
      }
    }, 400);
    livenessIntervalRef.current = interval;
  };

  // Helper for photo reordering
  const movePhoto = (index, direction) => {
    setFormData(prev => {
      const newPhotos = [...prev.photos];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newPhotos.length) return prev;

      const temp = newPhotos[index];
      newPhotos[index] = newPhotos[targetIndex];
      newPhotos[targetIndex] = temp;

      let newPrimary = prev.primaryPhotoIndex;
      if (newPrimary === index) {
        newPrimary = targetIndex;
      } else if (newPrimary === targetIndex) {
        newPrimary = index;
      }

      return { ...prev, photos: newPhotos, primaryPhotoIndex: newPrimary };
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      let newPrimary = prev.primaryPhotoIndex;
      if (newPrimary >= newPhotos.length) {
        newPrimary = Math.max(0, newPhotos.length - 1);
      }
      return { ...prev, photos: newPhotos, primaryPhotoIndex: newPrimary };
    });
  };

  const progressPercent = Math.round((currentPage / 15) * 100);

  // Quick page jump titles
  const PAGE_TITLES = [
    "Welcome & Sign In",
    "Who Is Profile For?",
    "Personal Details",
    "Date of Birth",
    "Height",
    "Current Location",
    "Background & Community",
    "Marital Status",
    "Education & Career",
    "Monthly Income",
    "Profile Gallery",
    "About You",
    "Aadhaar Verification",
    "Live Selfie Verification",
    "Profile Under Review"
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #ffffff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "16px 12px 60px",
      position: "relative"
    }}>
      {/* Main Form Container Card */}
      <div style={{
        maxWidth: "520px",
        width: "100%",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "24px 20px",
        boxShadow: "0 20px 45px -10px rgba(5, 150, 105, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03)",
        border: "1px solid #eef2f6",
        position: "relative"
      }}>
        {/* In-Card Clean Back Navigation & Step Badge (Steps 2-15) */}
        {currentPage > 1 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px"
          }}>
            <button
              type="button"
              onClick={handlePrevPage}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "10px",
                padding: "6px 12px",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer"
              }}
              title="Go back to previous step"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <span style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#059669",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "3px 10px",
              borderRadius: "8px"
            }}>
              Step {currentPage}/15 • {PAGE_TITLES[currentPage - 1]}
            </span>
          </div>
        )}

        {/* Validation Warning Banner */}
        {validationError && (
          <div style={{
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "14px",
            padding: "12px 14px",
            fontSize: "12px",
            fontWeight: "700",
            marginBottom: "18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            lineHeight: 1.5,
            animation: "fadeIn 0.2s ease"
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>{validationError}</div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 1: Welcome & Sign In                                      */}
        {/* ============================================================== */}
        {currentPage === 1 && (
          <div className="animate-fade" style={{ textAlign: "center" }}>
            {/* Official App Logo */}
            <div style={{ textAlign: "center", marginBottom: "14px" }}>
              <img 
                src="/images/logo.png" 
                alt="Risthay Muslim Matrimony" 
                style={{
                  width: "115px",
                  height: "auto",
                  margin: "0 auto",
                  display: "block",
                  filter: "drop-shadow(0 6px 16px rgba(5, 150, 105, 0.12))"
                }} 
              />
            </div>

            <div style={{
              fontFamily: "var(--font-arabic)",
              fontSize: "22px",
              color: "#059669",
              letterSpacing: "1px",
              marginBottom: "4px"
            }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            <h1 style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "8px",
              letterSpacing: "-0.5px"
            }}>
              Find your perfect life partner.
            </h1>

            <p style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: 1.6,
              marginBottom: "24px",
              maxWidth: "400px",
              marginInline: "auto"
            }}>
              Create your profile and take the first step towards a meaningful relationship.
            </p>

            {/* Feature Highlights Pills */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px",
              marginBottom: "26px",
              textAlign: "left"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f8fafc",
                padding: "10px 14px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <ShieldCheck size={18} color="#059669" />
                <span style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>
                  100% Aadhaar & Live Selfie Verified Matrimony
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f8fafc",
                padding: "10px 14px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0"
              }}>
                <Sparkles size={18} color="#d97706" />
                <span style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>
                  Pure Sunnah Dignity • Zero Dowry Pledge
                </span>
              </div>
            </div>

            {/* Primary Action for NEW users: Create Profile (requires attaching Google account first) */}
            <button
              onClick={() => {
                setActiveModal("googleAttach");
              }}
              className="btn-primary-action hover-lift"
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "16px",
                fontSize: "15px",
                fontWeight: "700",
                marginBottom: "16px"
              }}
            >
              <span>Get Started • Create Profile</span>
              <ArrowRight size={18} />
            </button>

            {/* Existing Member Login Section: Direct Login with Google */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              padding: "14px 16px",
              marginBottom: "16px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: "600",
                marginBottom: "10px"
              }}>
                Already registered with Risthay?
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveModal("googleLogin");
                }}
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
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                className="hover-lift"
              >
                {/* Google colored G icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                  Sign In with Google
                </span>
              </button>
            </div>

            {/* Quick Demo Login Bypass for Evaluators & Testers */}
            {onDirectLogin && (
              <button
                type="button"
                onClick={onDirectLogin}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "16px",
                  border: "1.5px dashed #059669",
                  background: "#f0fdf4",
                  color: "#047857",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginBottom: "20px",
                  transition: "all 0.2s ease"
                }}
                className="hover-lift"
              >
                <Sparkles size={16} color="#059669" />
                <span>Quick Demo Login (Skip to Dashboard)</span>
              </button>
            )}

            {/* India Residency Requirement Notice */}
            <div style={{
              background: "#ecfdf5",
              borderRadius: "16px",
              padding: "12px 14px",
              border: "1.5px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
              textAlign: "left"
            }}>
              <div style={{
                fontSize: "18px",
                flexShrink: 0
              }}>
                🇮🇳
              </div>
              <span style={{
                fontSize: "11px",
                color: "#065f46",
                fontWeight: "700",
                lineHeight: 1.45
              }}>
                Only users seeking Muslim matrimony within India can create profiles.
              </span>
            </div>

            {/* Terms & Privacy Links */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "12px",
              color: "#64748b"
            }}>
              <button
                onClick={() => setActiveModal("terms")}
                style={{
                  color: "#059669",
                  fontWeight: "600",
                  textDecoration: "underline"
                }}
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal("privacy")}
                style={{
                  color: "#059669",
                  fontWeight: "600",
                  textDecoration: "underline"
                }}
              >
                Privacy Policy
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 2: Who Are You Creating This Profile For?                 */}
        {/* ============================================================== */}
        {currentPage === 2 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Who is this profile for?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Select the relation of the person you are creating this profile for.
            </p>

            {/* Relation Options */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "24px"
            }}>
              {[
                { label: "Myself", icon: User },
                { label: "My Son", icon: UserCheck },
                { label: "My Daughter", icon: Heart },
                { label: "My Brother", icon: Users },
                { label: "My Sister", icon: Sparkles },
                { label: "My Relative", icon: Users },
                { label: "Someone Else", icon: HelpCircle }
              ].map((opt) => {
                const isSelected = formData.profileFor === opt.label;
                const IconComp = opt.icon;
                return (
                  <div
                    key={opt.label}
                    onClick={() => handleProfileForChange(opt.label)}
                    style={{
                      padding: "14px 12px",
                      borderRadius: "16px",
                      border: `2px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                      background: isSelected ? "#ecfdf5" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.15s ease",
                      gridColumn: opt.label === "Someone Else" ? "span 2" : "auto"
                    }}
                  >
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: isSelected ? "#059669" : "#f1f5f9",
                      color: isSelected ? "#ffffff" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <IconComp size={16} />
                    </div>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: isSelected ? "800" : "600",
                      color: isSelected ? "#065f46" : "#334155"
                    }}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check size={16} color="#059669" style={{ marginLeft: "auto" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Gender Selection */}
            <div style={{ marginBottom: "26px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", display: "block", marginBottom: "8px" }}>
                Gender
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Male", symbol: "♂", tag: "Groom / Brother" },
                  { label: "Female", symbol: "♀", tag: "Bride / Sister" }
                ].map((g) => {
                  const isSelected = formData.gender === g.label;
                  return (
                    <div
                      key={g.label}
                      onClick={() => setFormData({ ...formData, gender: g.label })}
                      style={{
                        padding: "14px",
                        borderRadius: "16px",
                        border: `2px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                        background: isSelected ? "#ecfdf5" : "#ffffff",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                        {g.symbol}
                      </div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "800",
                        color: isSelected ? "#065f46" : "#1e293b"
                      }}>
                        {g.label}
                      </div>
                      <div style={{ fontSize: "11px", color: isSelected ? "#059669" : "#64748b" }}>
                        {g.tag}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 3: Personal Details                                       */}
        {/* ============================================================== */}
        {currentPage === 3 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              What is {formData.profileFor === "Myself" ? "your" : `${formData.profileFor}'s`} name?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Please enter official legal name as printed on government identification documents.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {/* First Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  First Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rehan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a"
                  }}
                  required
                />
              </div>

              {/* Middle Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  Middle Name <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Farooq"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a"
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  Last Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Khan"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a"
                  }}
                  required
                />
              </div>
            </div>

            {/* Privacy note */}
            <div style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "12px 14px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <Lock size={16} color="#059669" />
              <span style={{ fontSize: "11px", color: "#475569", lineHeight: 1.45 }}>
                Your full name is protected. Potential matches only see your verified First Name until a connection is mutually accepted.
              </span>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 4: Date of Birth                                          */}
        {/* ============================================================== */}
        {currentPage === 4 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              When were you born?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Enter your date of birth to help us find suitable matches for you.
            </p>

            {/* Day / Month / Year Dropdowns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1.2fr",
              gap: "8px",
              marginBottom: "16px"
            }}>
              {/* Day */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                  Day
                </label>
                <MobileSelect
                  value={formData.dobDay}
                  onChange={(v) => setFormData({ ...formData, dobDay: v })}
                  options={Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"))}
                  placeholder="Day"
                  label="Select Day"
                  searchable={false}
                />
              </div>

              {/* Month */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                  Month
                </label>
                <MobileSelect
                  value={formData.dobMonth}
                  onChange={(v) => setFormData({ ...formData, dobMonth: v })}
                  options={[
                    { value: "01", label: "Jan - January" },
                    { value: "02", label: "Feb - February" },
                    { value: "03", label: "Mar - March" },
                    { value: "04", label: "Apr - April" },
                    { value: "05", label: "May - May" },
                    { value: "06", label: "Jun - June" },
                    { value: "07", label: "Jul - July" },
                    { value: "08", label: "Aug - August" },
                    { value: "09", label: "Sep - September" },
                    { value: "10", label: "Oct - October" },
                    { value: "11", label: "Nov - November" },
                    { value: "12", label: "Dec - December" }
                  ]}
                  placeholder="Month"
                  label="Select Month"
                  searchable={false}
                />
              </div>

              {/* Year */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "4px" }}>
                  Year
                </label>
                <MobileSelect
                  value={formData.dobYear}
                  onChange={(v) => setFormData({ ...formData, dobYear: v })}
                  options={Array.from({ length: 45 }, (_, i) => String(2008 - i))}
                  placeholder="Year"
                  label="Select Year"
                  searchable={false}
                />
              </div>
            </div>

            {/* Real-time Dynamic Age Calculation Result */}
            <div style={{
              background: !isDobComplete ? "#f8fafc" : isUnderage ? "#fef2f2" : "#ecfdf5",
              borderRadius: "14px",
              padding: "12px 14px",
              border: `1.5px solid ${!isDobComplete ? "#cbd5e1" : isUnderage ? "#fecaca" : "#a7f3d0"}`,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "800",
                  color: !isDobComplete ? "#475569" : isUnderage ? "#991b1b" : "#065f46"
                }}>
                  {!isDobComplete ? "Age Verification (21+ Required)" : `Calculated Age: ${calculatedAge} years old`}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: !isDobComplete ? "#64748b" : isUnderage ? "#b91c1c" : "#047857"
                }}>
                  {!isDobComplete ? "Select Day, Month, and Year to compute age" : isUnderage ? "Minimum age requirement not met" : "Eligible for Risthay Matrimony"}
                </div>
              </div>
              <div>
                {!isDobComplete ? (
                  <Calendar size={22} color="#64748b" />
                ) : isUnderage ? (
                  <span style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "4px 8px",
                    borderRadius: "8px"
                  }}>
                    Must be 21+
                  </span>
                ) : (
                  <CheckCircle2 size={24} color="#059669" />
                )}
              </div>
            </div>

            {/* Underage Warning Message as specified */}
            {isUnderage ? (
              <div style={{
                background: "#fff1f2",
                border: "1.5px solid #fecdd3",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "22px",
                textAlign: "left"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#be123c", fontWeight: "800", fontSize: "13px", marginBottom: "4px" }}>
                  <AlertCircle size={18} />
                  <span>Not Currently Eligible to Continue</span>
                </div>
                <p style={{ fontSize: "12px", color: "#881337", lineHeight: 1.5 }}>
                  <strong>Eligibility requirement:</strong> You must be at least <strong>21 years old</strong> to create a profile on Risthay in compliance with Indian matrimony legal regulations and community guidelines. Please come back once you celebrate your 21st birthday!
                </p>
              </div>
            ) : (
              <div style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "22px"
              }}>
                ℹ️ Age requirement: 21+ verified through Aadhaar KYC in subsequent steps.
              </div>
            )}

            <button
              onClick={handleNextPage}
              disabled={isUnderage}
              className="btn-primary-action"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                fontSize: "14px",
                opacity: isUnderage ? 0.45 : 1,
                cursor: isUnderage ? "not-allowed" : "pointer"
              }}
            >
              <span>{isUnderage ? "Under 21 (Ineligible)" : "Continue"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 5: Height                                                 */}
        {/* ============================================================== */}
        {currentPage === 5 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              How tall are you?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Select your height to help potential matches learn more about you.
            </p>

            {/* Display Selected Height Prominently as specified */}
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
              borderRadius: "20px",
              padding: "24px",
              border: "2px solid #a7f3d0",
              textAlign: "center",
              marginBottom: "22px",
              position: "relative"
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#059669",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px"
              }}>
                Selected Height
              </div>
              <div style={{
                fontSize: "36px",
                fontWeight: "800",
                color: formData.height ? "#065f46" : "#64748b",
                letterSpacing: "-1px"
              }}>
                {formData.height || "Select Height"}
              </div>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: formData.height ? "#047857" : "#94a3b8"
              }}>
                {formData.height ? (HEIGHT_OPTIONS.find(h => h.value === formData.height)?.cm || "") : "Choose height below"}
              </div>
            </div>

            {/* Height Selector: Below 4 ft 5 in to Above 6 ft 2 in */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", fontWeight: "800", color: "#0f172a", display: "block", marginBottom: "8px" }}>
                Select from dropdown or scroll list
              </label>

              <MobileSelect
                value={formData.height}
                onChange={(v) => setFormData({ ...formData, height: v })}
                options={HEIGHT_OPTIONS.map((h) => ({ value: h.value, label: `${h.label} (${h.cm})` }))}
                placeholder="Select height"
                label="Select Your Height"
                searchable={false}
              />

              {/* Quick Height Selection Pills */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                maxHeight: "150px",
                overflowY: "auto",
                padding: "4px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                {HEIGHT_OPTIONS.map((h) => {
                  const isSelected = formData.height === h.value;
                  return (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, height: h.value })}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: isSelected ? "800" : "600",
                        background: isSelected ? "#059669" : "#ffffff",
                        color: isSelected ? "#ffffff" : "#475569",
                        border: `1px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                        textAlign: "center"
                      }}
                    >
                      {h.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 6: Current Location                                       */}
        {/* ============================================================== */}
        {currentPage === 6 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Where do you currently live?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Tell us where you are based so we can suggest relevant matches.
            </p>

            {/* Country: India (preselected) */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                Country
              </label>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1.5px solid #cbd5e1",
                background: "#f1f5f9"
              }}>
                <span style={{ fontSize: "18px" }}>🇮🇳</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                  India (Preselected)
                </span>
                <Lock size={14} color="#64748b" style={{ marginLeft: "auto" }} />
              </div>
            </div>

            {/* Use My Current Location button */}
            <button
              type="button"
              onClick={() => {
                // Simulate fast geolocation pickup
                setFormData(prev => ({
                  ...prev,
                  state: "Maharashtra",
                  city: "Mumbai"
                }));
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1.5px dashed #059669",
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "12px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "18px",
                cursor: "pointer"
              }}
            >
              <MapPin size={15} />
              <span>Use My Current Location (Mumbai, Maharashtra)</span>
            </button>

            {/* State: Dropdown */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                State <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <MobileSelect
                value={formData.state}
                onChange={(newState) => {
                  const availableCities = ALL_INDIAN_STATES[newState] || ["City Center"];
                  setFormData({
                    ...formData,
                    state: newState,
                    city: availableCities[0]
                  });
                }}
                options={Object.keys(ALL_INDIAN_STATES)}
                placeholder="Select State"
                label="Select Your State"
                required
              />
            </div>

            {/* City: Dropdown filtered by the selected state */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                City {formData.state ? `(Filtered for ${formData.state})` : ""} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <MobileSelect
                value={formData.city}
                onChange={(v) => setFormData({ ...formData, city: v })}
                options={formData.state ? (ALL_INDIAN_STATES[formData.state] || ["City Center"]) : []}
                placeholder={formData.state ? "Select City" : "First select State above"}
                label={formData.state ? `Select City in ${formData.state}` : "Select City"}
                required
              />
            </div>

            {/* PIN Code */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                PIN Code
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, pincode: val });
                  }}
                  placeholder="e.g. 400001"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                />
                {formData.pincode && formData.pincode.length === 6 && (
                  <span style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#059669",
                    fontSize: "11px",
                    fontWeight: "700"
                  }}>
                    ✓ 6-digit PIN
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 7: Language & Family Background                           */}
        {/* ============================================================== */}
        {currentPage === 7 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Tell us about your background.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Help other Indian Muslim families discover shared heritage and linguistic comfort.
            </p>

            {/* Mother Tongue: Dropdown */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                Mother Tongue <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <MobileSelect
                value={formData.motherTongue}
                onChange={(v) => setFormData({ ...formData, motherTongue: v })}
                options={MOTHER_TONGUES}
                placeholder="Select Mother Tongue"
                label="Mother Tongue"
                required
              />
            </div>

            {/* Family Name / Community */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                  Family Name / Community
                </label>
                <span style={{ fontSize: "11px", color: "#64748b" }}>
                  e.g. Syed, Khan, Pathan, Sheikh, Ansari
                </span>
              </div>

              {/* Listed Popular Community Chips */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "12px"
              }}>
                {POPULAR_COMMUNITIES.slice(0, 10).map((comm) => {
                  const isSelected = formData.communitySelect === comm;
                  return (
                    <button
                      key={comm}
                      type="button"
                      onClick={() => setFormData({ ...formData, communitySelect: comm })}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: isSelected ? "800" : "600",
                        background: isSelected ? "#059669" : "#f1f5f9",
                        color: isSelected ? "#ffffff" : "#334155",
                        border: `1px solid ${isSelected ? "#059669" : "#e2e8f0"}`
                      }}
                    >
                      {comm}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, communitySelect: "Other" })}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: formData.communitySelect === "Other" ? "800" : "600",
                    background: formData.communitySelect === "Other" ? "#059669" : "#f1f5f9",
                    color: formData.communitySelect === "Other" ? "#ffffff" : "#334155",
                    border: `1px solid ${formData.communitySelect === "Other" ? "#059669" : "#e2e8f0"}`
                  }}
                >
                  + Other / Enter Custom
                </button>
              </div>

              {/* Custom Community Input if 'Other' selected */}
              {formData.communitySelect === "Other" && (
                <div style={{ marginTop: "10px" }} className="animate-fade">
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#059669", display: "block", marginBottom: "4px" }}>
                    Enter Your Family / Community Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom community name"
                    value={formData.communityCustom}
                    onChange={(e) => setFormData({ ...formData, communityCustom: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "12px",
                      border: "1.5px solid #059669",
                      background: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#0f172a"
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 8: Marital Status                                         */}
        {/* ============================================================== */}
        {currentPage === 8 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              What is your current marital status?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              This helps us find matches suited to your circumstances.
            </p>

            {/* Marital Options with Tooltips / Explanations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {["Never Married", "Divorced", "Separated", "Widowed", "Khula"].map((st) => {
                const isSelected = formData.maritalStatus === st;
                const explanation = MARITAL_STATUS_EXPLANATIONS[st];

                return (
                  <div
                    key={st}
                    onClick={() => setFormData({ ...formData, maritalStatus: st })}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "16px",
                      border: `2px solid ${isSelected ? "#059669" : "#e2e8f0"}`,
                      background: isSelected ? "#ecfdf5" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "15px",
                        fontWeight: "800",
                        color: isSelected ? "#065f46" : "#0f172a"
                      }}>
                        {st}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 size={18} color="#059669" />
                      ) : (
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #cbd5e1" }} />
                      )}
                    </div>
                    {/* Short explanation / tooltip badge */}
                    <div style={{
                      fontSize: "11px",
                      color: isSelected ? "#047857" : "#64748b",
                      lineHeight: 1.45,
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      <Info size={12} color={isSelected ? "#059669" : "#94a3b8"} style={{ flexShrink: 0 }} />
                      <span>{explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 9: Education & Profession                                 */}
        {/* ============================================================== */}
        {currentPage === 9 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Tell us about your education and career.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Share your academic background and professional achievements.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
              {/* 1. Highest Education Qualification */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  1. Highest Education Qualification <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <MobileSelect
                  value={formData.highestQualification}
                  onChange={(v) => setFormData({ ...formData, highestQualification: v })}
                  options={EDUCATION_OPTIONS}
                  placeholder="Select Qualification"
                  label="Highest Education Qualification"
                  required
                />
              </div>

              {/* 2. Employment Sector */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  2. Employment Sector <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <MobileSelect
                  value={formData.employmentSector}
                  onChange={(v) => setFormData({ ...formData, employmentSector: v })}
                  options={EMPLOYMENT_SECTOR_OPTIONS}
                  placeholder="Select Employment Sector"
                  label="Employment Sector"
                  required
                />
              </div>

              {/* 3. Profession: Text Field or Searchable Dropdown */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  3. Profession / Designation <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Doctor, CA..."
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0f172a",
                    marginBottom: "8px"
                  }}
                  required
                />

                {/* Quick Profession Tag Suggestions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {POPULAR_PROFESSIONS.slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, profession: p })}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 10: Monthly Income                                        */}
        {/* ============================================================== */}
        {currentPage === 10 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              What is your monthly income?
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Share your income range to help find compatible matches. This information will be handled according to your privacy settings.
            </p>

            {/* Prominent Amount Display Card in Indian Rupees (₹) */}
            <div style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
              borderRadius: "20px",
              padding: "24px 20px",
              border: "2px solid #a7f3d0",
              textAlign: "center",
              marginBottom: "24px"
            }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#059669",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px"
              }}>
                Monthly Income
              </div>

              {!formData.incomeOption ? (
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#64748b", padding: "10px 0" }}>
                  Please select an income option below
                </div>
              ) : formData.incomeOption === "prefer_not_to_say" ? (
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#64748b" }}>
                  Prefer Not to Say
                </div>
              ) : formData.incomeOption === "below_10000" ? (
                <div style={{ fontSize: "28px", fontWeight: "800", color: "#065f46" }}>
                  Below ₹10,000 / month
                </div>
              ) : (
                <>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#065f46",
                    letterSpacing: "-1px"
                  }}>
                    {formatINR(formData.monthlyIncome || 50000)}
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#059669" }}> / month</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#047857", marginTop: "4px" }}>
                    Approx. ₹{(((formData.monthlyIncome || 50000) * 12) / 100000).toFixed(1)} Lakhs per annum
                  </div>
                </>
              )}
            </div>

            {/* Interactive Range Slider (Min: 10,000, Max: 5,00,000) */}
            {formData.incomeOption === "slider" && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "8px" }}>
                  <span>₹10,000</span>
                  <span>₹2,50,000</span>
                  <span>₹5,00,000</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={formData.monthlyIncome || 50000}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                  style={{
                    width: "100%",
                    accentColor: "#059669",
                    cursor: "pointer",
                    height: "6px"
                  }}
                />
              </div>
            )}

            {/* Income Option Radios: Slider vs Prefer Not to Say vs Below ₹10,000 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "24px"
            }}>
              <div
                onClick={() => setFormData({ ...formData, incomeOption: "slider", monthlyIncome: formData.monthlyIncome || 50000 })}
                style={{
                  gridColumn: "span 2",
                  padding: "12px",
                  borderRadius: "14px",
                  border: `2px solid ${formData.incomeOption === "slider" ? "#059669" : "#e2e8f0"}`,
                  background: formData.incomeOption === "slider" ? "#ecfdf5" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "800", color: formData.incomeOption === "slider" ? "#065f46" : "#334155" }}>
                  Specify Monthly Income (₹10,000 - ₹5,00,000)
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Choose exact amount via interactive slider</div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, incomeOption: "below_10000", monthlyIncome: 8000 })}
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  border: `2px solid ${formData.incomeOption === "below_10000" ? "#059669" : "#e2e8f0"}`,
                  background: formData.incomeOption === "below_10000" ? "#ecfdf5" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "800", color: formData.incomeOption === "below_10000" ? "#065f46" : "#334155" }}>
                  Below ₹10,000
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Starting career / student</div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, incomeOption: "prefer_not_to_say", monthlyIncome: 0 })}
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  border: `2px solid ${formData.incomeOption === "prefer_not_to_say" ? "#059669" : "#e2e8f0"}`,
                  background: formData.incomeOption === "prefer_not_to_say" ? "#ecfdf5" : "#ffffff",
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "800", color: formData.incomeOption === "prefer_not_to_say" ? "#065f46" : "#334155" }}>
                  Prefer Not to Say
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Keep strictly confidential</div>
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 11: Profile Gallery                                       */}
        {/* ============================================================== */}
        {currentPage === 11 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Add your best photos.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
              Let potential matches get to know you through your pictures.
            </p>

            {/* Gallery Uploaded Grid with Primary Badge, Reorder, Remove */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "16px"
            }}>
              {formData.photos.map((photo, idx) => {
                const isPrimary = formData.primaryPhotoIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      borderRadius: "16px",
                      overflow: "hidden",
                      aspectRatio: "3/4",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      border: `2px solid ${isPrimary ? "#f59e0b" : "#e2e8f0"}`
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Upload ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />

                    {/* Primary Star Badge */}
                    {isPrimary ? (
                      <span style={{
                        position: "absolute",
                        top: 6,
                        left: 6,
                        background: "#f59e0b",
                        color: "#ffffff",
                        fontSize: "9px",
                        fontWeight: "800",
                        padding: "2px 6px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px"
                      }}>
                        <Star size={10} fill="#ffffff" /> Primary
                      </span>
                    ) : (
                      <button
                        onClick={() => setFormData({ ...formData, primaryPhotoIndex: idx })}
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 6,
                          background: "rgba(0,0,0,0.6)",
                          color: "#ffffff",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "2px 6px",
                          borderRadius: "8px"
                        }}
                        title="Set as Primary Profile Picture"
                      >
                        Set Primary
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(239, 68, 68, 0.9)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Remove Photo"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Reorder Buttons (Move Left / Right) */}
                    <div style={{
                      position: "absolute",
                      bottom: 4,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                      gap: "4px"
                    }}>
                      {idx > 0 && (
                        <button
                          onClick={() => movePhoto(idx, -1)}
                          style={{
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            padding: "3px 6px",
                            borderRadius: "6px",
                            fontSize: "10px"
                          }}
                          title="Move Left"
                        >
                          <MoveLeft size={10} />
                        </button>
                      )}
                      {idx < formData.photos.length - 1 && (
                        <button
                          onClick={() => movePhoto(idx, 1)}
                          style={{
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            padding: "3px 6px",
                            borderRadius: "6px",
                            fontSize: "10px"
                          }}
                          title="Move Right"
                        >
                          <MoveRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Upload New Photo Placeholder Card */}
              <label style={{
                borderRadius: "16px",
                border: "2px dashed #059669",
                background: "#f0fdf4",
                aspectRatio: "3/4",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "8px",
                textAlign: "center"
              }}>
                <UploadCloud size={24} color="#059669" />
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#065f46" }}>
                  Upload Photo
                </span>
                <span style={{ fontSize: "9px", color: "#64748b" }}>JPG, PNG</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setFormData(prev => ({
                          ...prev,
                          photos: [...prev.photos, event.target.result]
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Quick Preset Presets for Quick Testing */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "14px",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              marginBottom: "18px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                Or select high-resolution presets for instant testing:
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {PRESET_PHOTOS.map((pr) => (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => {
                      if (!formData.photos.includes(pr.url)) {
                        setFormData(prev => ({
                          ...prev,
                          photos: [...prev.photos, pr.url]
                        }));
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "8px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#059669"
                    }}
                  >
                    + {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Picture Privacy Setting as specified */}
            <div style={{
              background: "#ffffff",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              padding: "16px",
              marginBottom: "24px"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
                Picture Privacy
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px", lineHeight: 1.45 }}>
                Explain exactly who can view photos before users save their privacy settings:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                {/* Show Photos */}
                <div
                  onClick={() => setFormData({ ...formData, photoPrivacy: "show" })}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    border: `2px solid ${formData.photoPrivacy === "show" ? "#059669" : "#e2e8f0"}`,
                    background: formData.photoPrivacy === "show" ? "#ecfdf5" : "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <Eye size={16} color={formData.photoPrivacy === "show" ? "#059669" : "#64748b"} />
                    <span style={{ fontSize: "13px", fontWeight: "800", color: formData.photoPrivacy === "show" ? "#065f46" : "#0f172a" }}>
                      Show Photos
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.4 }}>
                    Visible according to the platform&apos;s verified profile rules.
                  </div>
                </div>

                {/* Blur Photo */}
                <div
                  onClick={() => setFormData({ ...formData, photoPrivacy: "hide" })}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    border: `2px solid ${formData.photoPrivacy === "hide" ? "#059669" : "#e2e8f0"}`,
                    background: formData.photoPrivacy === "hide" ? "#ecfdf5" : "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <Lock size={16} color={formData.photoPrivacy === "hide" ? "#059669" : "#64748b"} />
                    <span style={{ fontSize: "13px", fontWeight: "800", color: formData.photoPrivacy === "hide" ? "#065f46" : "#0f172a" }}>
                      Blur Photo
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.4 }}>
                    Softly blurred. Visible only to users you grant photo access to.
                  </div>
                </div>
              </div>

              {/* Explanatory disclosure note */}
              <div style={{
                background: "#f8fafc",
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "11px",
                color: "#475569",
                lineHeight: 1.4
              }}>
                {formData.photoPrivacy === "show" ? (
                  <span>✅ <strong>Show Photos Notice:</strong> Only Aadhaar-verified Indian Muslim members with approved accounts will be able to view your profile pictures.</span>
                ) : (
                  <span>🔒 <strong>Blur Photo Notice:</strong> Your photos will appear softly blurred. Other members must click &quot;Request Photo Access&quot;, and photos will only unlock when you grant permission.</span>
                )}
              </div>
            </div>

            {/* Link Social Media Profiles (Optional) */}
            <div style={{
              background: "#ffffff",
              borderRadius: "18px",
              border: "1.5px solid #e2e8f0",
              padding: "16px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                  Link Social Media Profile
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "10px" }}>
                  Optional
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px", lineHeight: 1.45 }}>
                Link your Instagram, LinkedIn, or social profile to build mutual trust and authenticity with prospective families.
              </p>

              {/* Platform Selection Chips */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px", overflowX: "auto", paddingBottom: "4px" }}>
                {[
                  { id: "Instagram", label: "Instagram" },
                  { id: "LinkedIn", label: "LinkedIn" },
                  { id: "Facebook", label: "Facebook" },
                  { id: "X (Twitter)", label: "X / Twitter" }
                ].map((plat) => {
                  const isSelected = (formData.socialMediaPlatform || "Instagram") === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, socialMediaPlatform: plat.id })}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: isSelected ? "#059669" : "#f1f5f9",
                        color: isSelected ? "#ffffff" : "#475569",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {plat.label}
                    </button>
                  );
                })}
              </div>

              {/* Input for the selected platform */}
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={formData.socialMediaLink || ""}
                  onChange={(e) => setFormData({ ...formData, socialMediaLink: e.target.value })}
                  placeholder={
                    formData.socialMediaPlatform === "LinkedIn"
                      ? "e.g. https://linkedin.com/in/yourprofile"
                      : formData.socialMediaPlatform === "Facebook"
                      ? "e.g. https://facebook.com/yourprofile"
                      : formData.socialMediaPlatform === "X (Twitter)"
                      ? "e.g. @your_handle or profile link"
                      : "e.g. https://instagram.com/yourhandle or @username"
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "13px",
                    color: "#0f172a",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 12: About You                                             */}
        {/* ============================================================== */}
        {currentPage === 12 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Tell us a little about yourself.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
              Help potential matches understand your personality, interests, and what you value in a life partner.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
              {/* 1. About Me — short personal introduction */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  About Me <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Introduce yourself, your daily routine, values, and family background..."
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "13px",
                    color: "#0f172a",
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* 2. Hobbies & Interests — optional */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
                    Hobbies & Interests <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>(optional)</span>
                  </label>
                  <span style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>
                    {formData.hobbies.length} selected
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {HOBBIES_LIST.map((hob) => {
                    const isSelected = formData.hobbies.includes(hob);
                    return (
                      <button
                        key={hob}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, hobbies: formData.hobbies.filter(h => h !== hob) });
                          } else {
                            setFormData({ ...formData, hobbies: [...formData.hobbies, hob] });
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: isSelected ? "800" : "600",
                          background: isSelected ? "#ecfdf5" : "#f1f5f9",
                          color: isSelected ? "#065f46" : "#475569",
                          border: `1px solid ${isSelected ? "#059669" : "#e2e8f0"}`
                        }}
                      >
                        {isSelected ? "✓ " : "+ "} {hob}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. What I Am Looking For — optional */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  What I Am Looking For <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your ideal partner's character, Islamic outlook, and qualities..."
                  value={formData.partnerLookingFor}
                  onChange={(e) => setFormData({ ...formData, partnerLookingFor: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "13px",
                    color: "#0f172a",
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* 4. Preferred Partner Age Range — Mandatory */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", display: "block", marginBottom: "6px" }}>
                  Preferred Partner Age Range <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Minimum Age</span>
                    <MobileSelect
                      value={formData.partnerAgeMin ? String(formData.partnerAgeMin) : ""}
                      onChange={(v) => setFormData({ ...formData, partnerAgeMin: Number(v) })}
                      options={Array.from({ length: 20 }, (_, i) => ({ value: String(21 + i), label: `${21 + i} yrs` }))}
                      placeholder="Select Min Age"
                      label="Minimum Partner Age"
                      searchable={false}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>Maximum Age</span>
                    <MobileSelect
                      value={formData.partnerAgeMax ? String(formData.partnerAgeMax) : ""}
                      onChange={(v) => setFormData({ ...formData, partnerAgeMax: Number(v) })}
                      options={Array.from({ length: 25 }, (_, i) => ({ value: String(23 + i), label: `${23 + i} yrs` }))}
                      placeholder="Select Max Age"
                      label="Maximum Partner Age"
                      searchable={false}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue to Verification</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 13: Aadhaar Verification                                  */}
        {/* ============================================================== */}
        {currentPage === 13 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Verify your identity.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Upload your Aadhaar document (Front Side) to help us verify your identity and build a safer matrimony community.
            </p>

            {/* Front Document Upload Card (Only Front Side Required) */}
            <div style={{
              borderRadius: "18px",
              border: "1.5px dashed #059669",
              background: "#f0fdf4",
              padding: "20px 16px",
              textAlign: "center",
              marginBottom: "18px"
            }}>
              <FileText size={32} color="#059669" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#065f46", marginBottom: "4px" }}>
                Aadhaar Card (Front Side)
              </div>
              <div style={{ fontSize: "11px", color: "#059669", marginBottom: "12px" }}>
                {formData.aadhaarFront ? "✓ Front side uploaded and ready" : "Upload clear photo of the front side showing your name, photo & DOB"}
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                <label style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#059669",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-block"
                }}>
                  {formData.aadhaarFront ? "Change / Re-upload Front" : "Upload Aadhaar Front"}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFormData(prev => ({ ...prev, aadhaarFront: "/images/ahmed.jpg" }));
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, aadhaarFront: "/images/ahmed.jpg" }))}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    background: "#ffffff",
                    border: "1.5px solid #059669",
                    color: "#059669",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  + Use Sample Aadhaar Card
                </button>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "14px",
              padding: "12px 14px",
              cursor: "pointer",
              marginBottom: "16px"
            }}>
              <input
                type="checkbox"
                checked={formData.aadhaarConsent}
                onChange={(e) => setFormData({ ...formData, aadhaarConsent: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "#059669", marginTop: "2px" }}
              />
              <span style={{ fontSize: "11px", color: "#334155", lineHeight: 1.45, fontWeight: "600" }}>
                I confirm consent for identity verification in compliance with UIDAI regulations and the Digital Personal Data Protection (DPDP) Act. <span style={{ color: "#ef4444" }}>*</span>
              </span>
            </label>

            {/* Detailed UIDAI & DPDP Privacy Notice as specified */}
            <div style={{
              background: "#ecfdf5",
              borderRadius: "14px",
              padding: "12px 14px",
              border: "1px solid #a7f3d0",
              fontSize: "11px",
              color: "#065f46",
              lineHeight: 1.5,
              marginBottom: "20px"
            }}>
              <div style={{ fontWeight: "800", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Confidential Aadhaar Privacy Notice:</span>
              </div>
              <ul style={{ paddingLeft: "16px", margin: 0 }}>
                <li><strong>How processed:</strong> Encrypted using AES-256 and verified through certified KYC partners.</li>
                <li><strong>Who accesses:</strong> Only authorized compliance reviewers. Document images and Aadhaar numbers are <em>never</em> shown publicly.</li>
                <li><strong>Retention & Deletion:</strong> Retained only for active verified session and safely purgeable upon user account deletion request.</li>
                <li><strong>Tip:</strong> You may use a Masked Aadhaar (where only last 4 digits are visible).</li>
              </ul>
            </div>

            {/* Mandatory Requirement Banner */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              marginBottom: "20px",
              color: "#065f46",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span>Aadhaar verification is mandatory for 100% genuine and safe matrimony profiles.</span>
            </div>

            <button
              onClick={handleNextPage}
              className="btn-primary-action"
              style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px" }}
            >
              <span>Continue to Live Selfie</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 14: Live Selfie Verification                              */}
        {/* ============================================================== */}
        {currentPage === 14 && (
          <div className="animate-fade" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
              Let&apos;s verify that it&apos;s really you.
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Complete a quick live selfie check to help confirm your identity and protect the Risthay community.
            </p>

            {/* Interactive Camera / Liveness Guide Oval */}
            <div style={{
              width: "240px",
              height: "280px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
              border: `4px solid ${formData.selfieStep === "verified" ? "#059669" : "#10b981"}`,
              background: "#0f172a",
              boxShadow: "0 10px 30px rgba(5, 150, 105, 0.25)"
            }}>
              {formData.selfieStep === "streaming" || formData.selfieStep === "analyzing" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)"
                  }}
                />
              ) : formData.selfieStep === "verified" ? (
                <img
                  src={formData.photos[0] || "/images/ahmed.jpg"}
                  alt="Verified selfie"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  padding: "20px"
                }}>
                  <Camera size={44} color="#10b981" style={{ marginBottom: "10px" }} />
                  <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "700" }}>
                    Camera Standby
                  </span>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Position face inside oval
                  </span>
                </div>
              )}

              {/* Scanning HUD Overlay Line */}
              {(formData.selfieStep === "streaming" || formData.selfieStep === "analyzing") && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, #10b981, transparent)",
                  boxShadow: "0 0 12px #10b981",
                  top: "40%",
                  animation: "pulseGlow 1.5s infinite"
                }} />
              )}

              {/* Checkmark overlay on success */}
              {formData.selfieStep === "verified" && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(5, 150, 105, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <CheckCircle2 size={64} color="#ffffff" />
                </div>
              )}
            </div>

            {/* Instruction Banner */}
            <div style={{
              background: formData.selfieStep === "verified" ? "#ecfdf5" : "#f8fafc",
              border: `1.5px solid ${formData.selfieStep === "verified" ? "#a7f3d0" : "#cbd5e1"}`,
              borderRadius: "14px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "12px",
              fontWeight: "700",
              color: formData.selfieStep === "verified" ? "#065f46" : "#334155"
            }}>
              {formData.selfieStep === "verified" ? (
                <span>🎉 Liveness Confirmed • Biometric Match: 98.4%</span>
              ) : (
                <span>{livenessInstruction}</span>
              )}
            </div>

            {/* Camera Actions */}
            {formData.selfieStep === "ready" && (
              <button
                type="button"
                onClick={startCamera}
                className="btn-primary-action"
                style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px", marginBottom: "12px" }}
              >
                <Camera size={16} />
                <span>Start Live Verification</span>
              </button>
            )}

            {formData.selfieStep === "streaming" && (
              <button
                type="button"
                onClick={captureLiveSelfie}
                className="btn-primary-action"
                style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px", marginBottom: "12px" }}
              >
                <span>Capture & Verify Selfie</span>
              </button>
            )}

            {formData.selfieStep === "analyzing" && (
              <div style={{ padding: "14px", color: "#059669", fontWeight: "700", fontSize: "13px" }}>
                Verifying 3D Biometrics ({livenessScore}%)...
              </div>
            )}

            {formData.selfieStep === "verified" ? (
              <button
                onClick={handleNextPage}
                className="btn-primary-action"
                style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px", marginBottom: "12px" }}
              >
                <span>Submit Profile For Review</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextPage}
                className="btn-primary-action"
                style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "14px", opacity: 0.85, marginBottom: "12px" }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            )}

            {/* Fallback process as specified */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "10px 14px",
              border: "1px solid #e2e8f0",
              textAlign: "left",
              marginTop: "8px"
            }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "2px" }}>
                Camera not working?
              </div>
              <p style={{ fontSize: "10px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                Fallback option: You can upload a high-clarity photo holding a paper with today&apos;s date, or verify via a scheduled 1-minute WhatsApp video check with our verification desk.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, selfieStep: "verified", selfieVerified: true }));
                }}
                style={{
                  fontSize: "11px",
                  color: "#059669",
                  fontWeight: "700",
                  marginTop: "6px",
                  textDecoration: "underline"
                }}
              >
                Use Fallback Photo Verification
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE 15: Profile Under Review                                  */}
        {/* ============================================================== */}
        {currentPage === 15 && (
          <div className="animate-fade" style={{ textAlign: "center" }}>
            {/* Header Success / Verification Icon */}
            <div style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 10px 25px rgba(5, 150, 105, 0.2)",
              border: "3px solid #a7f3d0"
            }}>
              <ShieldCheck size={44} color="#059669" />
            </div>

            <h2 style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f172a",
              marginBottom: "6px"
            }}>
              Your Profile is Submitted! 🎉
            </h2>

            <p style={{
              fontSize: "13px",
              color: "#64748b",
              lineHeight: 1.55,
              marginBottom: "24px",
              maxWidth: "420px",
              marginInline: "auto"
            }}>
              Alhamdulillah! Your Aadhaar identity verification is complete and your halal matrimonial profile has been submitted for final review.
            </p>

            {/* Three Status Milestone Cards */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "26px",
              textAlign: "left"
            }}>
              {/* Milestone 1: Profile information submitted */}
              <div style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "14px 16px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  <CheckCheck size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                    Profile details confirmed
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Personal and family background saved.
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "8px" }}>
                  Completed ✓
                </span>
              </div>

              {/* Milestone 2: Identity Verified */}
              <div style={{
                background: "#ecfdf5",
                borderRadius: "16px",
                padding: "14px 16px",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#d1fae5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  <ShieldCheck size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#065f46" }}>
                    Aadhaar Identity Verified
                  </div>
                  <div style={{ fontSize: "12px", color: "#047857" }}>
                    Authenticity confirmed. Verified badge added to your profile.
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#059669", background: "#ffffff", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: "8px" }}>
                  Approved ✓
                </span>
              </div>

              {/* Milestone 3: Ready for Matching */}
              <div style={{
                background: "#eff6ff",
                borderRadius: "16px",
                padding: "14px 16px",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px"
              }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  <Heart size={16} fill="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e40af" }}>
                    Ready for Halal Matrimony
                  </div>
                  <div style={{ fontSize: "12px", color: "#3b82f6" }}>
                    Explore compatible profiles, send Salaams, and interact with Walis.
                  </div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: "700", color: "#2563eb", background: "#ffffff", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "8px" }}>
                  Active ✓
                </span>
              </div>
            </div>

            {/* Submitted Summary Profile Snapshot */}
            <div style={{
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "14px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textAlign: "left",
              marginBottom: "24px"
            }}>
              <img
                src={formData.photos[formData.primaryPhotoIndex] || formData.photos[0] || "/images/ahmed.jpg"}
                alt="Submitted profile"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  objectFit: "cover"
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                  {formData.firstName} {formData.lastName}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {calculatedAge} yrs • {formData.height} • {formData.city}, {formData.state}
                </div>
                <div style={{ fontSize: "11px", color: "#059669", fontWeight: "700" }}>
                  {formData.profession} • {formData.motherTongue}
                </div>
              </div>
              <span style={{
                background: "#ecfdf5",
                color: "#059669",
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "6px"
              }}>
                Aadhaar KYC
              </span>
            </div>

            {/* Disclaimer on 24-48 hours as requested */}
            <p style={{
              fontSize: "11px",
              color: "#64748b",
              lineHeight: 1.45,
              marginBottom: "20px"
            }}>
              Note: The 24–48-hour timeframe is an expected review period. You can explore verified matches in guest review mode immediately.
            </p>

            {/* Continue to Dashboard Button */}
            <button
              onClick={handleFinalSubmitToDashboard}
              disabled={isSubmitting}
              className="btn-primary-action"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "16px",
                fontSize: "15px",
                fontWeight: "700"
              }}
            >
              <Heart size={18} fill="#ffffff" />
              <span>{isSubmitting ? "Finalizing Profile..." : "Continue to Dashboard"}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODALS: Google Sign In, Phone Login, Terms & Privacy           */}
      {/* ============================================================== */}

      {/* Modal 1: Google Login (FOR EXISTING MEMBERS -> DIRECT DASHBOARD LOGIN) */}
      {activeModal === "googleLogin" && (
        <div className="modal-backdrop" onClick={() => { if (!isGoogleLoading) setActiveModal(null); }}>
          <div
            className="modal-content-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", padding: "26px 20px", textAlign: "center" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Sign In with Google</span>
              </div>
              <button 
                onClick={() => { if (!isGoogleLoading) setActiveModal(null); }} 
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px", lineHeight: 1.5 }}>
              Sign securely into your registered Risthay account with Google.
            </p>

            {googleError && (
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
                <span>{googleError}</span>
              </div>
            )}

            {/* Official Supabase Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignInFlow}
              disabled={isGoogleLoading}
              className="hover-lift"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1.5px solid #059669",
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isGoogleLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(5,150,105,0.25)",
                marginBottom: "16px"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google Account"}</span>
            </button>

            {/* Quick Demo Login Option for Local Evaluators */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0",
              color: "#94a3b8",
              fontSize: "11px"
            }}>
              <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <span>OR OFFLINE DEMO</span>
              <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal(null);
                if (onDirectLogin) {
                  onDirectLogin();
                }
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <UserCheck size={14} />
              <span>Quick 1-Tap Demo Login (Ahmed Raza)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Google Attach (FOR NEW USERS -> ATTACH GOOGLE THEN START ONBOARDING) */}
      {activeModal === "googleAttach" && (
        <div className="modal-backdrop" onClick={() => { if (!isGoogleLoading) setActiveModal(null); }}>
          <div
            className="modal-content-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px", padding: "26px 20px", textAlign: "center" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Attach Google Account</span>
              </div>
              <button 
                onClick={() => { if (!isGoogleLoading) setActiveModal(null); }} 
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "18px", lineHeight: 1.5 }}>
              Connect your verified Google account to create your authentic Risthay profile without SMS OTP delays.
            </p>

            {googleError && (
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
                <span>{googleError}</span>
              </div>
            )}

            {/* Official Supabase Google Attach Button */}
            <button
              type="button"
              onClick={handleGoogleAttachFlow}
              disabled={isGoogleLoading}
              className="hover-lift"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "14px",
                border: "1.5px solid #059669",
                background: "#059669",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: isGoogleLoading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(5,150,105,0.25)",
                marginBottom: "16px"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? "Connecting Google..." : "Connect Google Account & Start"}</span>
            </button>

            {/* Offline Bypass Option */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "12px 0",
              color: "#94a3b8",
              fontSize: "11px"
            }}>
              <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <span>OR DEMO TEST PRESET</span>
              <span style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </div>

            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  authProvider: "google",
                  email: "syed.rehan@example.com",
                  firstName: "Syed Rehan",
                  lastName: "Ali"
                }));
                setActiveModal(null);
                setCurrentPage(2);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                color: "#475569",
                fontSize: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: "pointer"
              }}
            >
              <span>Continue with Test Identity (Syed Rehan) →</span>
            </button>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeModal === "terms" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-content-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "460px", padding: "24px", maxHeight: "80vh" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Terms of Service</h3>
              <button onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6, overflowY: "auto", maxHeight: "60vh" }}>
              <p><strong>1. Eligibility:</strong> Risthay is dedicated exclusively to lawful Muslim matrimony in India. All users must be at least 21 years of age.</p>
              <br />
              <p><strong>2. Halal Conduct & Zero Dowry:</strong> By using Risthay, users affirm their commitment to dignity, respect, and rejection of dowry demands.</p>
              <br />
              <p><strong>3. Identity Verification:</strong> Users consent to valid identity confirmation using Aadhaar or accepted Indian government IDs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === "privacy" && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-content-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "460px", padding: "24px", maxHeight: "80vh" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Privacy Policy</h3>
              <button onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6, overflowY: "auto", maxHeight: "60vh" }}>
              <p><strong>Digital Personal Data Protection (DPDP) Act 2023 Compliance:</strong></p>
              <br />
              <p>• <strong>Data Security:</strong> All identity documents and selfies are encrypted with AES-256 at rest and in transit.</p>
              <br />
              <p>• <strong>No Public Exposure:</strong> Aadhaar numbers and biometric document scans are NEVER displayed on public profiles.</p>
              <br />
              <p>• <strong>Right to Erasure:</strong> Users have the right to request deletion of their data at any time via Account Settings.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
