import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Sprout, TrendingUp, Calendar, FileText, User, 
  Sun, Moon, ShieldCheck, Map, GraduationCap, CheckSquare, 
  Globe, LogOut, HeartHandshake, MapPin, Mic, Volume2, X, Command, MessageSquare, Play, RefreshCw
} from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import AIChatbot from "./components/AIChatbot";
import DiseaseDetector from "./components/DiseaseDetector";
import MarketDesk from "./components/MarketDesk";
import GovernmentSchemes from "./components/GovernmentSchemes";
import ProfileSettings from "./components/ProfileSettings";
import FarmManagement from "./components/FarmManagement";
import SmartPlanner from "./components/SmartPlanner";
import LearningHub from "./components/LearningHub";
import SatelliteCommunity from "./components/SatelliteCommunity";
import { LanguageCode, translations } from "./utils/translation";

type Tab = "dashboard" | "chat" | "disease" | "market" | "schemes" | "profile" | "management" | "planner" | "hub" | "satellite";
type FlowState = "splash" | "login" | "dashboard";

interface AuthenticatedUser {
  name: string;
  role: string;
  avatar: string;
  region: string;
}

export default function App() {
  const [flowState, setFlowState] = useState<FlowState>("splash");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [languageCode, setLanguageCode] = useState<LanguageCode>("en");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceSpokenText, setVoiceSpokenText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [isSpeakingInstructions, setIsSpeakingInstructions] = useState(false);

  const t = translations[languageCode];

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogin = (name: string, role: string, avatar: string, region: string) => {
    setUser({ name, role, avatar, region });
    setFlowState("dashboard");
  };

  const handleLogout = () => {
    setFlowState("login");
    setUser(null);
    setActiveTab("dashboard");
  };

  // Speaks instructions when voice hub opens
  const speakVoiceHubInstructions = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    let text = "";
    if (languageCode === "mr") {
      text = "कृषी सहाय्यक मध्ये आपले स्वागत आहे. कृपया पर्यायावर क्लिक करा किंवा खालीलपैकी एक बोला: हवामान, बाजार भाव, रोग स्कॅनर किंवा योजना.";
    } else if (languageCode === "hi") {
      text = "कृषि सहायक में आपका स्वागत है। कृपया किसी विकल्प पर क्लिक करें या इनमें से एक बोलें: मौसम, बाजार भाव, बीमारी जांच, या सरकारी योजनाएं।";
    } else {
      text = "Welcome to the AgriMind Voice Hub. Please select a command below or speak one of the following shortcuts: weather, crop prices, disease scanner, or government schemes.";
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (languageCode === "hi") {
      utterance.lang = "hi-IN";
    } else if (languageCode === "mr") {
      utterance.lang = "mr-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onstart = () => setIsSpeakingInstructions(true);
    utterance.onend = () => setIsSpeakingInstructions(false);
    utterance.onerror = () => setIsSpeakingInstructions(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeakingInstructions = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingInstructions(false);
  };

  useEffect(() => {
    if (voiceOpen) {
      speakVoiceHubInstructions();
    } else {
      stopSpeakingInstructions();
    }
  }, [voiceOpen, languageCode]);

  // Processes voice commands (real or simulated)
  const processVoiceCommand = (command: string) => {
    setIsListening(false);
    setVoiceSpokenText(command);
    setVoiceFeedback("");

    const norm = command.toLowerCase().trim();
    
    // Command routes
    if (
      norm.includes("weather") || 
      norm.includes("temperature") || 
      norm.includes("हवामान") || 
      norm.includes("मौसम") ||
      norm.includes("तापमान")
    ) {
      setVoiceFeedback(languageCode === "mr" ? "हवामान विभाग उघडत आहे..." : languageCode === "hi" ? "मौसम विभाग खोला जा रहा है..." : "Navigating to Climate Telemetry...");
      setTimeout(() => {
        setActiveTab("dashboard");
        setVoiceOpen(false);
      }, 1200);
    } 
    else if (
      norm.includes("disease") || 
      norm.includes("leaf") || 
      norm.includes("scanner") || 
      norm.includes("रोग") || 
      norm.includes("बीमारी") ||
      norm.includes("स्कॅनर")
    ) {
      setVoiceFeedback(languageCode === "mr" ? "रोग स्कॅनर उघडत आहे..." : languageCode === "hi" ? "रोग स्कैनर खोला जा रहा है..." : "Navigating to Leaf Disease Scanner...");
      setTimeout(() => {
        setActiveTab("disease");
        setVoiceOpen(false);
      }, 1200);
    } 
    else if (
      norm.includes("price") || 
      norm.includes("market") || 
      norm.includes("mandi") || 
      norm.includes("बाजार") || 
      norm.includes("भाव") || 
      norm.includes("मंडी") ||
      norm.includes("दर")
    ) {
      setVoiceFeedback(languageCode === "mr" ? "बाजार भाव केंद्र उघडत आहे..." : languageCode === "hi" ? "मंडी भाव केंद्र खोला जा रहा है..." : "Navigating to Live Crop Prices...");
      setTimeout(() => {
        setActiveTab("market");
        setVoiceOpen(false);
      }, 1200);
    } 
    else if (
      norm.includes("scheme") || 
      norm.includes("government") || 
      norm.includes("योजना") || 
      norm.includes("सरकारी")
    ) {
      setVoiceFeedback(languageCode === "mr" ? "सरकारी योजना विभाग उघडत आहे..." : languageCode === "hi" ? "सरकारी योजनाएं खोली जा रही हैं..." : "Navigating to Government Schemes...");
      setTimeout(() => {
        setActiveTab("schemes");
        setVoiceOpen(false);
      }, 1200);
    } 
    else if (
      norm.includes("assistant") || 
      norm.includes("chat") || 
      norm.includes("bot") || 
      norm.includes("मदत") ||
      norm.includes("चॅट") ||
      norm.includes("सहाय्यक")
    ) {
      setVoiceFeedback(languageCode === "mr" ? "एआय चॅट सहाय्यक उघडत आहे..." : languageCode === "hi" ? "एआई चैट सहायक खोला जा रहा है..." : "Navigating to AI Advisory Chat...");
      setTimeout(() => {
        setActiveTab("chat");
        setVoiceOpen(false);
      }, 1200);
    } 
    else {
      setVoiceFeedback(
        languageCode === "mr" 
          ? "कमांड समजली नाही. कृपया पुन्हा प्रयत्न करा." 
          : languageCode === "hi" 
            ? "कमांड समझ नहीं आई। कृपया पुनः प्रयास करें।" 
            : "Command unrecognized. Please click on a shortcut below."
      );
    }
  };

  // Simulate listening micro-actions
  const handleStartListening = () => {
    setIsListening(true);
    setVoiceSpokenText("");
    setVoiceFeedback("");
    
    // Simulate speech detection countdown (reliable fallback inside iframes)
    setTimeout(() => {
      // Pick a random supported command based on language
      let simulatedCommands: string[] = [];
      if (languageCode === "mr") {
        simulatedCommands = ["बाजार भाव", "हवामान", "रोग स्कॅनर", "योजना"];
      } else if (languageCode === "hi") {
        simulatedCommands = ["मंडी भाव", "मौसम", "बीमारी स्कैनर", "सरकारी योजना"];
      } else {
        simulatedCommands = ["live crop prices", "weather report", "disease scanner", "government schemes"];
      }
      const rand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];
      processVoiceCommand(rand);
    }, 2200);
  };

  // Switch rendered view dynamically based on tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveTab} isDarkMode={isDarkMode} languageCode={languageCode} />;
      case "chat":
        return <AIChatbot />;
      case "disease":
        return <DiseaseDetector />;
      case "market":
        return <MarketDesk />;
      case "schemes":
        return <GovernmentSchemes />;
      case "profile":
        return <ProfileSettings isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />;
      case "management":
        return <FarmManagement />;
      case "planner":
        return <SmartPlanner />;
      case "hub":
        return <LearningHub />;
      case "satellite":
        return <SatelliteCommunity />;
      default:
        return <Dashboard onNavigate={setActiveTab} isDarkMode={isDarkMode} languageCode={languageCode} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-agri-bg text-agri-text"}`}>
      <AnimatePresence mode="wait">
        {flowState === "splash" && (
          <motion.div
            key="splash-view"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <SplashScreen onComplete={() => setFlowState("login")} isDarkMode={isDarkMode} />
          </motion.div>
        )}

        {flowState === "login" && (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} languageCode={languageCode} setLanguageCode={setLanguageCode} />
          </motion.div>
        )}

        {flowState === "dashboard" && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
          >
            {/* Top Main Navigation Header Bar */}
            <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
              isDarkMode ? "bg-zinc-900/95 border-zinc-800" : "bg-white/95 border-agri-border"
            } backdrop-blur-md`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
                  <div className="bg-agri-deep p-2.5 rounded-2xl text-white shadow-sm hover:scale-105 transition-all">
                    <Sprout className="w-5 h-5 text-agri-bright" />
                  </div>
                  <div>
                    <h1 className="text-xs uppercase tracking-widest text-agri-accent font-bold mb-0.5">AgriMind AI</h1>
                    <p className="text-xl font-light text-agri-dark dark:text-zinc-100">Smart Farming Assistant</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  {/* Language Switcher in Header (Quick Access) */}
                  <div className="hidden sm:flex bg-agri-soft/80 border border-agri-border p-1 rounded-xl gap-1 dark:bg-zinc-800/80 dark:border-zinc-700">
                    <button
                      onClick={() => setLanguageCode("en")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        languageCode === "en" ? "bg-agri-deep text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguageCode("hi")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        languageCode === "hi" ? "bg-agri-deep text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setLanguageCode("mr")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        languageCode === "mr" ? "bg-agri-deep text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                    >
                      मराठी
                    </button>
                  </div>

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDarkMode
                        ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700"
                        : "bg-white border-agri-border text-agri-muted hover:bg-agri-soft"
                    }`}
                    aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  {/* Dynamic User Profile Lockup & Logout */}
                  <div className="flex items-center gap-2 sm:gap-3.5 pl-2 sm:pl-3.5 border-l border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="text-right hidden md:block select-none">
                      <p className="text-xs font-bold text-agri-dark dark:text-zinc-200">{user?.name || "Ramesh Patel"}</p>
                      <p className="text-[9px] font-medium text-agri-muted dark:text-zinc-500 uppercase tracking-wider">{user?.role || "Lead Farmer"}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8BC34A]/25 to-emerald-500/10 border border-[#A8C69F] flex items-center justify-center text-agri-deep dark:text-[#8BC34A] font-black text-xs select-none shadow-sm">
                      {user?.avatar || "RP"}
                    </div>

                    {/* Exit System Button */}
                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer hover:scale-105"
                      title="Log Out Session"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Personalized Greeting Strip on Desktop */}
            {user && (
              <div className={`border-b text-xs transition-all ${isDarkMode ? "bg-zinc-900/40 border-zinc-900 text-zinc-300" : "bg-[#F4F8F3] border-agri-border text-agri-muted"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4.5 h-4.5 text-[#8BC34A]" />
                    <span>Greetings, <strong className="text-agri-deep dark:text-zinc-100">{languageCode === "mr" && user.name === "Ramesh Patel" ? "रमेश पटेल" : user.name}</strong>! System secure. You are currently connected as an active <strong>{languageCode === "mr" && user.role === "Lead Farmer" ? "अग्रगण्य शेतकरी" : languageCode === "hi" && user.role === "Lead Farmer" ? "अग्रणी किसान" : user.role}</strong>.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-agri-muted">
                    <MapPin className="w-3.5 h-3.5 text-agri-accent" />
                    <span>Region: {languageCode === "mr" && user.name === "Ramesh Patel" ? "इंदूर, मध्य प्रदेश" : user.region}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Container Layer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Side navigation bar on desktop (3 cols) */}
                <aside className="lg:col-span-3">
                  <div className={`rounded-[32px] border p-5 shadow-sm space-y-2 sticky top-28 transition-colors duration-300 ${
                    isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-agri-border"
                  }`}>
                    <span className="text-[10px] font-bold uppercase text-agri-muted tracking-widest px-3 block mb-3">Primary Modules</span>

                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "dashboard"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <Calendar className="w-4.5 h-4.5" /> {languageCode === "mr" ? "मुख्य स्क्रीन" : languageCode === "hi" ? "मुख्य स्क्रीन" : "Dashboard"}
                    </button>

                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "chat"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <Sparkles className="w-4.5 h-4.5" /> {languageCode === "mr" ? "एआय चॅट सहाय्यक" : languageCode === "hi" ? "एआई चैट सहायक" : "AI Chatbot"}
                    </button>

                    <button
                      onClick={() => setActiveTab("disease")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "disease"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <Sprout className="w-4.5 h-4.5" /> {languageCode === "mr" ? "रोग स्कॅनर" : languageCode === "hi" ? "रोग स्कैनर" : "Disease Scanner"}
                    </button>

                    <button
                      onClick={() => setActiveTab("market")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "market"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <TrendingUp className="w-4.5 h-4.5" /> {languageCode === "mr" ? "बाजार भाव" : languageCode === "hi" ? "मंडी भाव" : "Crop Market"}
                    </button>

                    <button
                      onClick={() => setActiveTab("schemes")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "schemes"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <FileText className="w-4.5 h-4.5" /> {languageCode === "mr" ? "सरकारी योजना" : languageCode === "hi" ? "सरकारी योजनाएं" : "Government Schemes"}
                    </button>

                    <span className="text-[10px] font-bold uppercase text-agri-muted tracking-widest px-3 block pt-5 mb-3">Farm Operations</span>

                    <button
                      onClick={() => setActiveTab("management")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "management"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <Map className="w-4.5 h-4.5" /> {languageCode === "mr" ? "शेत व्यवस्थापन" : languageCode === "hi" ? "खेत प्रबंधन" : "Farm Management"}
                    </button>

                    <button
                      onClick={() => setActiveTab("planner")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "planner"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <CheckSquare className="w-4.5 h-4.5" /> {languageCode === "mr" ? "स्मार्ट प्लॅनर" : languageCode === "hi" ? "स्मार्ट प्लानर" : "Smart Planner"}
                    </button>

                    <button
                      onClick={() => setActiveTab("hub")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "hub"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <GraduationCap className="w-4.5 h-4.5" /> {languageCode === "mr" ? "शिक्षण केंद्र" : languageCode === "hi" ? "शिक्षा हब" : "Learning Hub"}
                    </button>

                    <button
                      onClick={() => setActiveTab("satellite")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "satellite"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <Globe className="w-4.5 h-4.5" /> {languageCode === "mr" ? "सॅटेलाइट मॅप" : languageCode === "hi" ? "सैटेलाइट मानचित्र" : "Satellite & Forum"}
                    </button>

                    <span className="text-[10px] font-bold uppercase text-agri-muted tracking-widest px-3 block pt-5 mb-3">Settings</span>

                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        activeTab === "profile"
                          ? "bg-[#8BC34A26] text-agri-deep dark:text-[#8BC34A] border border-[#8BC34A44] font-bold"
                          : "text-agri-muted hover:bg-agri-soft hover:text-agri-deep border border-transparent dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-gray-100"
                      }`}
                    >
                      <User className="w-4.5 h-4.5" /> {languageCode === "mr" ? "प्रोफाइल सेटिंग" : languageCode === "hi" ? "प्रोफ़ाइल" : "Farm Profile"}
                    </button>
                  </div>
                </aside>

                {/* Dynamic Component Content Panel on the right (9 cols) */}
                <main className="lg:col-span-9 space-y-6">
                  {renderContent()}
                </main>
              </div>
            </div>

            {/* Footer Playground indicator */}
            <footer className={`border-t py-10 text-center text-xs mt-16 transition-colors duration-300 ${
              isDarkMode ? "bg-zinc-950 border-zinc-900 text-zinc-500" : "bg-white border-agri-border text-agri-muted"
            }`}>
              <div className="max-w-7xl mx-auto px-4 space-y-2">
                <p className="font-semibold flex items-center justify-center gap-1 text-agri-deep dark:text-[#8BC34A]">
                  <ShieldCheck className="w-4 h-4 text-agri-accent" /> AgriMind AI smart farming assistant running securely.
                </p>
                <p className="text-agri-muted/80">
                  Explore our modules to manage your farms, analyze soil, and track live crop prices with AI.
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACCESSIBLE VOICE TRIGGER BUTTON (CRITICAL FOR LOW-LITERACY / UNEDUCATED USERS) */}
      {flowState === "dashboard" && (
        <button
          onClick={() => setVoiceOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#8BC34A] hover:bg-[#7CB342] text-white p-4.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 group border-2 border-white/20 hover:cursor-pointer"
          title="बोलून चालवा / Speak Command"
        >
          <Mic className="w-6 h-6 animate-pulse text-white" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-extrabold text-xs tracking-wider uppercase pl-0">
            {languageCode === "mr" ? "बोलून चालवा" : languageCode === "hi" ? "बोलकर चलाएं" : "Speak Command"}
          </span>
        </button>
      )}

      {/* FULLY FUNCTIONAL VOICE HUB OVERLAY */}
      <AnimatePresence>
        {voiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full rounded-[40px] border p-6 sm:p-8 shadow-2xl space-y-6 ${
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-agri-border text-agri-text"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-agri-deep dark:text-[#8BC34A]">
                  <Mic className="w-5 h-5 text-agri-accent shrink-0 animate-bounce" />
                  <h3 className="font-serif text-lg font-bold">
                    {languageCode === "mr" ? "कृषी बोलून चालवा केंद्र" : languageCode === "hi" ? "कृषि बोलकर चलाएं केंद्र" : "AgriMind Voice Control Hub"}
                  </h3>
                </div>
                <button
                  onClick={() => setVoiceOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Narrator visualizer */}
              <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                <div className="relative">
                  {/* Waveform indicator */}
                  <div className="absolute inset-0 bg-[#8BC34A]/20 rounded-full animate-ping pointer-events-none scale-150" />
                  <div className="bg-gradient-to-tr from-[#8BC34A] to-emerald-500 text-white p-7 rounded-full shadow-lg relative z-10">
                    <Mic className={`w-8 h-8 ${isListening ? "animate-pulse scale-110" : ""}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-agri-muted dark:text-zinc-400 font-bold uppercase tracking-widest">
                    {isListening 
                      ? (languageCode === "mr" ? "मी ऐकत आहे..." : languageCode === "hi" ? "मैं सुन रहा हूँ..." : "Listening...") 
                      : (languageCode === "mr" ? "पर्याय निवडा किंवा बोला" : languageCode === "hi" ? "विकल्प चुनें या बोलें" : "Choose option or tap mic to speak")
                    }
                  </p>
                  
                  {isSpeakingInstructions && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                      <Volume2 className="w-3 h-3" /> {languageCode === "mr" ? "ध्वनी मार्गदर्शक चालू आहे..." : languageCode === "hi" ? "आवाज मार्गदर्शक सक्रिय है..." : "Audio Guidance Active..."}
                    </span>
                  )}
                </div>
              </div>

              {/* Command text box */}
              {voiceSpokenText && (
                <div className="bg-agri-soft/40 dark:bg-zinc-950/40 border border-agri-border dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-2.5">
                  <MessageSquare className="w-4.5 h-4.5 text-agri-accent shrink-0" />
                  <div>
                    <span className="text-[10px] text-agri-muted block uppercase tracking-wider font-semibold">
                      {languageCode === "mr" ? "तुम्ही बोललात:" : languageCode === "hi" ? "आप बोले:" : "You said:"}
                    </span>
                    <p className="text-xs font-bold text-agri-dark dark:text-white">"{voiceSpokenText}"</p>
                  </div>
                </div>
              )}

              {/* Status feedback */}
              {voiceFeedback && (
                <div className="p-3.5 rounded-xl bg-[#8BC34A]/10 text-agri-deep dark:bg-zinc-800/80 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 border border-[#8BC34A]/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {voiceFeedback}
                </div>
              )}

              {/* Click shortcuts to simulate speech (Highly accessible and 100% reliable) */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-agri-muted uppercase tracking-widest text-center">
                  {languageCode === "mr" ? "बोलण्याचे अनुकरण करण्यासाठी टॅप करा" : languageCode === "hi" ? "बोलने का अनुकरण करने के लिए टैप करें" : "Tap shortcut to simulate speaking"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => processVoiceCommand(languageCode === "mr" ? "हवामान" : languageCode === "hi" ? "मौसम" : "weather")}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>⛅ {languageCode === "mr" ? "हवामान" : languageCode === "hi" ? "मौसम" : "Weather"}</span>
                    <Play className="w-3 h-3 text-agri-accent shrink-0" />
                  </button>

                  <button
                    onClick={() => processVoiceCommand(languageCode === "mr" ? "बाजार भाव" : languageCode === "hi" ? "मंडी भाव" : "crop prices")}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>💸 {languageCode === "mr" ? "बाजार भाव" : languageCode === "hi" ? "मंडी भाव" : "Crop Prices"}</span>
                    <Play className="w-3 h-3 text-agri-accent shrink-0" />
                  </button>

                  <button
                    onClick={() => processVoiceCommand(languageCode === "mr" ? "रोग स्कॅनर" : languageCode === "hi" ? "बीमारी स्कैनर" : "disease scanner")}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>🔬 {languageCode === "mr" ? "रोग स्कॅनर" : languageCode === "hi" ? "बीमारी स्कैनर" : "Scanner"}</span>
                    <Play className="w-3 h-3 text-agri-accent shrink-0" />
                  </button>

                  <button
                    onClick={() => processVoiceCommand(languageCode === "mr" ? "योजना" : languageCode === "hi" ? "सरकारी योजना" : "government schemes")}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-xs font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>📜 {languageCode === "mr" ? "योजना" : languageCode === "hi" ? "योजनाएं" : "Schemes"}</span>
                    <Play className="w-3 h-3 text-agri-accent shrink-0" />
                  </button>
                </div>
              </div>

              {/* Simulated microphone controls */}
              <div className="flex gap-2.5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleStartListening}
                  disabled={isListening}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-agri-deep to-[#8BC34A] hover:opacity-95 text-white font-extrabold text-xs tracking-wider uppercase rounded-full shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isListening ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {languageCode === "mr" ? "मी ऐकत आहे..." : languageCode === "hi" ? "मैं सुन रहा हूँ..." : "Listening..."}
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-white" />
                      {languageCode === "mr" ? "बोलण्यासाठी दाबा" : languageCode === "hi" ? "बोलने के लिए दबाएं" : "Tap to Speak"}
                    </>
                  )}
                </button>

                <button
                  onClick={speakVoiceHubInstructions}
                  className={`p-3 border rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                    isDarkMode 
                      ? "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-[#8BC34A]" 
                      : "bg-[#F9FBF8] hover:bg-zinc-100 border-zinc-200 text-agri-deep"
                  }`}
                  title="ध्वनी मदत पुन्हा ऐका / Replay Help"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

