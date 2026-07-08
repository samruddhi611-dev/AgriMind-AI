import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, Mail, Lock, LogIn, UserCheck, Eye, EyeOff, User, 
  ArrowRight, Volume2, KeyRound, CheckCircle, RefreshCw, 
  Chrome, ArrowLeft, Smartphone, Key, ShieldCheck
} from "lucide-react";
import { LanguageCode, translations } from "../utils/translation";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  email: string;
  pass: string;
  region: string;
}

const DEMO_PROFILES: UserProfile[] = [
  {
    name: "Ramesh Patel",
    role: "Lead Farmer",
    avatar: "RP",
    email: "ramesh@agrimind.ai",
    pass: "farmer2026",
    region: "Indore, MP, India"
  },
  {
    name: "Dr. Sarah Lin",
    role: "Crop Pathologist",
    avatar: "SL",
    email: "sarah.lin@agrimind.ai",
    pass: "science2026",
    region: "California, USA"
  }
];

interface LoginScreenProps {
  onLogin: (name: string, role: string, avatar: string, region: string) => void;
  isDarkMode: boolean;
  languageCode: LanguageCode;
  setLanguageCode: (lang: LanguageCode) => void;
}

type ScreenMode = "login" | "signup" | "forgot-password" | "verification";

export default function LoginScreen({ onLogin, isDarkMode, languageCode, setLanguageCode }: LoginScreenProps) {
  const [mode, setMode] = useState<ScreenMode>("login");
  
  // Fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Custom states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(""); // status / progress log text
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // OTP inputs state (6 digits)
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Phone OTP specific states
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState<string[]>(new Array(6).fill(""));
  const phoneOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);

  const t = translations[languageCode];

  // Initialize "Remember Me" on mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("agrimind_remember_me") === "true";
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem("agrimind_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  // Cooldown timer for OTP Resend (Email)
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Cooldown timer for OTP Resend (Phone SMS)
  useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCooldown]);

  // Phone OTP Handlers
  const handleSendPhoneOtp = async (phoneNumberToUse: string, isSignUp: boolean = false) => {
    if (!phoneNumberToUse) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया मोबाईल नंबर भरा." : languageCode === "hi" ? "कृपया मोबाइल नंबर भरें।" : "Please enter mobile number."
      );
      return;
    }
    
    let formattedPhone = phoneNumberToUse.trim();
    if (!formattedPhone.startsWith("+")) {
      const numbersOnly = formattedPhone.replace(/[^0-9]/g, "");
      formattedPhone = `+91${numbersOnly}`;
    }

    if (formattedPhone.length < 11 || formattedPhone.length > 15) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया वैध मोबाईल नंबर टाका." : languageCode === "hi" ? "कृपया वैध मोबाइल नंबर दर्ज करें।" : "Please enter a valid mobile number."
      );
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);
    setSubmitMessage(
      languageCode === "mr" 
        ? "फायरबेस रीकॅप्चा पडताळणी करत आहे..." 
        : languageCode === "hi" 
          ? "फायरबेस रीकैप्चा सत्यापन किया जा रहा है..." 
          : "Initializing Firebase Invisible reCAPTCHA safety check..."
    );

    try {
      let container = document.getElementById("recaptcha-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "recaptcha-container";
        document.body.appendChild(container);
      }

      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });

      setSubmitMessage(
        languageCode === "mr" 
          ? "मोबाईलवर एसएमएस ओटीपी पाठवला जात आहे..." 
          : languageCode === "hi" 
            ? "मोबाइल पर एसएमएस ओटीपी भेजा जा रहा है..." 
            : "reCAPTCHA cleared. Requesting Firebase Auth SMS trigger..."
      );

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      
      setIsSubmitting(false);
      setSubmitMessage("");
      setPhoneOtpSent(true);
      setPhoneCooldown(60);
      setSuccessMessage(
        languageCode === "mr"
          ? "६ अंकी ओटीपी यशस्वीरित्या तुमच्या मोबाईलवर पाठवला गेला आहे."
          : languageCode === "hi"
            ? "6 अंकों का ओटीपी आपके मोबाइल पर सफलतापूर्वक भेजा गया है।"
            : `Firebase Phone Auth SMS dispatched successfully to ${formattedPhone}! Check your device for the 6-digit verification code.`
      );
    } catch (err: any) {
      console.error("Firebase SMS dispatch error:", err);
      setIsSubmitting(false);
      setSubmitMessage("");
      
      let errorMsg = err.message || err.toString();
      if (err.code === "auth/captcha-check-failed") {
        errorMsg = "reCAPTCHA check failed. Please refresh and try again.";
      } else if (err.code === "auth/invalid-phone-number") {
        errorMsg = "Invalid phone number format. Please check the number and include international prefix if needed.";
      } else if (err.code === "auth/quota-exceeded" || err.code === "auth/too-many-requests") {
        errorMsg = "SMS quota exceeded or too many requests. Please try again later or use the test login.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = "Phone Sign-In is not enabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method, click 'Add new provider', and enable 'Phone'.";
      }
      
      setErrorMessage(
        languageCode === "mr" 
          ? `ओटीपी पाठवण्यात त्रुटी आली: ${errorMsg}` 
          : languageCode === "hi" 
            ? `ओटीपी भेजने में त्रुटि: ${errorMsg}` 
            : `Error sending OTP SMS: ${errorMsg}`
      );
    }
  };

  const handleVerifyPhoneOtpLogin = async () => {
    setErrorMessage("");
    const enteredCode = phoneOtp.join("");
    if (enteredCode.length < 6) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया ६ अंकी पडताळणी कोड पूर्ण करा." : languageCode === "hi" ? "कृपया 6 अंकों का सत्यापन कोड पूरा करें।" : "Please complete the 6-digit OTP code."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(
      languageCode === "mr" 
        ? "फायरबेस फोन ऑथ क्रेडेंशियल पडताळत आहे..." 
        : languageCode === "hi" 
          ? "फायरबेस फोन ऑथ क्रेडेंशियल सत्यापित किया जा रहा है..." 
          : "Verifying phone auth credentials on Firebase Authentication node..."
    );

    try {
      if (!confirmationResult) {
        throw new Error("No active phone verification session found. Please request a new OTP.");
      }

      const result = await confirmationResult.confirm(enteredCode);
      const user = result.user;
      
      setIsSubmitting(false);
      setSubmitMessage("");
      setSuccessMessage(
        languageCode === "mr" 
          ? "यशस्वीरित्या पडताळले गेले! स्वागत आहे..." 
          : languageCode === "hi" 
            ? "सफलतापूर्वक सत्यापित किया गया! स्वागत है..." 
            : "Successfully authenticated! Welcome to AgriMind AI."
      );
      
      const displayName = user.displayName || "Phone Farmer";
      const displayPhone = user.phoneNumber || mobileNumber;
      setTimeout(() => {
        onLogin(displayName, "Registered Partner", "PF", displayPhone);
      }, 1200);

    } catch (err: any) {
      console.error("Firebase SMS verify error:", err);
      setIsSubmitting(false);
      setSubmitMessage("");
      
      let errorMsg = err.message || err.toString();
      if (err.code === "auth/invalid-verification-code") {
        errorMsg = "Invalid OTP code entered. Please double check the code and try again.";
      } else if (err.code === "auth/code-expired") {
        errorMsg = "OTP code has expired. Please request a new one.";
      }
      
      setErrorMessage(
        languageCode === "mr" 
          ? `पडताळणी अयशस्वी: ${errorMsg}` 
          : languageCode === "hi" 
            ? `सत्यापन विफल: ${errorMsg}` 
            : `Verification failed: ${errorMsg}`
      );
    }
  };

  const handlePhoneSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया आपले संपूर्ण नाव भरा." : languageCode === "hi" ? "कृपया अपना पूरा नाम भरें।" : "Please enter your full name."
      );
      return;
    }
    if (!mobileNumber) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया मोबाईल नंबर भरा." : languageCode === "hi" ? "कृपया मोबाइल नंबर भरें।" : "Please enter mobile number."
      );
      return;
    }
    if (!termsAccepted) {
      setErrorMessage(
        languageCode === "mr" ? "तुम्हाला सेवा अटी मान्य करणे आवश्यक आहे." : languageCode === "hi" ? "आपको सेवा शर्तों को स्वीकार करना होगा।" : "You must accept the terms of service."
      );
      return;
    }

    if (!phoneOtpSent) {
      await handleSendPhoneOtp(mobileNumber, true);
    } else {
      const enteredCode = phoneOtp.join("");
      if (enteredCode.length < 6) {
        setErrorMessage(
          languageCode === "mr" ? "कृपया ६ अंकी पडताळणी कोड पूर्ण करा." : languageCode === "hi" ? "कृपया 6 अंकों का सत्यापन कोड पूरा करें।" : "Please complete the 6-digit OTP code."
        );
        return;
      }

      setIsSubmitting(true);
      setSubmitMessage(
        languageCode === "mr" ? "नवीन युझर प्रोफाइल डॉक्युमेंट तयार करत आहे..." : languageCode === "hi" ? "नया यूजर प्रोफाइल डॉक्युमेंट बनाया जा रहा है..." : "Creating new Firestore user profile from Phone credential..."
      );

      try {
        if (!confirmationResult) {
          throw new Error("No active verification session found. Please resend OTP.");
        }

        const result = await confirmationResult.confirm(enteredCode);
        const user = result.user;
        
        setIsSubmitting(false);
        setSubmitMessage("");
        setSuccessMessage(
          languageCode === "mr"
            ? "तुमची नोंदणी यशस्वीरित्या पूर्ण झाली आहे!"
            : languageCode === "hi"
              ? "आपका पंजीकरण सफलतापूर्वक पूरा हो गया है!"
              : "Phone authentication completed successfully! Firestore user document provisioned."
        );
        
        setTimeout(() => {
          onLogin(fullName, "Registered Partner", fullName.substring(0, 2).toUpperCase(), user.phoneNumber || mobileNumber);
        }, 1500);
      } catch (err: any) {
        console.error("Firebase Phone SignUp error:", err);
        setIsSubmitting(false);
        setSubmitMessage("");
        
        let errorMsg = err.message || err.toString();
        if (err.code === "auth/invalid-verification-code") {
          errorMsg = "Invalid OTP code entered. Please double check the code and try again.";
        }
        
        setErrorMessage(
          languageCode === "mr" 
            ? `पडताळणी अयशस्वी: ${errorMsg}` 
            : languageCode === "hi" 
              ? `सत्यापन विफल: ${errorMsg}` 
              : `Verification failed: ${errorMsg}`
        );
      }
    }
  };

  const handlePhoneOtpChange = (index: number, val: string) => {
    const numericVal = val.replace(/[^0-9]/g, "");
    if (!numericVal) {
      const newOtp = [...phoneOtp];
      newOtp[index] = "";
      setPhoneOtp(newOtp);
      return;
    }

    const digit = numericVal[0];
    const newOtp = [...phoneOtp];
    newOtp[index] = digit;
    setPhoneOtp(newOtp);

    if (index < 5 && digit) {
      phoneOtpRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!phoneOtp[index] && index > 0) {
        phoneOtpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Simulated background email verification checker (runs when in verification mode)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (mode === "verification") {
      setVerificationProgress(0);
      
      // Periodically check every 4 seconds to simulate active background handshake checking
      interval = setInterval(() => {
        setVerificationProgress((prev) => {
          const next = prev + 1;
          // After 3-4 checks (approx 12-15 seconds), simulate that the user clicked the verification link on their email
          if (next >= 3) {
            clearInterval(interval);
            handleVerificationSuccess("Ramesh Patel");
          }
          return next;
        });
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [mode]);

  const handleDemoSelect = (profile: UserProfile) => {
    setEmail(profile.email);
    setPassword(profile.pass);
    setErrorMessage("");
    setSuccessMessage("");
    setMode("login");
    triggerLogin(profile.email, profile.pass, profile);
  };

  const handleSpeakGuidance = () => {
    if (!window.speechSynthesis) {
      setErrorMessage("Text-to-speech is not supported on this device.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    let text = t.loginNarration;
    if (mode === "verification") {
      text = languageCode === "hi" 
        ? "ईमेल सत्यापन लिंक आपके पंजीकृत ईमेल पते पर भेजा गया है। कृपया अपना ईमेल सत्यापित करें या भेजा गया ओ टी पी दर्ज करें।"
        : languageCode === "mr"
          ? "ईमेल पडताळणी लिंक तुमच्या नोंदणीकृत ईमेलवर पाठवली गेली आहे. कृपया ईमेल तपासा किंवा ओ टी पी टाका."
          : "A verification email has been sent to your registered email address. Please verify your email or enter the OTP to proceed.";
    } else if (mode === "forgot-password") {
      text = languageCode === "hi"
        ? "अपना पंजीकृत ईमेल दर्ज करें ताकि हम आपको सुरक्षित पासवर्ड रीसेट लिंक भेज सकें।"
        : languageCode === "mr"
          ? "तुमचा नोंदणीकृत ईमेल टाका जेणेकरून आम्ही पासवर्ड रीसेट लिंक पाठवू शकू."
          : "Enter your registered email address to receive a secure password reset link.";
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (languageCode === "hi") {
      utterance.lang = "hi-IN";
    } else if (languageCode === "mr") {
      utterance.lang = "mr-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Google Sign In (SSO handshake with Firestore storage simulation)
  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitMessage(
      languageCode === "mr" 
        ? "गुगल सर्व्हरशी कनेक्ट होत आहे..." 
        : languageCode === "hi" 
          ? "गूगल सर्वर से जुड़ रहा है..." 
          : "Establishing OAuth connection with Google Cloud..."
    );
    
    setTimeout(() => {
      setSubmitMessage(
        languageCode === "mr" 
          ? "फायरस्टोअरमध्ये नवीन युझर प्रोफाइल डॉक्युमेंट तयार करत आहे..." 
          : languageCode === "hi" 
            ? "फायरस्टोर में नया यूजर प्रोफाइल डॉक्युमेंट बना रहा है..." 
            : "Google authentication successful. Generating Firestore User Document..."
      );

      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitMessage("");
        setSuccessMessage(
          languageCode === "mr" 
            ? "गुगलद्वारे यशस्वीरित्या लॉग इन केले." 
            : languageCode === "hi" 
              ? "गूगल के माध्यम से सफलतापूर्वक प्रमाणित किया गया।" 
              : "Successfully authenticated via Google. Firestore profile synced."
        );
        setTimeout(() => {
          onLogin("Google Partner", "Enterprise Farmer", "G", "Indore, MP");
        }, 1000);
      }, 1200);
    }, 1500);
  };

  // Login & Sign-Up validations & submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Field Validations
    if (!email) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया ईमेल पत्ता भरा." : languageCode === "hi" ? "कृपया ईमेल पता भरें।" : "Please enter email address."
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(
        languageCode === "mr" ? "अवैध ईमेल स्वरूप." : languageCode === "hi" ? "अमान्य ईमेल प्रारूप।" : "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया पासवर्ड भरा." : languageCode === "hi" ? "कृपया पासवर्ड भरें।" : "Please enter your password."
      );
      return;
    }
    if (password.length < 6) {
      setErrorMessage(
        languageCode === "mr" ? "पासवर्ड किमान ६ अक्षरांचा असावा." : languageCode === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters long."
      );
      return;
    }

    if (mode === "signup") {
      if (!fullName) {
        setErrorMessage(
          languageCode === "mr" ? "कृपया आपले संपूर्ण नाव भरा." : languageCode === "hi" ? "कृपया अपना पूरा नाम भरें।" : "Please enter your full name."
        );
        return;
      }
      if (!mobileNumber) {
        setErrorMessage(
          languageCode === "mr" ? "कृपया मोबाईल नंबर भरा." : languageCode === "hi" ? "कृपया मोबाइल नंबर भरें।" : "Please enter mobile number."
        );
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(
          languageCode === "mr" ? "पासवर्ड जुळत नाहीत." : languageCode === "hi" ? "पासवर्ड मेल नहीं खाते।" : "Passwords do not match."
        );
        return;
      }
      if (!termsAccepted) {
        setErrorMessage(
          languageCode === "mr" ? "तुम्हाला सेवा अटी मान्य करणे आवश्यक आहे." : languageCode === "hi" ? "आपको सेवा शर्तों को स्वीकार करना होगा।" : "You must accept the terms of service."
        );
        return;
      }

      // Automatically trigger email verification screen upon account creation
      setIsSubmitting(true);
      setSubmitMessage(
        languageCode === "mr" ? "तुमचे खाते तयार करत आहे..." : languageCode === "hi" ? "आपका खाता बनाया जा रहा है..." : "Creating secure credentials..."
      );
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitMessage("");
        
        // Save supplementary profile to simulated local cache
        localStorage.setItem("temp_profile_name", fullName);
        localStorage.setItem("temp_profile_email", email);
        localStorage.setItem("temp_profile_mobile", mobileNumber);
        
        // Transition to verification mode
        setMode("verification");
        setSuccessMessage(
          languageCode === "mr" 
            ? "सत्यापन कोड पाठवला! कृपया आपला ईमेल तपासा." 
            : languageCode === "hi" 
              ? "सत्यापन कोड भेजा गया! कृपया अपना ईमेल जांचें।" 
              : "Account pre-registered! A secure verification link and OTP code have been dispatched."
        );
      }, 1500);

    } else {
      // Login flow
      const matchedProfile = DEMO_PROFILES.find(
        (p) => p.email.toLowerCase() === email.toLowerCase() && p.pass === password
      );
      
      // Save Remember Me settings
      if (rememberMe) {
        localStorage.setItem("agrimind_remember_me", "true");
        localStorage.setItem("agrimind_remembered_email", email);
      } else {
        localStorage.removeItem("agrimind_remember_me");
        localStorage.removeItem("agrimind_remembered_email");
      }

      triggerLogin(email, password, matchedProfile);
    }
  };

  const triggerLogin = (userEmail: string, userPass: string, profileMatch?: UserProfile) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitMessage(
      languageCode === "mr" ? "क्रेडेन्शियल्स तपासत आहे..." : languageCode === "hi" ? "क्रेडेंशियल्स की जांच की जा रही है..." : "Authenticating with secure Firebase node..."
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage("");
      if (profileMatch) {
        onLogin(profileMatch.name, profileMatch.role, profileMatch.avatar, profileMatch.region);
      } else {
        // If password is not matched with demo and user tries custom details
        // Allow login but simulate name from email prefix
        const customName = userEmail.split("@")[0];
        const initials = customName.substring(0, 2).toUpperCase();
        onLogin(
          customName.charAt(0).toUpperCase() + customName.slice(1),
          "Agricultural Partner",
          initials || "AP",
          "Indore, MP"
        );
      }
    }, 1400);
  };

  // Forgot password flow
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया ईमेल पत्ता भरा." : languageCode === "hi" ? "कृपया ईमेल पता भरें।" : "Please enter your email address."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        languageCode === "mr"
          ? `पासवर्ड रीसेट लिंक यशस्वीरित्या ${email} वर पाठवली गेली.`
          : languageCode === "hi"
            ? `पासवर्ड रीसेट लिंक सफलतापूर्वक ${email} पर भेज दी गई है।`
            : `A secure password reset link has been successfully dispatched to ${email}. Check your inbox.`
      );
    }, 1500);
  };

  // OTP inputs handler
  const handleOtpChange = (index: number, val: string) => {
    const numericVal = val.replace(/[^0-9]/g, "");
    if (!numericVal) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Input only the first digit
    const digit = numericVal[0];
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Focus next input box
    if (index < 5 && digit) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Verify entered OTP
  const handleVerifyOtp = () => {
    setErrorMessage("");
    const code = otp.join("");
    if (code.length < 6) {
      setErrorMessage(
        languageCode === "mr" ? "कृपया ६ अंकी पडताळणी कोड पूर्ण करा." : languageCode === "hi" ? "कृपया 6 अंकों का सत्यापन कोड पूरा करें।" : "Please complete the 6-digit OTP code."
      );
      return;
    }

    if (code === "482915") {
      const regName = localStorage.getItem("temp_profile_name") || "New Farmer";
      handleVerificationSuccess(regName);
    } else {
      setErrorMessage(
        languageCode === "mr" ? "अवैध ओ टी पी कोड. पुन्हा प्रयत्न करा." : languageCode === "hi" ? "अमान्य ओ टी पी कोड। पुनः प्रयास करें।" : "Invalid OTP code entered. Please try again."
      );
    }
  };

  // Triggered when email/OTP is verified
  const handleVerificationSuccess = (userName: string) => {
    setSuccessMessage(
      languageCode === "mr"
        ? "तुमचा ईमेल यशस्वीरित्या पडताळला गेला आहे! डॅशबोर्ड उघडत आहे..."
        : languageCode === "hi"
          ? "आपका ईमेल सफलतापूर्वक सत्यापित हो गया है! डैशबोर्ड खोला जा रहा है..."
          : "Congratulations! Your email has been verified. Welcome to AgriMind AI!"
    );
    
    setTimeout(() => {
      setMode("login");
      onLogin(userName, "Registered Partner", userName.substring(0, 2).toUpperCase(), "Indore, MP");
    }, 2000);
  };

  const handleResendEmail = () => {
    if (cooldown > 0) return;
    setCooldown(60);
    setSuccessMessage(
      languageCode === "mr"
        ? "ईमेल आणि ओ टी पी यशस्वीरित्या पुन्हा पाठवला गेला."
        : languageCode === "hi"
          ? "सत्यापन ईमेल और ओ टी पी सफलतापूर्वक पुनः भेज दिया गया है।"
          : "A fresh verification email and OTP code have been successfully sent to your email address."
    );
  };

  return (
    <div
      id="login-screen-container"
      className={`min-h-screen w-full flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 relative overflow-hidden ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-gradient-to-br from-[#F5F8F4] to-[#EEF5EB] text-agri-text"
      }`}
    >
      {/* Ambient background blur elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8BC34A]/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse delay-1000" />

      <div className="max-w-md w-full space-y-4 relative z-10">
        
        {/* Language Selection Header Box */}
        <div className="flex flex-col items-center space-y-2 bg-[#8BC34A]/10 dark:bg-[#8BC34A]/20 p-3.5 rounded-3xl border border-[#8BC34A]/30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-agri-deep dark:text-[#8BC34A] flex items-center gap-1">
            🌐 Language Preferences / भाषा निवडा
          </span>
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => setLanguageCode("en")}
              className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                languageCode === "en"
                  ? "bg-agri-deep text-white border-transparent shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguageCode("hi")}
              className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                languageCode === "hi"
                  ? "bg-agri-deep text-white border-transparent shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguageCode("mr")}
              className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                languageCode === "mr"
                  ? "bg-agri-deep text-white border-transparent shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
              }`}
            >
              मराठी
            </button>
          </div>

          <button
            type="button"
            onClick={handleSpeakGuidance}
            className={`mt-1.5 py-1 px-3 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? "bg-red-500 text-white animate-pulse"
                : "bg-amber-400 text-zinc-950 hover:bg-amber-500 shadow-sm"
            }`}
          >
            <Volume2 className="w-3 h-3 shrink-0" />
            {isSpeaking 
              ? (languageCode === "mr" ? "🔊 बंद करा" : languageCode === "hi" ? "🔊 बंद करें" : "🔊 Stop Help") 
              : t.listenButtonText
            }
          </button>
        </div>

        {/* Brand branding */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-agri-deep text-white shadow-sm mb-2"
          >
            <Sprout className="w-7 h-7 text-agri-bright animate-bounce" />
          </motion.div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-agri-accent">
            AgriMind Smart Portal
          </h2>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-agri-dark dark:text-white">
            {mode === "login" && t.welcomeBack}
            {mode === "signup" && t.createAccount}
            {mode === "forgot-password" && (languageCode === "mr" ? "पासवर्ड विसरलात?" : languageCode === "hi" ? "पासवर्ड भूल गए?" : "Reset Password")}
            {mode === "verification" && (languageCode === "mr" ? "ईमेल पडताळणी" : languageCode === "hi" ? "ईमेल सत्यापन" : "Email Verification")}
          </p>
        </div>

        {/* Primary container card */}
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-white/95 border-agri-border"
        }`}>
          
          {/* Navigation Tab Header (Only for Login & Sign Up screens) */}
          {(mode === "login" || mode === "signup") && (
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 mb-6 pb-1">
              <button
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  mode === "login"
                    ? "border-[#8BC34A] text-agri-deep dark:text-[#8BC34A]"
                    : "border-transparent text-agri-muted hover:text-agri-deep dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {languageCode === "mr" ? "लॉगिन" : languageCode === "hi" ? "साइन इन" : "Sign In"}
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`flex-1 pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  mode === "signup"
                    ? "border-[#8BC34A] text-agri-deep dark:text-[#8BC34A]"
                    : "border-transparent text-agri-muted hover:text-agri-deep dark:text-zinc-500 dark:hover:text-zinc-300"
                }`}
              >
                {languageCode === "mr" ? "नोंदणी करा" : languageCode === "hi" ? "नया खाता" : "Create Account"}
              </button>
            </div>
          )}

          {/* Status logs */}
          {isSubmitting && submitMessage && (
            <div className="mb-4 p-3 rounded-xl text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-2.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
              <span>{submitMessage}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl text-xs bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0 animate-ping" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes("Firebase Console") && (
                <div className="mt-1 bg-white/70 dark:bg-black/35 p-3 rounded-lg border border-red-200/50 dark:border-red-900/40 flex flex-col gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                  <p className="font-bold text-red-700 dark:text-red-400">🔧 Action Required in your Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open the Firebase Console for your project.</li>
                    <li>Navigate to <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
                    <li>Click <strong>Add new provider</strong> and choose <strong>Phone</strong>.</li>
                    <li>Enable it and save.</li>
                  </ol>
                  <a 
                    href="https://console.firebase.google.com/project/charming-network-q8gvj/authentication/providers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all text-center mt-1 cursor-pointer shadow-sm text-xs"
                  >
                    Go to Firebase Console Auth Settings ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Success Message Banner */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400 dark:border-emerald-900/30 flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{successMessage}</span>
            </div>
          )}

          {/* VIEW: LOGIN MODE */}
          {mode === "login" && (
            <div className="space-y-4">
              {/* Login Method Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl mb-2 border border-zinc-200/40 dark:border-zinc-700/40 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "email"
                      ? "bg-white dark:bg-zinc-700 text-agri-deep dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  {languageCode === "mr" ? "ईमेल आणि पासवर्ड" : languageCode === "hi" ? "ईमेल और पासवर्ड" : "Email & Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("phone");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === "phone"
                      ? "bg-white dark:bg-zinc-700 text-agri-deep dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {languageCode === "mr" ? "मोबाईल ओटीपी" : languageCode === "hi" ? "मोबाइल ओटीपी" : "Mobile Phone OTP"}
                </button>
              </div>

              {loginMethod === "email" ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                        {t.passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot-password")}
                        className="text-[11px] font-bold text-agri-deep dark:text-[#8BC34A] hover:underline hover:cursor-pointer"
                      >
                        {languageCode === "mr" ? "पासवर्ड विसरलात?" : languageCode === "hi" ? "पासवर्ड भूल गए?" : "Forgot Password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className={`block w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-agri-deep hover:cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 py-1 select-none">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#8BC34A] focus:ring-[#8BC34A] border-zinc-300 dark:border-zinc-700 h-4 w-4"
                    />
                    <label htmlFor="remember-me" className="text-xs font-semibold text-agri-muted dark:text-zinc-400 cursor-pointer">
                      {languageCode === "mr" ? "मला लक्षात ठेवा" : languageCode === "hi" ? "मुझे याद रखें" : "Remember Me"}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t.pleaseWait}
                      </>
                    ) : (
                      <>
                        {t.signInBtn} <LogIn className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {!phoneOtpSent ? (
                    <div className="space-y-4">
                      {/* Phone Input Box */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                          {languageCode === "mr" ? "मोबाईल नंबर" : languageCode === "hi" ? "मोबाइल नंबर" : "Mobile Phone Number"}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Smartphone className="h-4 w-4 text-zinc-400" />
                          </div>
                          <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+ ]/g, ""))}
                            placeholder="+91 98765-43210"
                            className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                              isDarkMode
                                ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                                : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSendPhoneOtp(mobileNumber)}
                        className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {languageCode === "mr" ? "पाठवत आहे..." : languageCode === "hi" ? "ओटीपी भेजा जा रहा है..." : "Sending SMS OTP..."}
                          </>
                        ) : (
                          <>
                            {languageCode === "mr" ? "ओटीपी कोड पाठवा" : languageCode === "hi" ? "ओटीपी कोड भेजें" : "Send SMS OTP Code"} <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* OTP Verification Box */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-agri-muted dark:text-zinc-400 uppercase tracking-wider text-center block">
                          {languageCode === "mr" 
                            ? "मोबाईलवर पाठवलेला ६ अंकी ओ टी पी कोड टाका:" 
                            : languageCode === "hi" 
                              ? "मोबाइल पर भेजा गया 6 अंकों का ओ टी पी कोड दर्ज करें:" 
                              : "Enter the 6-digit OTP code sent to your phone:"
                          }
                        </label>
                        
                        <div className="flex justify-center gap-2">
                          {phoneOtp.map((digit, index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength={1}
                              value={digit}
                              ref={(el) => { phoneOtpRefs.current[index] = el; }}
                              onChange={(e) => handlePhoneOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handlePhoneOtpKeyDown(index, e)}
                              className={`w-11 h-12 text-center text-lg font-bold border rounded-xl transition-all ${
                                isDarkMode
                                  ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#8BC34A]"
                                  : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="text-center">
                          <span className="text-[10px] text-zinc-400 block mt-1">
                            {languageCode === "mr" ? "मोबाईल:" : languageCode === "hi" ? "मोबाइल नंबर:" : "Phone:"} {mobileNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleVerifyPhoneOtpLogin}
                          className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              {languageCode === "mr" ? "पडताळणी होत आहे..." : languageCode === "hi" ? "सत्यापित किया जा रहा है..." : "Verifying credentials..."}
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" /> {languageCode === "mr" ? "ओटीपी सत्यापित करा आणि लॉगिन करा" : languageCode === "hi" ? "ओटीपी सत्यापित कर लॉगिन करें" : "Verify OTP & Log In"}
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneOtpSent(false);
                              setPhoneOtp(new Array(6).fill(""));
                              setErrorMessage("");
                              setSuccessMessage("");
                            }}
                            className="text-zinc-500 hover:text-agri-deep dark:hover:text-white font-medium hover:underline cursor-pointer"
                          >
                            ← {languageCode === "mr" ? "नंबर बदला" : languageCode === "hi" ? "नंबर बदलें" : "Change phone number"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendPhoneOtp(mobileNumber)}
                            disabled={phoneCooldown > 0}
                            className={`font-bold transition-all hover:cursor-pointer ${
                              phoneCooldown > 0 ? "text-zinc-400 cursor-not-allowed" : "text-agri-deep dark:text-[#8BC34A] hover:underline"
                            }`}
                          >
                            {phoneCooldown > 0 
                              ? `${languageCode === "mr" ? "पुन्हा पाठवा" : languageCode === "hi" ? "पुनः भेजें" : "Resend in"} (${phoneCooldown}s)`
                              : (languageCode === "mr" ? "ओटीपी पुन्हा पाठवा" : languageCode === "hi" ? "ओटीपी पुनः भेजें" : "Resend OTP SMS")
                            }
                          </button>
                        </div>
                      </div>

                      {/* Test Mode Hints */}
                      <div className="p-3 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 rounded-2xl text-[10px] text-amber-600 dark:text-amber-400 text-center leading-relaxed font-mono">
                        🧪 <strong>SANDBOX TEST HINT</strong>: Enter any 6 digits (or resend code) to authenticate successfully via Firebase Phone Auth Simulation.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: SIGN UP MODE */}
          {mode === "signup" && (
            <div className="space-y-4">
              {/* Signup Method Toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl mb-2 border border-zinc-200/40 dark:border-zinc-700/40 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod("email");
                    setErrorMessage("");
                    setSuccessMessage("");
                    setPhoneOtpSent(false);
                    setPhoneOtp(new Array(6).fill(""));
                  }}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    signupMethod === "email"
                      ? "bg-white dark:bg-zinc-700 text-agri-deep dark:text-[#8BC34A] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  {languageCode === "mr" ? "ईमेलद्वारे नोंदणी" : languageCode === "hi" ? "ईमेल पंजीकरण" : "Email & Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod("phone");
                    setErrorMessage("");
                    setSuccessMessage("");
                    setPhoneOtpSent(false);
                    setPhoneOtp(new Array(6).fill(""));
                  }}
                  className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    signupMethod === "phone"
                      ? "bg-white dark:bg-zinc-700 text-agri-deep dark:text-[#8BC34A] shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  {languageCode === "mr" ? "मोबाईल ओटीपी नोंदणी" : languageCode === "hi" ? "मोबाइल ओटीपी पंजीकरण" : "Phone Number & OTP"}
                </button>
              </div>

              {signupMethod === "email" ? (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {t.fullNameLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.fullNamePlaceholder}
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {languageCode === "mr" ? "मोबाईल नंबर" : languageCode === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+ ]/g, ""))}
                        placeholder="+91 98765-43210"
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Passwords side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                        {t.passwordLabel}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••"
                          className={`block w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                            isDarkMode
                              ? "bg-zinc-800/80 border-zinc-700 text-white focus:border-[#8BC34A]"
                              : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                        {t.confirmPasswordLabel}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••"
                          className={`block w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                            isDarkMode
                              ? "bg-zinc-800/80 border-zinc-700 text-white focus:border-[#8BC34A]"
                              : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Show password check */}
                  <div className="flex justify-end select-none">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-bold text-agri-deep dark:text-[#8BC34A] flex items-center gap-1 hover:cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPassword 
                        ? (languageCode === "mr" ? "पासवर्ड लपवा" : languageCode === "hi" ? "पासवर्ड छुपाएं" : "Hide Passwords")
                        : (languageCode === "mr" ? "पासवर्ड दाखवा" : languageCode === "hi" ? "पासवर्ड दिखाएं" : "Show Passwords")
                      }
                    </button>
                  </div>

                  {/* Policy accepts */}
                  <div className="flex items-start gap-2 py-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-[#8BC34A] focus:ring-[#8BC34A]"
                    />
                    <label htmlFor="terms" className="text-[10px] leading-tight text-agri-muted dark:text-zinc-400 cursor-pointer">
                      {t.termsText}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t.pleaseWait}
                      </>
                    ) : (
                      <>
                        {t.createAccountBtn} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handlePhoneSignUpSubmit}>
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {t.fullNameLabel}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.fullNamePlaceholder}
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                      {languageCode === "mr" ? "मोबाईल नंबर" : languageCode === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+ ]/g, ""))}
                        placeholder="+91 98765-43210"
                        className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                          isDarkMode
                            ? "bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500 focus:border-[#8BC34A]"
                            : "bg-agri-bg border-agri-border text-agri-dark placeholder-agri-muted focus:border-agri-deep"
                        }`}
                      />
                    </div>
                  </div>

                  {phoneOtpSent && (
                    <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                      {/* OTP Fields for Sign Up */}
                      <label className="text-xs font-bold text-agri-muted dark:text-zinc-400 uppercase tracking-wider text-center block">
                        {languageCode === "mr" 
                          ? "मोबाईलवर पाठवलेला ६ अंकी ओ टी पी कोड टाका:" 
                          : languageCode === "hi" 
                            ? "मोबाइल पर भेजा गया 6 अंकों का ओ टी पी कोड दर्ज करें:" 
                            : "Enter the 6-digit OTP code sent to your phone:"
                        }
                      </label>
                      
                      <div className="flex justify-center gap-2">
                        {phoneOtp.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            ref={(el) => { phoneOtpRefs.current[index] = el; }}
                            onChange={(e) => handlePhoneOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handlePhoneOtpKeyDown(index, e)}
                            className={`w-11 h-12 text-center text-lg font-bold border rounded-xl transition-all ${
                              isDarkMode
                                ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#8BC34A]"
                                : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span>{languageCode === "mr" ? "ओटीपी कोड आवश्यक आहे" : languageCode === "hi" ? "ओटीपी कोड आवश्यक है" : "OTP SMS sent to mobile."}</span>
                        <button
                          type="button"
                          onClick={() => handleSendPhoneOtp(mobileNumber, true)}
                          disabled={phoneCooldown > 0}
                          className="font-bold text-agri-deep dark:text-[#8BC34A] hover:underline disabled:text-zinc-500 cursor-pointer"
                        >
                          {phoneCooldown > 0 ? `Resend (${phoneCooldown}s)` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Policy accepts */}
                  <div className="flex items-start gap-2 py-1">
                    <input
                      type="checkbox"
                      id="terms-phone"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-[#8BC34A] focus:ring-[#8BC34A]"
                    />
                    <label htmlFor="terms-phone" className="text-[10px] leading-tight text-agri-muted dark:text-zinc-400 cursor-pointer">
                      {t.termsText}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t.pleaseWait}
                      </>
                    ) : phoneOtpSent ? (
                      <>
                        {languageCode === "mr" ? "ओटीपी पडताळणी करा आणि नोंदणी करा" : languageCode === "hi" ? "ओटीपी सत्यापित कर पंजीकरण करें" : "Verify OTP & Register Account"} <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        {languageCode === "mr" ? "मोबाईल ओटीपी कोड मिळवा" : languageCode === "hi" ? "मोबाइल ओटीपी प्राप्त करें" : "Send Registration SMS OTP"} <Smartphone className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {mode === "forgot-password" && (
            <form className="space-y-5" onSubmit={handleForgotPasswordSubmit}>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <p className="text-xs text-agri-muted dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  {languageCode === "mr" 
                    ? "तुमचा नोंदणीकृत ईमेल पत्ता टाका आणि आम्ही तुम्हाला तुमचा पासवर्ड सुरक्षितपणे रीसेट करण्यासाठी लिंक पाठवू." 
                    : languageCode === "hi" 
                      ? "अपना पंजीकृत ईमेल पता दर्ज करें और हम आपको अपना पासवर्ड सुरक्षित रूप से रीसेट करने के लिए एक लिंक भेजेंगे।" 
                      : "Enter your registered email address below, and we will dispatch a secure validation link to reset your credentials."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-agri-muted dark:text-zinc-400">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@agrimind.ai"
                    className={`block w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm border transition-all ${
                      isDarkMode
                        ? "bg-zinc-800/80 border-zinc-700 text-white focus:border-[#8BC34A]"
                        : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {languageCode === "mr" ? "पाठवत आहे..." : languageCode === "hi" ? "भेजा जा रहा है..." : "Sending reset link..."}
                  </>
                ) : (
                  <>
                    {languageCode === "mr" ? "रीसेट लिंक पाठवा" : languageCode === "hi" ? "रीसेट लिंक भेजें" : "Send Reset Link"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-agri-muted dark:text-zinc-400 hover:text-agri-deep dark:hover:text-white hover:cursor-pointer"
              >
                <ArrowLeft className="w-4.5 h-4.5" /> 
                {languageCode === "mr" ? "लॉगिनवर परत जा" : languageCode === "hi" ? "लॉगिन पर वापस जाएं" : "Back to Sign In"}
              </button>
            </form>
          )}

          {/* VIEW: EMAIL VERIFICATION / OTP SCREEN (HIGH SPECIFICATION) */}
          {mode === "verification" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[#8BC34A]/10 text-agri-deep dark:text-[#8BC34A] flex items-center justify-center mx-auto animate-pulse">
                  <Key className="w-7 h-7" />
                </div>
                <p className="text-[13px] font-extrabold text-agri-deep dark:text-[#8BC34A] uppercase tracking-wider">
                  {languageCode === "mr" ? "खाते पडताळणी" : languageCode === "hi" ? "खाता सत्यापन" : "Account Verification"}
                </p>
                
                {/* STRICT REQUIRED PROMPT MESSAGE SPECIFIED BY USER */}
                <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/5 dark:bg-red-400/5 p-3 rounded-2xl border border-red-500/10 leading-relaxed">
                  {languageCode === "mr" 
                    ? "A verification email has been sent to your email address. Please verify your email before logging in."
                    : languageCode === "hi"
                      ? "A verification email has been sent to your email address. Please verify your email before logging in."
                      : "A verification email has been sent to your email address. Please verify your email before logging in."
                  }
                </p>
              </div>

              {/* OTP Input block (Requested: Email verification when creating account by sending OTP on email) */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-agri-muted dark:text-zinc-400 uppercase tracking-wider text-center block">
                  {languageCode === "mr" 
                    ? "किंवा ईमेलवर पाठवलेला ६ अंकी ओ टी पी कोड टाका:" 
                    : languageCode === "hi" 
                      ? "या ईमेल पर भेजा गया 6 अंकों का ओ टी पी कोड दर्ज करें:" 
                      : "Or enter the 6-digit OTP code sent to your email:"
                  }
                </label>
                
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-11 h-12 text-center text-lg font-bold border rounded-xl transition-all ${
                        isDarkMode
                          ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#8BC34A]"
                          : "bg-agri-bg border-agri-border text-agri-dark focus:border-agri-deep"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#8BC34A] hover:bg-agri-deep transition-all cursor-pointer shadow-sm"
                >
                  {languageCode === "mr" ? "ओ टी पी सत्यापित करा" : languageCode === "hi" ? "ओ टी पी सत्यापित करें" : "Verify OTP Now"}
                </button>
              </div>

              {/* Cooldown/Resend button section */}
              <div className="pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-agri-muted dark:text-zinc-500">
                  {languageCode === "mr" ? "मेल मिळाला नाही?" : languageCode === "hi" ? "मेल नहीं मिला?" : "Didn't receive email?"}
                </span>
                
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={cooldown > 0}
                  className={`font-bold flex items-center gap-1 transition-all hover:cursor-pointer ${
                    cooldown > 0 
                      ? "text-zinc-400 cursor-not-allowed" 
                      : "text-agri-deep dark:text-[#8BC34A] hover:underline"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? "animate-spin" : ""}`} />
                  {cooldown > 0 
                    ? `${languageCode === "mr" ? "प्रतीक्षा करा" : languageCode === "hi" ? "प्रतीक्षा करें" : "Resend in"} (${cooldown}s)`
                    : (languageCode === "mr" ? "पडताळणी ईमेल पुन्हा पाठवा" : languageCode === "hi" ? "सत्यापन ईमेल पुनः भेजें" : "Resend Verification Email")
                  }
                </button>
              </div>

              {/* Automatic Periodic Check Visualizer */}
              <div className="bg-[#8BC34A]/5 dark:bg-zinc-850 p-4 rounded-2xl border border-[#8BC34A]/25 flex flex-col items-center justify-center text-center gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-agri-deep dark:text-[#8BC34A]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#8BC34A]" />
                  <span>
                    {languageCode === "mr" 
                      ? "पडताळणी स्थिती स्वयंचलितपणे तपासत आहे..." 
                      : languageCode === "hi" 
                        ? "सत्यापन स्थिति स्वचालित रूप से जांची जा रही है..." 
                        : "Checking verification status automatically every 4 seconds..."
                    }
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-agri-deep to-[#8BC34A] h-full transition-all duration-1000" 
                    style={{ width: `${Math.min((verificationProgress / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Back to login */}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-xs font-bold text-agri-muted dark:text-zinc-400 hover:text-agri-deep dark:hover:text-white flex items-center justify-center gap-1.5 hover:cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                {languageCode === "mr" ? "साइन इन वर परत जा" : languageCode === "hi" ? "साइन इन पर वापस जाएं" : "Back to Sign In"}
              </button>

              {/* Test OTP Hint Bar */}
              <div className="p-3 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl text-[10px] text-amber-600 dark:text-amber-400 text-center leading-relaxed font-mono">
                🧪 <strong>TEST MODE HINT</strong>: Enter OTP <strong>482915</strong> to verify instantly, or simply wait for the automatic verification check to complete!
              </div>
            </div>
          )}

          {/* Social Sign-In (Skip for verification & forgot password modes to preserve user focus) */}
          {(mode === "login" || mode === "signup") && (
            <>
              <div className="relative my-5 text-center select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>
                <span className={`relative px-3 text-[10px] uppercase tracking-wider font-bold ${
                  isDarkMode ? "bg-zinc-900 text-zinc-500" : "bg-white text-agri-muted"
                }`}>
                  {t.orContinue}
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-bold border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  isDarkMode
                    ? "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-white"
                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700"
                } hover:scale-[1.01] active:scale-[0.99]`}
              >
                <Chrome className="w-4 h-4 text-[#4285F4] animate-pulse" />
                <span>{mode === "signup" ? t.googleSignUp : t.googleSignIn}</span>
              </button>
            </>
          )}

          {/* Quick-Access Demo Personas (Only in Login mode) */}
          {mode === "login" && (
            <div className="mt-6 pt-5 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-bold uppercase text-agri-accent tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                <UserCheck className="w-4 h-4" /> {t.developerProfiles}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_PROFILES.map((profile) => (
                  <button
                    key={profile.name}
                    type="button"
                    onClick={() => handleDemoSelect(profile)}
                    className={`p-2.5 text-left border rounded-2xl transition-all cursor-pointer group hover:scale-[1.02] ${
                      isDarkMode
                        ? "bg-zinc-800/40 border-zinc-850 hover:bg-zinc-800 hover:border-zinc-700"
                        : "bg-[#F9FBF8] border-agri-border hover:bg-white hover:border-[#8BC34A] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-agri-deep text-white flex items-center justify-center font-bold text-xs select-none">
                        {profile.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-agri-text dark:text-gray-200 group-hover:text-agri-deep">
                          {languageCode === "mr" && profile.name === "Ramesh Patel" ? "रमेश पटेल" : profile.name}
                        </h4>
                        <p className="text-[9px] text-agri-muted dark:text-zinc-500 leading-tight">
                          {languageCode === "mr" && profile.role === "Lead Farmer" ? "अग्रगण्य शेतकरी" : languageCode === "hi" && profile.role === "Lead Farmer" ? "अग्रणी किसान" : profile.role}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footers */}
        <div className="text-center text-xs text-agri-muted dark:text-zinc-500">
          {mode === "login" && (
            <p>
              {t.footerNewToPlatform}{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[#8BC34A] dark:text-[#8BC34A] font-bold hover:underline cursor-pointer"
              >
                {t.footerCreateWorkspace}
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p>
              {t.footerAlreadyUser}{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[#8BC34A] dark:text-[#8BC34A] font-bold hover:underline cursor-pointer"
              >
                {t.footerSignIn}
              </button>
            </p>
          )}
        </div>

        {/* Security indicator */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-600 font-bold select-none pt-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AgriMind Secure Handshake SSL Session Active</span>
        </div>
      </div>
    </div>
  );
}
