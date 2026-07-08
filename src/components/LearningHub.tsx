import React, { useState } from "react";
import { 
  BookOpen, PlayCircle, HelpCircle, Award, Compass, 
  Search, ChevronDown, ChevronUp, FileText, CheckCircle, 
  MessageCircle, Star 
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: "Best Practices" | "Soil Science" | "Pest Protection" | "Smart Gear";
  summary: string;
  readTime: string;
  author: string;
}

interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  platform: string;
  category: string;
  thumbnail: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function LearningHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  const articles: Article[] = [
    {
      id: "1",
      title: "Sustainable Soil Micro-Nutrient Management for Kharif Crops",
      category: "Soil Science",
      summary: "Understand the synergy of Zinc, Boron, and organic composts during initial sowing. Correct micro-nutrient deficiencies before severe vegetative yellowing occurs.",
      readTime: "5 min read",
      author: "Dr. Arvind Shrivastava (KVK Indore)"
    },
    {
      id: "2",
      title: "Drip Irrigation Calibration & Evapotranspiration Calculations",
      category: "Best Practices",
      summary: "A practical walkthrough on regulating sub-surface pipe pressures depending on daily heatwave warnings and moisture depletion parameters.",
      readTime: "7 min read",
      author: "Er. Ramesh Patel (Agri-Engineer)"
    },
    {
      id: "3",
      title: "Integrated Pest Control Protocols for Soybean Girdle Beetle",
      category: "Pest Protection",
      summary: "Combine pheromone traps, chemical chlorantraniliprole applications, and biological neem sprays to safeguard stem branches without harming vital honeybees.",
      readTime: "6 min read",
      author: "Prof. Sunita Mehta (Horticulturist)"
    }
  ];

  const videos: TutorialVideo[] = [
    {
      id: "v1",
      title: "How to properly calibrate an NPK spreader",
      duration: "12:30",
      platform: "YouTube",
      category: "Equipment Calibration",
      thumbnail: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=350&auto=format&fit=crop"
    },
    {
      id: "v2",
      title: "Identifying early signs of Stem Rot in Legumes",
      duration: "08:15",
      platform: "AgriVideo",
      category: "Pathology Detection",
      thumbnail: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=350&auto=format&fit=crop"
    }
  ];

  const FAQs: FAQItem[] = [
    {
      question: "What is the perfect soil pH balance for soybean cultivation?",
      answer: "Soybeans thrive best in neutral to slightly acidic soils with a pH ranging between 6.0 and 6.8. If your soil pH falls below 5.5, apply agricultural lime (calcium carbonate) to neutralize soil acids."
    },
    {
      question: "How do I calculate seed germination percentage before sowing?",
      answer: "Place exactly 100 seeds between damp paper towels, wrap them securely inside a warm room, and count the number of sprouts after 5-7 days. A germination rate above 85% is ideal for dense yield profiles."
    },
    {
      question: "What are the core requirements to qualify for PM-KISAN subsidy?",
      answer: "Eligible farmers must hold agricultural land titles registered in their names. Exclusions apply to institutional landowners, retired professionals, or income tax payers."
    }
  ];

  const filteredArticles = articles.filter(art =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8" id="learning-hub-panel">
      {/* Top Banner */}
      <div className="border-b border-agri-border pb-5 dark:border-zinc-800">
        <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Farmer Knowledge & Learning Hub</h2>
        <p className="text-xs text-agri-muted">Examine peer-reviewed agronomy papers, watch machine calibrations, and unlock verified best practices.</p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-[32px] border border-agri-border p-5 shadow-sm flex items-center justify-between gap-4 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-agri-muted absolute left-3.5 top-4" />
          <input
            type="text"
            placeholder="Search learning articles, expert tips, or crop guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-agri-soft/30 border border-agri-border rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:border-agri-accent outline-none transition-all dark:bg-zinc-800/40 dark:border-zinc-800 text-agri-text dark:text-zinc-100 font-semibold"
          />
        </div>
      </div>

      {/* Main Grid: Articles vs Video tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Articles (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-agri-accent" /> Featured Agronomy Articles
            </h3>

            <div className="space-y-6">
              {filteredArticles.map((art) => (
                <div 
                  key={art.id} 
                  className="group border-b border-agri-border dark:border-zinc-800 pb-6 last:border-b-0 last:pb-0 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-agri-border bg-agri-soft/50 text-agri-deep dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400">
                      {art.category}
                    </span>
                    <span className="text-[10px] text-agri-muted font-mono">{art.readTime}</span>
                  </div>

                  <h4 className="font-serif text-base font-semibold text-agri-dark dark:text-zinc-200 group-hover:text-agri-accent transition-colors">
                    {art.title}
                  </h4>

                  <p className="text-xs text-agri-muted leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-agri-muted font-semibold">
                    <span>Written by:</span>
                    <strong className="text-agri-dark dark:text-zinc-300 font-bold">{art.author}</strong>
                  </div>
                </div>
              ))}

              {filteredArticles.length === 0 && (
                <p className="text-xs text-agri-muted text-center py-6">No articles matched your search query. Try typing 'soil' or 'pest'.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Videos & Expert Advice (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Videos */}
          <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-agri-accent" /> Video Demonstrations
            </h3>

            <div className="space-y-4">
              {videos.map((vid) => (
                <div 
                  key={vid.id} 
                  className="border border-agri-border dark:border-zinc-800 rounded-2xl overflow-hidden bg-agri-soft/10 dark:bg-zinc-950/20 group cursor-pointer"
                >
                  <div className="relative aspect-video">
                    <img 
                      src={vid.thumbnail} 
                      alt={vid.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 referrer-policy='no-referrer'" 
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="w-10 h-10 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-[9px] font-bold text-agri-accent uppercase tracking-wider block">{vid.category}</span>
                    <h4 className="font-serif text-sm font-semibold text-agri-dark dark:text-zinc-200">{vid.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Tip of the day */}
          <div className="bg-[#8BC34A1F] border border-[#8BC34A33] rounded-[32px] p-6 space-y-3 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="font-serif text-base font-semibold text-agri-deep dark:text-emerald-400 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-agri-accent" /> Expert Advisory Note
            </h3>
            <p className="text-xs text-agri-dark dark:text-zinc-200 leading-relaxed font-semibold">
              "Never apply chemical insecticides during early morning crop pollination windows. Crop-foraging honeybees are highly active between 7:00 AM and 10:00 AM. Shift spraying to calm dusk periods."
            </p>
            <span className="text-[10px] text-agri-muted block font-bold">- KVK National Agronomy Panel, 2026</span>
          </div>
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-agri-accent" /> Agronomy FAQ Accordion
        </h3>

        <div className="space-y-4">
          {FAQs.map((faq, idx) => {
            const isOpen = faqOpenIndex === idx;
            return (
              <div 
                key={idx} 
                className="border border-agri-border dark:border-zinc-850 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left p-4 bg-agri-soft/10 dark:bg-zinc-950/20 text-agri-dark dark:text-zinc-200 font-serif font-semibold text-sm transition-colors hover:bg-agri-soft/20"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-agri-muted" /> : <ChevronDown className="w-4 h-4 text-agri-muted" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border-t border-agri-border dark:border-zinc-850 text-xs text-agri-muted leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
