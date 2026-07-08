import React, { useState, useEffect } from "react";
import { 
  CloudRain, Sun, Wind, Droplets, Calendar, Sparkles, Sprout, 
  TrendingUp, ChevronRight, FileText, Settings, Bell, 
  Map, GraduationCap, CheckSquare, Globe, Volume2 
} from "lucide-react";
import { WeatherTelemetry } from "../types";
import { LanguageCode, translations } from "../utils/translation";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  isDarkMode: boolean;
  languageCode: LanguageCode;
}

export default function Dashboard({ onNavigate, isDarkMode, languageCode }: DashboardProps) {
  const [weather, setWeather] = useState<WeatherTelemetry>({
    temp: 29,
    condition: "Sunny / Dry",
    humidity: 58,
    windSpeed: 14,
    rainChance: 12
  });

  const t = translations[languageCode];

  const [aiAdvisory, setAiAdvisory] = useState<any>({
    irrigation: t.irrigationAdviceTitle === "Irrigation Advice" 
      ? "Apply scheduled micro-sprinklers early morning to reduce moisture evapotranspiration."
      : languageCode === "mr" 
        ? "बाष्पीभवन कमी करण्यासाठी पहाटे सुक्ष्म सिंचनाचा वापर करा."
        : "वाष्पीकरण कम करने के लिए सुबह-सुबह सूक्ष्म सिंचाई का उपयोग करें।",
    pestManagement: t.pestAdviceTitle === "Pest Management"
      ? "Low risk of fungal spores. Scout eggplant specimens for whiteflies."
      : languageCode === "mr"
        ? "बुरशीजन्य रोगांचा धोका कमी आहे. पांढऱ्या माशीसाठी पिकांचे निरीक्षण करा."
        : "फंगल रोगों का खतरा कम है। सफेद मक्खी के लिए बैंगन के पौधों की जांच करें।",
    sprayingFertilization: t.sprayingAdviceTitle === "Spraying Suitability"
      ? "Favorable wind speed (14 km/h) for applying foliar nutrient sprays."
      : languageCode === "mr"
        ? "पानांवर खतांची फवारणी करण्यासाठी वाऱ्याचा वेग (१४ किमी/तास) अनुकूल आहे."
        : "पत्तियों पर पोषक तत्वों के छिड़काव के लिए हवा की गति (14 किमी/घंटा) अनुकूल है।",
    harvestingSowing: t.harvestAdviceTitle === "Sowing & Harvest"
      ? "Perfect weather for harvesting mature legumes and soil seedbed prep."
      : languageCode === "mr"
        ? "पक्व कडधान्यांची काढणी आणि शेत तयार करण्यासाठी उत्तम हवामान."
        : "परिपक्व फलियों की कटाई और खेत की तैयारी के लिए उत्तम मौसम।"
  });

  const [syncing, setSyncing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch AI weather recommendations whenever sliders change (tactile weather playground!)
  const fetchWeatherAdvisory = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/weather/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...weather, languageCode })
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvisory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Initial load and debounce further updates
    const timer = setTimeout(() => {
      fetchWeatherAdvisory();
    }, 600);
    return () => clearTimeout(timer);
  }, [weather.temp, weather.rainChance, weather.humidity]);

  // Read aloud dashboard content (Critical for low literacy access)
  const handleReadAloud = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const text = `${t.greetingMorning} Ramesh Patel. ${t.locationDetails}. ${t.telemetryTitle}. ${t.tempLabel} is ${weather.temp} degrees, ${t.humidityLabel} is ${weather.humidity} percent, ${t.windSpeedLabel} is ${weather.windSpeed} kilometers per hour, ${t.rainChanceLabel} is ${weather.rainChance} percent.`;
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

  return (
    <div className="space-y-8" id="agrimind-dashboard">
      {/* Top Welcome Greeting Banner */}
      <div className={`rounded-[32px] border p-8 relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 ${
        isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-agri-border text-agri-text"
      }`}>
        <div className="absolute right-0 top-0 bottom-0 opacity-10 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-agri-accent via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2.5 max-w-xl">
          <span className="text-[10px] uppercase font-bold tracking-widest text-agri-accent bg-agri-soft px-3 py-1 rounded-full dark:bg-zinc-800 inline-block">
            {t.primaryMemberDesk}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-agri-dark dark:text-zinc-100 leading-tight">
            {t.greetingMorning}, <span className="font-semibold">{languageCode === "mr" ? "रमेश पटेल!" : "Ramesh Patel!"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-agri-muted leading-relaxed">
            {t.locationDetails}
          </p>

          {/* ACCESSIBLE AUDIO READ ALOUD BUTTON */}
          <button
            onClick={handleReadAloud}
            className={`mt-2 py-1.5 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isSpeaking
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#8BC34A] hover:bg-[#7CB342] text-white"
            }`}
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            {isSpeaking 
              ? (languageCode === "mr" ? "🔊 वाचन बंद करा" : languageCode === "hi" ? "🔊 वाचन बंद करें" : "🔊 Stop Reading")
              : (languageCode === "mr" ? "🔊 माहिती ऐका" : languageCode === "hi" ? "🔊 जानकारी सुनें" : "🔊 Listen (Read Screen)")
            }
          </button>
        </div>
        <div className="flex shrink-0">
          <button
            onClick={() => onNavigate("chat")}
            className="bg-agri-deep hover:bg-agri-dark text-white font-semibold text-xs py-3.5 px-5 rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-agri-bright" /> {t.consultAiButton}
          </button>
        </div>
      </div>

      {/* Main Grid: Climate vs Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weather Telemetry & Playground Panel (Left) */}
        <div className="lg:col-span-7 space-y-8">
          <div className={`rounded-[32px] border p-6 sm:p-8 shadow-sm space-y-8 transition-colors duration-300 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-agri-border"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-agri-dark dark:text-zinc-100">{t.telemetryTitle}</h3>
                <p className="text-xs text-agri-muted">{t.telemetrySubtitle}</p>
              </div>
              <span className="text-xs bg-agri-soft text-agri-deep font-bold px-3 py-1 rounded-full border border-agri-border dark:bg-zinc-800 dark:text-emerald-400">
                {t.liveSimulator}
              </span>
            </div>

            {/* Core Stats Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4 text-center dark:bg-zinc-800/40 dark:border-zinc-800">
                <Sun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <span className="text-[10px] text-agri-muted block uppercase tracking-wider font-semibold">{t.tempLabel}</span>
                <span className="text-lg font-bold text-agri-dark dark:text-zinc-100">{weather.temp}°C</span>
              </div>
              <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4 text-center dark:bg-zinc-800/40 dark:border-zinc-800">
                <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <span className="text-[10px] text-agri-muted block uppercase tracking-wider font-semibold">{t.humidityLabel}</span>
                <span className="text-lg font-bold text-agri-dark dark:text-zinc-100">{weather.humidity}%</span>
              </div>
              <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4 text-center dark:bg-zinc-800/40 dark:border-zinc-800">
                <Wind className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <span className="text-[10px] text-agri-muted block uppercase tracking-wider font-semibold">{t.windSpeedLabel}</span>
                <span className="text-lg font-bold text-agri-dark dark:text-zinc-100">{weather.windSpeed} km/h</span>
              </div>
              <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4 text-center dark:bg-zinc-800/40 dark:border-zinc-800">
                <CloudRain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <span className="text-[10px] text-agri-muted block uppercase tracking-wider font-semibold">{t.rainChanceLabel}</span>
                <span className="text-lg font-bold text-agri-dark dark:text-zinc-100">{weather.rainChance}%</span>
              </div>
            </div>

            {/* Sliders Playground */}
            <div className="space-y-5 pt-6 border-t border-agri-border dark:border-zinc-800">
              <h4 className="text-[10px] font-bold text-agri-muted uppercase tracking-widest">{t.simulateShifts}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-agri-text font-medium dark:text-zinc-300">
                    <span>{t.soilTempSlider}</span>
                    <span className="font-bold">{weather.temp}°C</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={weather.temp}
                    onChange={(e) => setWeather({ ...weather, temp: parseInt(e.target.value) })}
                    className="w-full accent-agri-accent cursor-pointer h-1.5 bg-agri-border rounded-lg dark:bg-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-agri-text font-medium dark:text-zinc-300">
                    <span>{t.precipRiskSlider}</span>
                    <span className="font-bold">{weather.rainChance}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weather.rainChance}
                    onChange={(e) => setWeather({ ...weather, rainChance: parseInt(e.target.value) })}
                    className="w-full accent-agri-accent cursor-pointer h-1.5 bg-agri-border rounded-lg dark:bg-zinc-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor Output Box */}
          <div className={`rounded-[32px] border p-6 sm:p-8 shadow-sm space-y-6 transition-colors duration-300 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-agri-soft/50 border-agri-border"
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-medium text-agri-deep dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-agri-accent shrink-0" /> {t.aiAdvisorTitle}
              </h3>
              {syncing && <span className="text-[10px] bg-agri-sage/30 text-agri-deep px-3 py-1 rounded-full animate-pulse font-bold">{t.computingText}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border transition-colors ${
                isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-agri-border"
              } space-y-1.5`}>
                <span className="text-[10px] text-agri-accent font-bold uppercase tracking-wider block">💧 {t.irrigationAdviceTitle}</span>
                <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiAdvisory.irrigation}</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-colors ${
                isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-agri-border"
              } space-y-1.5`}>
                <span className="text-[10px] text-agri-accent font-bold uppercase tracking-wider block">🐛 {t.pestAdviceTitle}</span>
                <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiAdvisory.pestManagement}</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-colors ${
                isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-agri-border"
              } space-y-1.5`}>
                <span className="text-[10px] text-agri-accent font-bold uppercase tracking-wider block">🧪 {t.sprayingAdviceTitle}</span>
                <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiAdvisory.sprayingFertilization}</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-colors ${
                isDarkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-white border-agri-border"
              } space-y-1.5`}>
                <span className="text-[10px] text-agri-accent font-bold uppercase tracking-wider block">🌾 {t.harvestAdviceTitle}</span>
                <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiAdvisory.harvestingSowing}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations & Activity (Right Column) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Quick Actions Grid */}
          <div className={`rounded-[32px] border p-6 sm:p-8 shadow-sm transition-colors duration-300 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-agri-border"
          }`}>
            <h3 className="font-serif text-lg sm:text-xl font-medium text-agri-dark dark:text-zinc-100 mb-6">{t.operationsCenterTitle}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <button
                onClick={() => onNavigate("disease")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-[#FDF2E9] text-[#E67E22] p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.diseaseScanner}</span>
              </button>

              <button
                onClick={() => onNavigate("market")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-[#EBF5FB] text-[#2980B9] p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.liveCropPrices}</span>
              </button>

              <button
                onClick={() => onNavigate("schemes")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-[#E8F8F5] text-[#16A085] p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.govtSchemes}</span>
              </button>

              <button
                onClick={() => onNavigate("management")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform dark:bg-emerald-950/20 dark:text-emerald-400">
                  <Map className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.farmPlotting}</span>
              </button>

              <button
                onClick={() => onNavigate("planner")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-blue-50 text-blue-700 p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform dark:bg-blue-950/20 dark:text-blue-400">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.smartPlanner}</span>
              </button>

              <button
                onClick={() => onNavigate("hub")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-amber-50 text-amber-700 p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform dark:bg-amber-950/20 dark:text-amber-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.knowledgeHub}</span>
              </button>

              <button
                onClick={() => onNavigate("satellite")}
                className={`p-4 border rounded-2xl text-center transition-all group cursor-pointer ${
                  isDarkMode ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40" : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/40"
                }`}
              >
                <div className="bg-[#ECEFF1] text-[#37474F] p-2.5 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform dark:bg-zinc-800 dark:text-zinc-300">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-agri-text dark:text-zinc-200 block">{t.satelliteMap}</span>
              </button>
            </div>
          </div>

          {/* Today's Farming Tips Feed */}
          <div className={`rounded-[32px] border p-6 sm:p-8 shadow-sm transition-colors duration-300 ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-agri-border"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg sm:text-xl font-medium text-agri-dark dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-agri-accent" /> {t.alertsTitle}
              </h3>
              <span className="text-[10px] font-bold text-agri-muted uppercase tracking-wider">June 2026</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 text-sm items-start border-b border-agri-border dark:border-zinc-800 pb-4">
                <span className="bg-[#FDF2E9] text-[#D35400] text-[9px] font-bold px-2.5 py-1 rounded mt-0.5 shrink-0 uppercase tracking-wider">
                  Disease
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-agri-dark dark:text-zinc-200 text-sm">{t.diseaseAlertTitle}</h4>
                  <p className="text-xs text-agri-muted leading-relaxed">{t.diseaseAlertDesc}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm items-start border-b border-agri-border dark:border-zinc-800 pb-4">
                <span className="bg-[#EBF5FB] text-[#2980B9] text-[9px] font-bold px-2.5 py-1 rounded mt-0.5 shrink-0 uppercase tracking-wider">
                  Market
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-agri-dark dark:text-zinc-200 text-sm">{t.marketAlertTitle}</h4>
                  <p className="text-xs text-agri-muted leading-relaxed">{t.marketAlertDesc}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm items-start">
                <span className="bg-[#E8F8F5] text-[#16A085] text-[9px] font-bold px-2.5 py-1 rounded mt-0.5 shrink-0 uppercase tracking-wider">
                  Sowing
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-agri-dark dark:text-zinc-200 text-sm">{t.sowingAlertTitle}</h4>
                  <p className="text-xs text-agri-muted leading-relaxed">{t.sowingAlertDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

