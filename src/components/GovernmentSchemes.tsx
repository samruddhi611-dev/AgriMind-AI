import React, { useState } from "react";
import { Search, Bookmark, Gavel, HelpCircle, ExternalLink, Calendar, CheckSquare } from "lucide-react";
import { GovernmentScheme } from "../types";

const INITIAL_SCHEMES: GovernmentScheme[] = [
  {
    id: "pm_kisan",
    title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Central",
    department: "Ministry of Agriculture & Farmers Welfare",
    eligibility: "All small and marginal landholding farmer families with cultivable land in their names.",
    benefit: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.",
    applyLink: "https://pmkisan.gov.in/"
  },
  {
    id: "pmfby",
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "Central",
    department: "Department of Agriculture, Cooperation & Farmers Welfare",
    eligibility: "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
    benefit: "Comprehensive insurance coverage against crop damage due to non-preventable natural calamities. Premium capped at 1.5% to 2% only.",
    applyLink: "https://pmfby.gov.in/"
  },
  {
    id: "soil_health",
    title: "National Soil Health Card Scheme",
    category: "Central",
    department: "Department of Agriculture & Cooperation",
    eligibility: "All farmers owning operational cultivable lands across all Indian states.",
    benefit: "Subsidized soil testing every 2 years. Reports detailing nitrogen, phosphorus, and mineral deficiencies along with dynamic fertilizer suggestions.",
    applyLink: "https://soilhealth.dac.gov.in/"
  },
  {
    id: "rythu_bandhu",
    title: "Rythu Bandhu (Agriculture Investment Support Scheme)",
    category: "State",
    department: "Government of Telangana",
    eligibility: "Registered agricultural landowning farmers in the State of Telangana.",
    benefit: "Investment support of ₹5,000 per acre per season for purchasing inputs like seeds, fertilizers, and pesticide treatments.",
    applyLink: "http://rythubandhu.telangana.gov.in/"
  },
  {
    id: "krishi_sinchayee",
    title: "PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)",
    category: "Central",
    department: "Ministry of Water Resources & River Development",
    eligibility: "Farmers interested in shifting to micro-irrigation (drip/sprinkler systems). Self-Help Groups are eligible.",
    benefit: "Up to 55% financial subsidy for small/marginal farmers and 45% for other farmers on micro-irrigation hardware installations.",
    applyLink: "https://pmksy.gov.in/"
  }
];

export default function GovernmentSchemes() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(INITIAL_SCHEMES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["pm_kisan", "soil_health"]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.benefit.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8" id="government-schemes-panel">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-agri-border pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Government Farming Schemes</h2>
          <p className="text-xs text-agri-muted">Explore financial grants, crop insurances, and irrigation subsidies backed by Central and State councils.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[32px] border border-agri-border p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <div className="flex flex-wrap gap-2">
          {["All", "Central", "State"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-all border ${
                activeCategory === cat
                  ? "bg-[#8BC34A26] text-agri-deep border-[#8BC34A44] font-bold"
                  : "bg-agri-soft/50 hover:bg-agri-soft text-agri-muted border-agri-border dark:bg-zinc-800 dark:border-zinc-700"
              }`}
            >
              {cat} Schemes
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-agri-muted absolute left-3.5 top-4" />
          <input
            type="text"
            placeholder="Search key benefits or departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-agri-soft/30 border border-agri-border rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:border-agri-accent outline-none transition-all dark:bg-zinc-800/40 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSchemes.map((scheme) => {
          const isBookmarked = bookmarkedIds.includes(scheme.id);
          return (
            <div
              key={scheme.id}
              className="bg-white rounded-[32px] border border-agri-border hover:border-agri-sage p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-5 relative group dark:bg-zinc-900 dark:border-zinc-800"
            >
              {/* Category Badge & Bookmark Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-agri-soft text-agri-deep border-agri-border dark:bg-zinc-850 dark:border-zinc-800 dark:text-emerald-400">
                  {scheme.category} Council Program
                </span>
                <button
                  onClick={() => toggleBookmark(scheme.id)}
                  className="p-1.5 rounded-full hover:bg-agri-soft text-agri-muted hover:text-agri-accent transition-colors"
                  title="Bookmark scheme"
                >
                  <Bookmark className={`w-4.5 h-4.5 ${
                    isBookmarked ? "text-agri-accent fill-agri-accent" : "text-agri-border"
                  }`} />
                </button>
              </div>

              {/* Title & Department */}
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 leading-snug group-hover:text-agri-accent transition-colors">
                  {scheme.title}
                </h3>
                <span className="text-[10px] text-agri-muted uppercase tracking-widest font-semibold block">{scheme.department}</span>
              </div>

              {/* Eligibility & Benefit Cards */}
              <div className="space-y-3.5 pt-4 border-t border-agri-border dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-agri-muted font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-agri-muted shrink-0" /> Minimum Eligibility
                  </span>
                  <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-semibold">{scheme.eligibility}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-agri-accent font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-agri-accent shrink-0" /> Subsidy & Financial Grants
                  </span>
                  <p className="text-xs text-agri-dark dark:text-zinc-200 leading-relaxed font-bold">{scheme.benefit}</p>
                </div>
              </div>

              {/* Apply / Link out */}
              <div className="pt-2">
                <a
                  href={scheme.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-agri-accent hover:text-agri-deep hover:underline transition-colors"
                >
                  Visit Official Application Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {filteredSchemes.length === 0 && (
          <div className="col-span-2 border border-dashed border-agri-border bg-agri-soft/20 rounded-[32px] p-12 text-center flex flex-col justify-center items-center dark:border-zinc-850 dark:bg-zinc-900/10 min-h-[300px]">
            <Gavel className="w-12 h-12 text-agri-muted/50 mb-3" />
            <p className="text-agri-dark dark:text-zinc-200 font-serif text-lg font-medium mb-1">No Schemes Found</p>
            <p className="text-xs text-agri-muted leading-relaxed">Search keywords like 'crop', 'soil', 'Rythu' or filter Central vs State.</p>
          </div>
        )}
      </div>
    </div>
  );
}
