import React, { useState, useRef, useEffect } from "react";
import { 
  Sprout, Calendar, TrendingUp, DollarSign, Plus, Trash2, 
  Map, ShieldAlert, Layers, HelpCircle, FileText, CheckCircle, 
  Archive, Compass, PenTool, RefreshCw 
} from "lucide-react";

interface FarmPlot {
  id: string;
  name: string;
  crop: string;
  size: string;
  status: "Sowing" | "Growing" | "Harvested" | "Fallow";
  sowingDate: string;
  harvestDate: string;
}

interface FinancialRecord {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: "Seed" | "Fertilizer" | "Pesticide" | "Tool";
  quantity: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export default function FarmManagement() {
  const [activeSubTab, setActiveSubTab] = useState<"plots" | "mapping" | "calendar" | "finance" | "inventory">("plots");

  // Plots State
  const [plots, setPlots] = useState<FarmPlot[]>([
    { id: "1", name: "Main Indore Field", crop: "Soybean", size: "4.5 Acres", status: "Growing", sowingDate: "2026-06-05", harvestDate: "2026-10-15" },
    { id: "2", name: "North Ridge Plot", crop: "Kharif Maize", size: "2.0 Acres", status: "Sowing", sowingDate: "2026-06-25", harvestDate: "2026-11-01" },
    { id: "3", name: "East Canal Orchard", crop: "Pomegranate", size: "1.5 Acres", status: "Growing", sowingDate: "2024-03-12", harvestDate: "2026-09-20" }
  ]);
  const [newPlotName, setNewPlotName] = useState("");
  const [newPlotCrop, setNewPlotCrop] = useState("Wheat");
  const [newPlotSize, setNewPlotSize] = useState("");
  const [newPlotStatus, setNewPlotStatus] = useState<"Sowing" | "Growing" | "Harvested" | "Fallow">("Sowing");

  // Mapping State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<{ x: number; y: number }[]>([]);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  // Financials State
  const [financials, setFinancials] = useState<FinancialRecord[]>([
    { id: "1", type: "expense", category: "Seeds", amount: 12500, date: "2026-06-06", description: "FMC Certified Soybean Seeds" },
    { id: "2", type: "expense", category: "Fertilizer", amount: 8400, date: "2026-06-10", description: "NPK 19:19:19 Bags" },
    { id: "3", type: "expense", category: "Labor", amount: 6000, date: "2026-06-15", description: "Seedbed prepping workforce" },
    { id: "4", type: "income", category: "Grain Sale", amount: 78000, date: "2026-06-01", description: "Rabi Wheat leftovers" }
  ]);
  const [finType, setFinType] = useState<"income" | "expense">("expense");
  const [finCategory, setFinCategory] = useState("Seeds");
  const [finAmount, setFinAmount] = useState("");
  const [finDesc, setFinDesc] = useState("");

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: "1", name: "Urea Fertilizer", category: "Fertilizer", quantity: "12 Bags", status: "In Stock" },
    { id: "2", name: "Certified Soybean Seeds", category: "Seed", quantity: "2 Bags", status: "Low Stock" },
    { id: "3", name: "Neem Oil Bio-Pesticide", category: "Pesticide", quantity: "5 Liters", status: "In Stock" },
    { id: "4", name: "Hand-held Sprayer", category: "Tool", quantity: "1 Unit", status: "In Stock" }
  ]);
  const [invName, setInvName] = useState("");
  const [invCat, setInvCat] = useState<"Seed" | "Fertilizer" | "Pesticide" | "Tool">("Seed");
  const [invQty, setInvQty] = useState("");

  // Plot Functions
  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotName.trim() || !newPlotSize.trim()) return;
    const newPlot: FarmPlot = {
      id: Date.now().toString(),
      name: newPlotName,
      crop: newPlotCrop,
      size: `${newPlotSize} Acres`,
      status: newPlotStatus,
      sowingDate: new Date().toISOString().split("T")[0],
      harvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };
    setPlots([...plots, newPlot]);
    setNewPlotName("");
    setNewPlotSize("");
  };

  const handleDeletePlot = (id: string) => {
    setPlots(plots.filter(p => p.id !== id));
  };

  // Financial Functions
  const handleAddFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finAmount || isNaN(parseFloat(finAmount)) || !finDesc.trim()) return;
    const record: FinancialRecord = {
      id: Date.now().toString(),
      type: finType,
      category: finCategory,
      amount: parseFloat(finAmount),
      date: new Date().toISOString().split("T")[0],
      description: finDesc
    };
    setFinancials([...financials, record]);
    setFinAmount("");
    setFinDesc("");
  };

  const handleDeleteFinancial = (id: string) => {
    setFinancials(financials.filter(f => f.id !== id));
  };

  const totalIncome = financials.filter(f => f.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = financials.filter(f => f.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Inventory Functions
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || !invQty.trim()) return;
    const item: InventoryItem = {
      id: Date.now().toString(),
      name: invName,
      category: invCat,
      quantity: invQty,
      status: "In Stock"
    };
    setInventory([...inventory, item]);
    setInvName("");
    setInvQty("");
  };

  // Field Mapping drawing logic
  useEffect(() => {
    if (activeSubTab !== "mapping") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and redraw grid
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background texture grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw field boundary polygon
    if (markers.length > 0) {
      ctx.fillStyle = "rgba(139, 195, 74, 0.25)";
      ctx.strokeStyle = "#8BC34A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(markers[0].x, markers[0].y);
      for (let i = 1; i < markers.length; i++) {
        ctx.lineTo(markers[i].x, markers[i].y);
      }
      if (markers.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw markers
      markers.forEach((m, idx) => {
        ctx.fillStyle = idx === 0 ? "#E67E22" : "#4CAF50";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "10px monospace";
        ctx.fillText((idx + 1).toString(), m.x - 3, m.y - 10);
      });
    }
  }, [markers, activeSubTab]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newMarkers = [...markers, { x, y }];
    setMarkers(newMarkers);

    // Dynamic field calculation mockup (based on shopper polygon area formula)
    if (newMarkers.length > 2) {
      let area = 0;
      for (let i = 0; i < newMarkers.length; i++) {
        const j = (i + 1) % newMarkers.length;
        area += newMarkers[i].x * newMarkers[j].y;
        area -= newMarkers[j].x * newMarkers[i].y;
      }
      const calculatedAcres = Math.abs(area / 2) * 0.00015; // mock multiplier for acreage scale
      setCalculatedArea(parseFloat(calculatedAcres.toFixed(2)));
    }
  };

  const clearCanvas = () => {
    setMarkers([]);
    setCalculatedArea(0);
  };

  return (
    <div className="space-y-8" id="farm-management-panel">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-agri-border pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Farm Management Ecosystem</h2>
          <p className="text-xs text-agri-muted">Oversee multiple plots, map fields via GPS visualizer, trace sowing calendars, and manage balances.</p>
        </div>
      </div>

      {/* Sub tabs bar */}
      <div className="bg-white rounded-[32px] border border-agri-border p-4 shadow-sm flex flex-wrap gap-2 dark:bg-zinc-900 dark:border-zinc-800">
        {[
          { id: "plots", label: "My Plots", icon: Sprout },
          { id: "mapping", label: "Field Mapping (GPS)", icon: Map },
          { id: "calendar", label: "Crop Calendar", icon: Calendar },
          { id: "finance", label: "Expense & Profits", icon: DollarSign },
          { id: "inventory", label: "Farm Inventory", icon: Archive }
        ].map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full border transition-all ${
                activeSubTab === sub.id
                  ? "bg-[#8BC34A26] text-agri-deep border-[#8BC34A44] dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400"
                  : "bg-agri-soft/50 hover:bg-agri-soft text-agri-muted border-agri-border dark:bg-zinc-850 dark:border-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" /> {sub.label}
            </button>
          );
        })}
      </div>

      {/* Render Sub Tabs dynamically */}
      {activeSubTab === "plots" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List of current plots */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-agri-accent" /> Active Farm Plots
              </h3>

              <div className="space-y-4">
                {plots.map((plot) => (
                  <div 
                    key={plot.id} 
                    className="border border-agri-border rounded-2xl p-5 hover:border-agri-sage bg-agri-soft/10 dark:bg-zinc-850/20 dark:border-zinc-800 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-agri-dark dark:text-zinc-200">{plot.name}</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-agri-border bg-white text-agri-muted dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                          {plot.size}
                        </span>
                      </div>
                      <div className="text-xs text-agri-muted">
                        Crop: <strong className="text-agri-dark dark:text-zinc-300">{plot.crop}</strong> • Status: 
                        <span className={`ml-1 font-bold ${
                          plot.status === "Growing" ? "text-emerald-600" :
                          plot.status === "Sowing" ? "text-blue-500" : "text-amber-600"
                        }`}>{plot.status}</span>
                      </div>
                      <div className="text-[10px] text-agri-muted">
                        Sown: {plot.sowingDate} | Est. Harvest: {plot.harvestDate}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlot(plot.id)}
                      className="p-2 bg-white rounded-full border border-agri-border text-red-500 hover:bg-red-50 hover:text-red-600 dark:bg-zinc-800 dark:border-zinc-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sowing addition panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4">Register New Plot</h3>
              <form onSubmit={handleAddPlot} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Plot Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Hill Terrace"
                    value={newPlotName}
                    onChange={(e) => setNewPlotName(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Crop Variety</label>
                    <select
                      value={newPlotCrop}
                      onChange={(e) => setNewPlotCrop(e.target.value)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                    >
                      {["Wheat", "Soybean", "Rice (Paddy)", "Maize", "Cotton", "Sugarcane", "Mustard", "Legumes"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 3.2"
                      value={newPlotSize}
                      onChange={(e) => setNewPlotSize(e.target.value)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Current Phase</label>
                  <select
                    value={newPlotStatus}
                    onChange={(e) => setNewPlotStatus(e.target.value as any)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                  >
                    <option value="Sowing">Sowing Period</option>
                    <option value="Growing">Vegetative Growth</option>
                    <option value="Harvested">Harvest Completed</option>
                    <option value="Fallow">Resting / Fallow</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3 px-4 rounded-full shadow transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-agri-bright" /> Create Plot
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "mapping" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Canvas area */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100">Boundary GPS Plotter</h3>
                <p className="text-xs text-agri-muted">Click inside the canvas grid to drop boundary pins and sketch your farm coordinate map.</p>
              </div>
              <button
                onClick={clearCanvas}
                className="bg-agri-soft hover:bg-agri-sage/30 text-agri-deep text-xs font-bold px-4 py-2 rounded-full border border-agri-border transition-colors flex items-center gap-1.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Map
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl border border-agri-border overflow-hidden bg-agri-soft/10 dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-center">
              {markers.length === 0 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 bg-transparent pointer-events-none">
                  <PenTool className="w-10 h-10 text-agri-muted/40 mb-3" />
                  <p className="text-xs text-agri-muted font-semibold max-w-sm">Tap on 3 or more points on the grid to map fields and compute approximate surface area.</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={700}
                height={380}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair block"
              />
            </div>
          </div>

          {/* Results column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
              <h3 className="font-serif text-base font-semibold text-agri-dark dark:text-zinc-100 border-b border-agri-border dark:border-zinc-800 pb-3">
                Boundary Summary
              </h3>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-agri-muted">Total Boundary Pins</span>
                  <span className="font-mono font-bold text-agri-dark dark:text-zinc-200">{markers.length} Vertices</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-agri-muted">Estimated Perimeter</span>
                  <span className="font-mono font-bold text-agri-dark dark:text-zinc-200">
                    {markers.length > 1 ? `${(markers.length * 48).toString()} meters` : "0 meters"}
                  </span>
                </div>

                <div className="p-4 bg-agri-soft/40 border border-agri-border rounded-2xl dark:bg-zinc-800/20 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-agri-accent uppercase tracking-wider block">Computed Farm Surface Area</span>
                  <div className="text-2xl font-bold text-agri-deep dark:text-agri-bright">
                    {calculatedArea} <span className="text-xs font-semibold text-agri-muted">Acres</span>
                  </div>
                </div>

                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 flex gap-2 text-xs leading-relaxed">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-yellow-600" />
                  <p>Acreage calculations are simulated based on pixel metrics. Connect IoT RTK GPS receivers for 1.2cm sub-millimeter precision surveys.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "calendar" && (
        <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-6 flex items-center gap-2">
            <Compass className="w-5 h-5 text-agri-accent" /> Sowing & Harvest Calendar 2026
          </h3>

          <div className="relative border-l-2 border-agri-border dark:border-zinc-800 pl-6 ml-4 space-y-8">
            <div className="relative">
              <span className="absolute -left-10 top-0.5 bg-emerald-600 text-white font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow">
                1
              </span>
              <div className="space-y-1">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Early June Sowing</span>
                <h4 className="font-serif font-bold text-agri-dark dark:text-zinc-200">Soybean Sowing Window</h4>
                <p className="text-xs text-agri-muted max-w-xl leading-relaxed">
                  Apply pre-sowing fertilizer (NPK 12:32:16) at 50kg/acre. Maintain optimum row spacing of 45cm for standard vegetative aeration.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-10 top-0.5 bg-blue-500 text-white font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow">
                2
              </span>
              <div className="space-y-1">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block">Late June Irrigation</span>
                <h4 className="font-serif font-bold text-agri-dark dark:text-zinc-200">First Foliar Herbicide Spray</h4>
                <p className="text-xs text-agri-muted max-w-xl leading-relaxed">
                  Apply post-emergence weed killers inside Maize plots (e.g., Tembotrione) within 15-20 days of seedbed drilling. Ensure soil retains residual moisture.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-10 top-0.5 bg-purple-500 text-white font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow">
                3
              </span>
              <div className="space-y-1">
                <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider block">September Harvest Prep</span>
                <h4 className="font-serif font-bold text-agri-dark dark:text-zinc-200">Orchard Yield Sampling</h4>
                <p className="text-xs text-agri-muted max-w-xl leading-relaxed">
                  Examine Pomegranate rind color and seed aril maturity. Spray neem oils to prevent fruit borers 14 days prior to picking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "finance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Balance sheet display */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-5">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100">Farming Balance Sheet</h3>

              <div className="space-y-3.5">
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-center justify-between dark:bg-emerald-950/20 dark:border-emerald-900">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block">Total Income</span>
                    <span className="text-xl font-bold font-mono">₹{totalIncome}</span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600 opacity-60" />
                </div>

                <div className="p-4 bg-red-50 text-red-800 rounded-2xl border border-red-100 flex items-center justify-between dark:bg-red-950/20 dark:border-red-900">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-red-700 dark:text-red-400 block">Total Expenses</span>
                    <span className="text-xl font-bold font-mono">₹{totalExpense}</span>
                  </div>
                  <TrendingUp className="w-8 h-8 text-red-600 opacity-60 rotate-180" />
                </div>

                <div className="p-5 bg-agri-soft/40 border border-agri-border rounded-2xl dark:bg-zinc-800/20 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-agri-accent uppercase tracking-wider block">Net Seasonal Profit</span>
                  <div className={`text-2xl font-bold font-mono ${netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600"}`}>
                    ₹{netProfit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Inputs and logs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Financial form */}
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4">Post Transaction Log</h3>
              <form onSubmit={handleAddFinancial} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase block">Type</label>
                  <select
                    value={finType}
                    onChange={(e) => setFinType(e.target.value as any)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase block">Category</label>
                  <select
                    value={finCategory}
                    onChange={(e) => setFinCategory(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                  >
                    {finType === "expense" ? (
                      ["Seeds", "Fertilizer", "Pesticide", "Irrigation", "Labor", "Diesel/Fuel", "Other"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    ) : (
                      ["Grain Sale", "Orchard Sale", "Subsidy Grant", "Renting Gear", "Other"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase block">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={finAmount}
                    onChange={(e) => setFinAmount(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase block">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urea bags purchase"
                    value={finDesc}
                    onChange={(e) => setFinDesc(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-4 pt-2">
                  <button
                    type="submit"
                    className="bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3 px-6 rounded-full shadow transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-agri-bright" /> Record Transaction
                  </button>
                </div>
              </form>
            </div>

            {/* Ledger logs */}
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4">General Ledger Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-agri-text dark:text-zinc-300">
                  <thead className="bg-agri-soft/40 dark:bg-zinc-850/50 text-[10px] text-agri-muted font-bold uppercase tracking-widest border-b border-agri-border dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-agri-border dark:divide-zinc-800 font-medium">
                    {financials.map((f) => (
                      <tr key={f.id} className="hover:bg-agri-soft/10 dark:hover:bg-zinc-850/20 transition-colors">
                        <td className="px-4 py-3.5 font-mono">{f.date}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            f.type === "income" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
                          }`}>
                            {f.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-agri-dark dark:text-zinc-200">{f.category}</td>
                        <td className="px-4 py-3.5 text-agri-muted max-w-[150px] truncate">{f.description}</td>
                        <td className={`px-4 py-3.5 text-right font-mono font-bold ${f.type === "income" ? "text-emerald-700" : "text-red-600"}`}>
                          ₹{f.amount}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteFinancial(f.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inventory status list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Archive className="w-5 h-5 text-agri-accent" /> Sown Commodities & Inputs Stockpile
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-agri-border rounded-2xl p-4 bg-agri-soft/20 dark:bg-zinc-850/20 dark:border-zinc-800 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] text-agri-muted uppercase tracking-wider block font-semibold">{item.category}</span>
                        <h4 className="font-serif font-bold text-agri-dark dark:text-zinc-200">{item.name}</h4>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.status === "In Stock" ? "bg-emerald-50 text-emerald-800 border-emerald-100" :
                        item.status === "Low Stock" ? "bg-yellow-50 text-yellow-800 border-yellow-100" : "bg-red-50 text-red-800 border-red-100"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-agri-border dark:border-zinc-800 text-xs font-bold text-agri-deep dark:text-zinc-200">
                      <span>Stock level</span>
                      <span className="font-mono">{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Addition column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4">Log Inventory Entry</h3>
              <form onSubmit={handleAddInventory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase block">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Di-Ammonium Phosphate (DAP)"
                    value={invName}
                    onChange={(e) => setInvName(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase block">Type</label>
                    <select
                      value={invCat}
                      onChange={(e) => setInvCat(e.target.value as any)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                    >
                      <option value="Seed">Seeds</option>
                      <option value="Fertilizer">Fertilizers</option>
                      <option value="Pesticide">Pesticides</option>
                      <option value="Tool">Farm Tools</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase block">Quantity / Volume</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10 Bags, 3 Liters"
                      value={invQty}
                      onChange={(e) => setInvQty(e.target.value)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3 px-4 rounded-full shadow transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-agri-bright" /> Log Stock
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
