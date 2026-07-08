import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sprout, Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

export default function SplashScreen({ onComplete, isDarkMode }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Graceful progress bar accumulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small delay for smooth exit transition
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      id="splash-screen-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-950 text-white" : "bg-gradient-to-br from-[#F5F8F4] to-[#E8F0E6] text-agri-text"
      }`}
    >
      {/* Background ambient glowing particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8BC34A]/5 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Sprout Core Icon Frame */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1, rotate: 0 }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 0.8
          }}
          className="relative mb-8"
        >
          {/* Scanning outer ring aura */}
          <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-tr from-[#8BC34A] to-emerald-500 opacity-25 blur-lg animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-[32px] bg-gradient-to-tr from-[#689F38] to-[#8BC34A] flex items-center justify-center shadow-xl shadow-[#689F38]/20">
            <Sprout className="w-12 h-12 text-white" />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        </motion.div>

        {/* Elegant display typography */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-3"
        >
          <h1 className="text-sm font-bold tracking-[0.25em] uppercase text-agri-accent">
            AgriMind AI
          </h1>
          <p className="text-4xl font-light tracking-tight text-agri-dark dark:text-zinc-100">
            Nurturing Smarter Farms
          </p>
          <p className="text-xs text-agri-muted dark:text-zinc-400 max-w-xs mx-auto">
            Synchronizing machine learning diagnostics, crop forecasting, and nutrient intelligence.
          </p>
        </motion.div>

        {/* Dynamic Progress Loader bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-64 mt-12"
        >
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#689F38] to-emerald-400 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono mt-2 text-agri-muted dark:text-zinc-500">
            <span>DIAGNOSTICS INIT...</span>
            <span>{progress}%</span>
          </div>
        </motion.div>
      </div>

      {/* Humble credit foot note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-[10px] tracking-wider uppercase text-agri-muted dark:text-zinc-500 font-medium"
      >
        Agricultural Intelligence Console v2.5
      </motion.div>
    </div>
  );
}
