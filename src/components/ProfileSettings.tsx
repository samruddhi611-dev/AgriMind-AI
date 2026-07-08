import React, { useState } from "react";
import { User, Shield, Bell, Languages, ShieldAlert, CheckCircle, Database, HelpCircle, FileLock } from "lucide-react";

interface ProfileProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const LANGUAGES = ["English", "Hindi (हिन्दी)", "Telugu (తెలుగు)", "Marathi (मराठी)", "Punjabi (ਪੰਜਾਬੀ)"];

export default function ProfileSettings({ isDarkMode, onThemeToggle }: ProfileProps) {
  const [lang, setLang] = useState("English");
  const [notifs, setNotifs] = useState(true);
  const [security, setSecurity] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState({
    name: "Ramesh Patel",
    email: "ramesh.patel.indore@gmail.com",
    farmSize: "4.5 Hectares",
    primaryCrops: "Soybean, Kharif Maize, Wheat"
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8" id="profile-settings-panel">
      {/* Top Title Banner */}
      <div className="border-b border-agri-border pb-5 dark:border-zinc-800">
        <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Farmer Profile & Settings</h2>
        <p className="text-xs text-agri-muted">Configure your farm coordinates, preferred languages, notifications, and security keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card (Left - 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 bg-agri-deep rounded-full mx-auto flex items-center justify-center border-4 border-agri-soft text-white font-bold text-3xl shadow">
                RP
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100">{profile.name}</h3>
                <span className="text-[10px] text-agri-muted font-bold uppercase tracking-widest block">Indore District • India</span>
              </div>
            </div>

            {/* Farm statistics cards */}
            <div className="space-y-4 pt-4 border-t border-agri-border dark:border-zinc-800 text-xs sm:text-sm text-agri-text dark:text-zinc-300 font-medium">
              <div className="flex justify-between items-center py-2.5 border-b border-agri-bg dark:border-zinc-850">
                <span className="text-agri-muted">Login Account</span>
                <span className="text-agri-dark dark:text-zinc-100 font-semibold">{profile.email}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-agri-bg dark:border-zinc-850">
                <span className="text-agri-muted">Total Operational Land</span>
                <span className="text-agri-deep dark:text-agri-bright font-bold">{profile.farmSize}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-agri-muted">Sown Commodities</span>
                <span className="text-agri-dark dark:text-zinc-100 font-bold">{profile.primaryCrops}</span>
              </div>
            </div>
          </div>

          {/* Quick Help box */}
          <div className="bg-agri-soft/40 border border-agri-border rounded-[24px] p-6 text-xs text-agri-muted space-y-2 dark:bg-zinc-800/10 dark:border-zinc-800">
            <h4 className="font-bold text-agri-deep dark:text-agri-bright uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-agri-accent" /> Agronomy Helpdesk
            </h4>
            <p className="leading-relaxed">Need custom soil maps or specialized enterprise disease reports? Reach out to support nodes or configure external APIs under your Flutter configuration file.</p>
          </div>
        </div>

        {/* Settings Form (Right - 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 border-b border-agri-border pb-3.5 flex items-center gap-2 dark:border-zinc-800">
              <Shield className="w-5 h-5 text-agri-accent" /> Member Preferences
            </h3>

            {/* Profile Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-sm font-semibold transition-all dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Operational Land Size</label>
                <input
                  type="text"
                  value={profile.farmSize}
                  onChange={(e) => setProfile({ ...profile, farmSize: e.target.value })}
                  className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-sm font-semibold transition-all dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Preferences sliders */}
            <div className="space-y-4 pt-4 border-t border-agri-border dark:border-zinc-800">
              {/* Language selection dropdown */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-start gap-2.5 max-w-sm">
                  <Languages className="w-5 h-5 text-agri-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-agri-dark dark:text-zinc-200 leading-snug">Agronomy Language</h4>
                    <p className="text-xs text-agri-muted leading-normal">Translates weather recommendations and news bulletins.</p>
                  </div>
                </div>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-agri-soft/40 border border-agri-border focus:border-agri-accent outline-none text-xs font-bold p-2.5 rounded-xl transition-all dark:bg-zinc-800 dark:border-zinc-700 text-agri-dark dark:text-zinc-200"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Notification Toggles */}
              <div className="flex items-center justify-between py-2 border-t border-agri-border dark:border-zinc-800">
                <div className="flex items-start gap-2.5 max-w-sm">
                  <Bell className="w-5 h-5 text-agri-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-agri-dark dark:text-zinc-200 leading-snug">Micro-Climate Notifications</h4>
                    <p className="text-xs text-agri-muted leading-normal">Send sudden high temperature, rain forecast, or pest outbreak alerts.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifs}
                  onChange={(e) => setNotifs(e.target.checked)}
                  className="w-9 h-5 bg-agri-border dark:bg-zinc-800 rounded-full appearance-none checked:bg-agri-accent cursor-pointer relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:left-0.5 before:top-0.5 checked:before:translate-x-4 before:transition-transform"
                />
              </div>

              {/* Security authentication lock toggle */}
              <div className="flex items-center justify-between py-2 border-t border-agri-border dark:border-zinc-800">
                <div className="flex items-start gap-2.5 max-w-sm">
                  <ShieldAlert className="w-5 h-5 text-agri-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-agri-dark dark:text-zinc-200 leading-snug">Remember Login Credentials</h4>
                    <p className="text-xs text-agri-muted leading-normal">Store local secure auth tokens on devices to bypass logins during offline modes.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={security}
                  onChange={(e) => setSecurity(e.target.checked)}
                  className="w-9 h-5 bg-agri-border dark:bg-zinc-800 rounded-full appearance-none checked:bg-agri-accent cursor-pointer relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:left-0.5 before:top-0.5 checked:before:translate-x-4 before:transition-transform"
                />
              </div>

              {/* Dark mode selector toggle */}
              <div className="flex items-center justify-between py-2 border-t border-agri-border dark:border-zinc-800">
                <div className="flex items-start gap-2.5 max-w-sm">
                  <Database className="w-5 h-5 text-agri-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-agri-dark dark:text-zinc-200 leading-snug">Dark Eye-Safe Mode</h4>
                    <p className="text-xs text-agri-muted leading-normal">Switches interface to organic forest dark canvas.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={onThemeToggle}
                  className="w-9 h-5 bg-agri-border dark:bg-zinc-800 rounded-full appearance-none checked:bg-agri-accent cursor-pointer relative transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:left-0.5 before:top-0.5 checked:before:translate-x-4 before:transition-transform"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-between pt-4 border-t border-agri-border dark:border-zinc-800 flex-wrap gap-3">
              <button
                onClick={handleSave}
                className="bg-agri-deep hover:bg-agri-dark text-white text-xs font-bold py-3 px-6 rounded-full shadow transition-all flex items-center gap-1.5"
              >
                Save Preferences
              </button>
              {savedSuccess && (
                <span className="text-agri-accent text-xs font-bold flex items-center gap-1 shrink-0 animate-pulse">
                  <CheckCircle className="w-4 h-4" /> Account updated successfully!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
