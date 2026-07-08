import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Volume2, VolumeX, Sparkles, User, ShieldCheck } from "lucide-react";
import { ChatMessage } from "../types";

const QUICK_PROMPTS = [
  "What is the best crop rotation for organic tomatoes?",
  "Recommend fertilizer for Wheat in clayey soil",
  "Pest controls for sugarcane borers",
  "How can I test soil nitrogen without lab instruments?"
];

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "Hello! I am AgriMind AI, your smart farming copilot. Ask me any questions about crop selection, pest remediation, soil nutrients, or sustainable agricultural protocols!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioPlaybackId, setAudioPlaybackId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Speech Recognition capability
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // Target Indian Farmer locale default

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputValue(text);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    // Auto Scroll to Bottom of logs
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue("");
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Gather chat history for conversational memory
      const historyToSend = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6) // Keep last 6 exchanges to save token window
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyToSend
        })
      });

      if (!res.ok) {
        throw new Error("Chat api request timed out or failed.");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: data.text || "I was unable to formulate a farming solution. Please try rephrasing your problem.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        content: "🚨 Communication Offline. I'm currently unable to connect to the AgriMind AI server nodes. Please check your system secrets and environment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech Playback using browser synthesis
  const speakMessage = (msgId: string, content: string) => {
    if ("speechSynthesis" in window) {
      if (audioPlaybackId === msgId) {
        window.speechSynthesis.cancel();
        setAudioPlaybackId(null);
        return;
      }

      window.speechSynthesis.cancel(); // stop current
      const utterance = new SpeechSynthesisUtterance(content.replace(/[#*`_]/g, ""));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-IN"; // English with helpful South Asian articulation

      utterance.onend = () => {
        setAudioPlaybackId(null);
      };

      utterance.onerror = () => {
        setAudioPlaybackId(null);
      };

      setAudioPlaybackId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] bg-white rounded-[32px] border border-agri-border shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800" id="chat-copilot-panel">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-900 p-5 flex items-center justify-between border-b border-agri-border dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="bg-agri-soft dark:bg-zinc-800 p-2.5 rounded-2xl">
            <Sparkles className="w-5 h-5 text-agri-accent animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 flex items-center gap-1.5">
              AgriMind Farming Copilot
              <ShieldCheck className="w-4 h-4 text-agri-bright" />
            </h3>
            <p className="text-[10px] sm:text-xs text-agri-muted">Secure Server-Side Gemini Node Connected</p>
          </div>
        </div>
      </div>

      {/* Message logs area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-agri-bg/20 dark:bg-zinc-950/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar block */}
            <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
              msg.role === "user" ? "bg-agri-deep text-white" : "bg-agri-soft text-agri-deep border border-agri-border"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-agri-accent" />}
            </div>

            {/* Bubble contents */}
            <div className={`rounded-[22px] p-4 shadow-sm text-sm relative group ${
              msg.role === "user"
                ? "bg-agri-deep text-white rounded-tr-none"
                : "bg-white text-agri-text border border-agri-border rounded-tl-none dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-100"
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
              <div className={`flex items-center justify-between mt-3 pt-2 border-t text-[10px] ${
                msg.role === "user" ? "border-white/10 text-white/70" : "border-agri-border dark:border-zinc-800 text-agri-muted"
              }`}>
                <span>{msg.timestamp}</span>
                {msg.role === "model" && (
                  <button
                    onClick={() => speakMessage(msg.id, msg.content)}
                    className="text-agri-accent hover:text-agri-deep p-1 rounded hover:bg-agri-soft transition-all flex items-center gap-1 font-semibold"
                    title="Speak answer out loud"
                  >
                    {audioPlaybackId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" /> <span className="text-[9px]">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" /> <span className="text-[9px]">Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-9 h-9 rounded-full bg-agri-soft border border-agri-border flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin-slow text-agri-accent" />
            </div>
            <div className="bg-white border border-agri-border rounded-[22px] rounded-tl-none p-4 shadow-sm text-sm text-agri-muted dark:bg-zinc-900 dark:border-zinc-805">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-agri-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-agri-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-agri-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                <span className="text-xs text-agri-muted ml-1 font-medium">AI compiling farming recommendations...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      {messages.length === 1 && (
        <div className="p-4 bg-agri-soft/30 border-t border-agri-border dark:bg-zinc-950/30 dark:border-zinc-800">
          <p className="text-xs font-semibold text-agri-muted mb-2.5">Suggested Agronomy Enquiries:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(p);
                  handleSend(p);
                }}
                className="bg-white hover:bg-agri-soft hover:text-agri-deep text-xs text-agri-muted font-medium px-4 py-2 rounded-full border border-agri-border hover:border-agri-sage transition-all text-left shadow-sm dark:bg-zinc-850 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-4 bg-white border-t border-agri-border flex items-center gap-3 dark:bg-zinc-900 dark:border-zinc-800">
        {speechSupported && (
          <button
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
              isListening
                ? "bg-red-50 text-red-600 animate-pulse border border-red-200"
                : "bg-agri-soft hover:bg-[#8BC34A22] text-agri-deep border border-agri-border"
            }`}
            title={isListening ? "Listening..." : "Dictate query via voice"}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
          placeholder={isListening ? "Listening to your voice..." : "Describe a crop symptom, pest, or fertilizer question..."}
          className="flex-1 bg-agri-soft/30 border border-agri-border hover:border-agri-sage focus:border-agri-accent rounded-2xl px-5 py-3.5 text-sm outline-none transition-all disabled:opacity-50 dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || loading}
          className="bg-agri-deep hover:bg-agri-dark text-white p-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:hover:bg-agri-deep shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
