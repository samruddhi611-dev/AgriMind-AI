import React, { useState } from "react";
import { Search, TrendingUp, TrendingDown, MapPin, Tag, Star, BarChart3 } from "lucide-react";
import { CropPrice } from "../types";

const INITIAL_PRICES: CropPrice[] = [
  {
    id: "wheat_indore",
    cropName: "Wheat (Malwara Specimen)",
    marketName: "Indore Mandi",
    currentPrice: 2450,
    lastPrice: 2400,
    unit: "Quintal",
    state: "Madhya Pradesh",
    category: "Cereal"
  },
  {
    id: "paddy_karnal",
    cropName: "Paddy (Basmati Sharbati)",
    marketName: "Karnal Mandi",
    currentPrice: 3850,
    lastPrice: 3900,
    unit: "Quintal",
    state: "Haryana",
    category: "Cereal"
  },
  {
    id: "cotton_rajkot",
    cropName: "Cotton (Long Staple)",
    marketName: "Rajkot Mandi",
    currentPrice: 6200,
    lastPrice: 6050,
    unit: "Quintal",
    state: "Gujarat",
    category: "Cash Crop"
  },
  {
    id: "tomato_nashik",
    cropName: "Tomato (Desi Local)",
    marketName: "Nashik Mandi",
    currentPrice: 1500,
    lastPrice: 1200,
    unit: "Quintal",
    state: "Maharashtra",
    category: "Vegetable"
  },
  {
    id: "soybean_indore",
    cropName: "Soybean (Yellow Seed)",
    marketName: "Indore Mandi",
    currentPrice: 5800,
    lastPrice: 5950,
    unit: "Quintal",
    state: "Madhya Pradesh",
    category: "Pulse"
  },
  {
    id: "mango_lucknow",
    cropName: "Mango (Dasheri Class A)",
    marketName: "Lucknow Mandi",
    currentPrice: 4200,
    lastPrice: 3900,
    unit: "Quintal",
    state: "Uttar Pradesh",
    category: "Fruit"
  }
];

export default function MarketDesk() {
  const [prices, setPrices] = useState<CropPrice[]>(INITIAL_PRICES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [favorites, setFavorites] = useState<string[]>(["wheat_indore", "tomato_nashik"]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const filteredPrices = prices.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(search.toLowerCase()) ||
      crop.state.toLowerCase().includes(search.toLowerCase()) ||
      crop.marketName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || crop.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8" id="market-desk-panel">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-agri-border pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Live Crop Prices (Agmarknet)</h2>
          <p className="text-xs text-agri-muted">Live transaction index trackers for commodities across nearby states.</p>
        </div>
      </div>

      {/* Categories & Search Filters */}
      <div className="bg-white rounded-[32px] border border-agri-border p-5 shadow-sm flex flex-col lg:flex-row gap-5 items-center justify-between dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {["All", "Cereal", "Pulse", "Vegetable", "Fruit", "Cash Crop"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-semibold px-4 py-2.5 rounded-full transition-all border ${
                activeCategory === cat
                  ? "bg-[#8BC34A26] text-agri-deep border-[#8BC34A44] font-bold"
                  : "bg-agri-soft/50 hover:bg-agri-soft text-agri-muted border-agri-border dark:bg-zinc-800 dark:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-agri-muted absolute left-3.5 top-4" />
          <input
            type="text"
            placeholder="Search crop, state or Mandi market..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-agri-soft/30 border border-agri-border rounded-2xl py-3.5 pl-10 pr-4 text-xs focus:border-agri-accent outline-none transition-all dark:bg-zinc-800/40 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Main Grid: Commodity list vs details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Commodity Index Table */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-agri-border shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
          <div className="p-6 border-b border-agri-border dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100">Mandi Commodity Indices</h3>
            <span className="text-[10px] text-agri-muted font-bold uppercase tracking-widest">Updates: Daily at 10 AM IST</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-agri-text dark:text-zinc-300">
              <thead className="bg-agri-soft/40 dark:bg-zinc-850/50 text-[10px] text-agri-muted font-bold uppercase tracking-widest border-b border-agri-border dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Crop Name</th>
                  <th className="px-4 py-4">Mandi Market</th>
                  <th className="px-4 py-4 text-right">Current Index Price</th>
                  <th className="px-4 py-4 text-right">Trend / Offset</th>
                  <th className="px-6 py-4 text-center">Favorite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-agri-border dark:divide-zinc-800 font-medium">
                {filteredPrices.length > 0 ? (
                  filteredPrices.map((crop) => {
                    const priceDiff = crop.currentPrice - crop.lastPrice;
                    const pctDiff = (priceDiff / crop.lastPrice) * 100;
                    const isUp = priceDiff >= 0;

                    return (
                      <tr key={crop.id} className="hover:bg-agri-soft/10 dark:hover:bg-zinc-850/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-agri-accent shrink-0" />
                            <div>
                              <span className="text-agri-dark dark:text-zinc-100 font-serif text-base font-semibold block">{crop.cropName}</span>
                              <span className="text-[10px] text-agri-muted uppercase tracking-wider font-semibold">{crop.category} • {crop.state}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-agri-text dark:text-zinc-300 text-xs sm:text-sm font-semibold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-agri-muted shrink-0" /> {crop.marketName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-agri-dark dark:text-zinc-100 font-bold text-sm sm:text-base block">₹{crop.currentPrice}</span>
                          <span className="text-[10px] text-agri-muted block">per {crop.unit}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-[10px] font-bold inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                            isUp ? "bg-emerald-50 text-emerald-750 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-red-50 text-red-750 border-red-100 dark:bg-red-950/20 dark:text-red-400"
                          }`}>
                            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {isUp ? "+" : ""}{pctDiff.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleFavorite(crop.id)}
                            className="p-1.5 rounded-full hover:bg-agri-soft transition-all text-agri-muted hover:text-amber-500"
                          >
                            <Star className={`w-4 h-4 ${
                              favorites.includes(crop.id)
                                ? "text-amber-500 fill-amber-500"
                                : "text-agri-border"
                            }`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-agri-muted font-medium">No commodity records matched your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Trends Analytics Info Card (Right Column) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 flex items-center gap-2 border-b border-agri-border dark:border-zinc-800 pb-3.5">
              <BarChart3 className="w-5 h-5 text-agri-accent" /> Mandi Intelligence
            </h3>

            <div className="space-y-5">
              <div className="bg-agri-soft/50 border border-agri-border rounded-2xl p-5 text-xs space-y-1.5 dark:bg-zinc-800/20 dark:border-zinc-800">
                <span className="font-bold text-agri-deep dark:text-agri-bright uppercase block tracking-wider text-[10px]">Monsoon Forecast Support</span>
                <p className="text-agri-muted leading-relaxed">Early projections of regular Monsoon rainfall lead to bumper sowing targets. Spot market buyers are maintaining conservative reserves, leading to transient price drops in cereals.</p>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-agri-muted uppercase tracking-widest">Fastest Growing Commodities</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-agri-text dark:text-zinc-300">
                    <span>Potato (Cold Storage)</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +12.4%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-agri-text dark:text-zinc-300">
                    <span>Red Gram (Tur)</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +6.8%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-agri-text dark:text-zinc-300">
                    <span>Mustard Seeds</span>
                    <span className="text-red-600 font-bold flex items-center gap-0.5"><TrendingDown className="w-3.5 h-3.5" /> -2.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
