import React, { useState } from "react";
import { 
  CheckSquare, Calendar, Bell, Clock, Plus, Trash2, 
  Droplet, ShieldAlert, Sparkles, AlertTriangle, AlertCircle, 
  HelpCircle, CheckCircle, Info, MapPin, TrendingUp, Leaf, Activity, Coins, Sprout, RefreshCw
} from "lucide-react";

interface FarmingTask {
  id: string;
  title: string;
  type: "Watering" | "Fertilizer" | "Spray" | "Harvest" | "General";
  date: string;
  time: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
}

export default function SmartPlanner() {
  const [tasks, setTasks] = useState<FarmingTask[]>([
    { id: "1", title: "Water East Ridge Pomegranates", type: "Watering", date: "2026-06-29", time: "06:00", completed: false, priority: "High" },
    { id: "2", title: "Apply Foliar Zinc Sulfate (NPK) on Potato fields", type: "Fertilizer", date: "2026-06-29", time: "09:30", completed: false, priority: "Medium" },
    { id: "3", title: "Spray organic bio-pesticide on tomato foliage", type: "Spray", date: "2026-06-30", time: "17:00", completed: false, priority: "High" },
    { id: "4", title: "Inspect Soybean rows for mildew symptoms", type: "General", date: "2026-06-29", time: "07:00", completed: true, priority: "Low" }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<FarmingTask["type"]>("General");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<FarmingTask["priority"]>("Medium");

  // Sub tab control
  const [subTab, setSubTab] = useState<"daily" | "ai_recommend">("daily");

  // AI Inputs
  const [soilType, setSoilType] = useState("Black Cotton Soil");
  const [region, setRegion] = useState("Indore, Madhya Pradesh");
  const [season, setSeason] = useState("Kharif (Monsoon)");
  const [rainfall, setRainfall] = useState(850); // in mm
  const [temperature, setTemperature] = useState(28); // in deg C
  const [humidity, setHumidity] = useState(65); // in %

  // AI Outputs
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>({
    cropName: "Kharif Soybean (JS 20-34)",
    expectedYield: "24-28 Quintals per Acre",
    waterRequirement: "Moderate (Prefers sprinkler or drip irrigation. 3 sessions per week during vegetative peak)",
    profitEstimate: "₹48,000 - ₹56,000 net profit per acre",
    growingPeriod: "115 Days (Sowing: July, Harvest: November)",
    organicFertilizers: "Well-decomposed vermicompost (2 tons/acre), Neem cake powder (200 kg/acre), Trichoderma viride seed treatment.",
    chemicalFertizers: "NPK 12:32:16 (55 kg/acre), Zinc Sulfate (10 kg/acre applied during initial soil prep).",
    applicationSchedule: "1. Basal stage: Entire organic compost + full dose of NPK during land preparation. \n2. Vegetative stage: Light top dressing of Urea (20 kg/acre) after 30 days. \n3. Flowering stage: Foliar spray of soluble Potassium (0:0:50, 1.5%) for capsule development.",
    precautions: "Do not spread chemical fertilizer under windy conditions to prevent leaf scorch. Keep a minimum spacing of 15 cm between row plants. Ensure soil pH is between 6.0 and 7.5."
  });

  const handleGetAiRecommendation = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      // Dynamic generation based on inputs for realistic simulation
      let crop = "Cotton (Hybrid BT)";
      let yieldEst = "12-15 Quintals per Acre";
      let water = "High. Maintain regular deep drip lines. Keep soil moisture at 60%.";
      let profit = "₹62,000 - ₹75,000 net profit per acre";
      let period = "160 Days (Long-term Kharif)";
      let organic = "Farmyard Manure (5 tons/acre), Bio-NPK liquid inoculum.";
      let chemical = "NPK 15:15:15 (75 kg/acre), Urea (40 kg/acre split in 2 top dressings).";
      let schedule = "Basal application at sowing, top-dressing at 45 days (squaring) and 90 days (flowering peak).";
      let precautions = "Monitor closely for pink bollworm infestations. Scout fields every 4 days. Avoid high nitrogen late in season.";

      if (soilType.includes("Black") && season.includes("Kharif")) {
        crop = "Soybean (JS 20-34)";
        yieldEst = "24-28 Quintals per Acre";
        water = "Moderate. Drip line watering 3 times a week is sufficient.";
        profit = "₹48,000 - ₹56,000 net profit per acre";
        period = "115 Days";
        organic = "Vermicompost (2 tons/acre), Neem Cake (200kg/acre).";
        chemical = "NPK 12:32:16 (55 kg/acre), Zinc Sulfate (10 kg/acre).";
        schedule = "Full organic & NPK at basal land prep; Urea (20kg/acre) after 30 days.";
        precautions = "Watch for stem fly damage. Ensure clear drainage lanes as waterlogging stunts root nodules.";
      } else if (season.includes("Rabi")) {
        crop = "Sharbati Wheat (M.P. Premium)";
        yieldEst = "20-24 Quintals per Acre";
        water = "Moderate. Requires 4-5 irrigation rounds at critical crown root initiation and milk stages.";
        profit = "₹44,000 - ₹52,000 net profit per acre";
        period = "130 Days (Winter Cycle)";
        organic = "Decomposed cow manure (3 tons/acre), Azotobacter bio-fertilizer.";
        chemical = "Urea (80 kg/acre split in 3 doses), Single Super Phosphate (SSP) (50 kg/acre).";
        schedule = "Full SSP + 1/3 Urea as basal; remaining Urea at first and second irrigation rounds.";
        precautions = "Prevent soil cracking; irrigate gently. Calibrate spacing to 22 cm rows for optimal sunlight interception.";
      } else if (season.includes("Zaid") || soilType.includes("Sandy")) {
        crop = "Green Gram / Moong Dal (IPM 02-3)";
        yieldEst = "6-8 Quintals per Acre";
        water = "Low. Highly drought resilient. 2-3 sprinklings are sufficient.";
        profit = "₹22,000 - ₹28,000 net profit per acre";
        period = "70 Days (Ultra short-term)";
        organic = "Neem leaf mulch, organic compost tea.";
        chemical = "DAP (Di-ammonium Phosphate) (40 kg/acre basal only).";
        schedule = "Single basal dressing at seed sowing. No split top-dressing required.";
        precautions = "Extremely sensitive to whiteflies which transmit yellow mosaic virus. Spray organic bio-agents early.";
      } else if (soilType.includes("Red") || soilType.includes("Laterite")) {
        crop = "Groundnut (K-6 Specimen)";
        yieldEst = "15-18 Quintals per Acre";
        water = "Moderate. Requires consistent light humidity. Avoid puddling.";
        profit = "₹38,000 - ₹46,000 net profit per acre";
        period = "110 Days";
        organic = "Gypsum (200 kg/acre during flowering to strengthen shells), compost.";
        chemical = "NPK 10:20:20 (45 kg/acre), Boron micro-nutrient (5 kg/acre).";
        schedule = "NPK + Boron during land preparation; Gypsum top-dressed at pegging stage (45 days).";
        precautions = "Gypsum pegging application is critical; without it, empty pods (pops) will occur.";
      }

      setAiResult({
        cropName: crop,
        expectedYield: yieldEst,
        waterRequirement: water,
        profitEstimate: profit,
        growingPeriod: period,
        organicFertilizers: organic,
        chemicalFertizers: chemical,
        applicationSchedule: schedule,
        precautions: precautions
      });
      setIsAiLoading(false);
    }, 1200);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: FarmingTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      type: newTaskType,
      date: newTaskDate || new Date().toISOString().split("T")[0],
      time: newTaskTime || "08:00",
      completed: false,
      priority: newTaskPriority
    };

    setTasks([task, ...tasks]);
    setNewTaskTitle("");
    setNewTaskDate("");
    setNewTaskTime("");
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8" id="smart-planner-panel">
      {/* Top Welcome Title Banner */}
      <div className="border-b border-agri-border pb-5 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Smart Planner & Advisories</h2>
          <p className="text-xs text-agri-muted">Choreograph daily schedules or generate expert AI-backed crop and fertilizer programs.</p>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex border-b border-agri-border dark:border-zinc-800 pb-px gap-6">
        <button
          onClick={() => setSubTab("daily")}
          className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            subTab === "daily"
              ? "border-[#8BC34A] text-agri-deep dark:text-[#8BC34A] font-extrabold"
              : "border-transparent text-agri-muted hover:text-agri-deep dark:text-zinc-500"
          }`}
        >
          📅 Tasks & Irrigation
        </button>
        <button
          onClick={() => setSubTab("ai_recommend")}
          className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            subTab === "ai_recommend"
              ? "border-[#8BC34A] text-agri-deep dark:text-[#8BC34A] font-extrabold"
              : "border-transparent text-agri-muted hover:text-agri-deep dark:text-zinc-500"
          }`}
        >
          🌱 AI Crop & Fertilizer Recommendations
        </button>
      </div>

      {subTab === "daily" ? (
        /* Grid structure: Planner Task Form vs Task Checklist */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Schedule Task */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-agri-accent" /> Schedule Crop Task
              </h3>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Task Objective</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flush drip lines, spray Neem oil"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Operation Type</label>
                    <select
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as any)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                    >
                      <option value="General">General Care</option>
                      <option value="Watering">Watering Loop</option>
                      <option value="Fertilizer">Fertilizer Application</option>
                      <option value="Spray">Crop Protection Spray</option>
                      <option value="Harvest">Harvest Phase</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Priority Rank</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">Critical (High)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Execution Date</label>
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Target Time</label>
                    <input
                      type="time"
                      value={newTaskTime}
                      onChange={(e) => setNewTaskTime(e.target.value)}
                      className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3 px-4 rounded-full shadow transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-agri-bright" /> Queue Task
                </button>
              </form>
            </div>

            {/* Quick weather alerts advisory related to planning */}
            <div className="bg-amber-50 text-amber-900 border border-amber-100 rounded-[24px] p-5 space-y-2 dark:bg-yellow-950/20 dark:border-yellow-900 dark:text-yellow-400">
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-yellow-700 dark:text-yellow-500">
                <AlertTriangle className="w-4.5 h-4.5 text-yellow-600" /> Agronomy Schedule Guidance
              </h4>
              <p className="text-xs leading-relaxed font-medium">
                Avoid open spraying tasks after 11:00 AM if solar thermal index exceeds 35°C, or if local gusts speed up past 18 km/h. High evaporation lowers pesticide efficiency.
              </p>
            </div>
          </div>

          {/* Right checklist columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-agri-accent" /> Tasks & Watering Schedules
                </h3>
                <span className="text-xs text-agri-muted font-bold">
                  {tasks.filter(t => !t.completed).length} pending
                </span>
              </div>

              <div className="space-y-3.5">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`border border-agri-border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all dark:border-zinc-800 ${
                      task.completed 
                        ? "bg-agri-soft/20 opacity-70 line-through text-agri-muted dark:bg-zinc-950/40" 
                        : "bg-white hover:border-agri-sage dark:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="w-4.5 h-4.5 rounded text-agri-deep focus:ring-agri-accent border-agri-border mt-1 cursor-pointer"
                      />
                      <div className="space-y-1">
                        <p className={`text-xs sm:text-sm font-semibold leading-normal ${task.completed ? "text-agri-muted" : "text-agri-dark dark:text-zinc-200"}`}>
                          {task.title}
                        </p>
                        
                        <div className="flex items-center gap-3 flex-wrap text-[10px]">
                          <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.type === "Watering" ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                            task.type === "Fertilizer" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                            task.type === "Spray" ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}>
                            {task.type}
                          </span>

                          <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.priority === "High" ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-gray-50 text-gray-600 dark:bg-zinc-850 dark:text-zinc-400"
                          }`}>
                            {task.priority} Priority
                          </span>

                          <span className="text-agri-muted flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-agri-muted" /> {task.date} @ {task.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-zinc-850 rounded-full transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="border border-dashed border-agri-border bg-agri-soft/20 rounded-[24px] p-12 text-center flex flex-col justify-center items-center">
                    <CheckSquare className="w-12 h-12 text-agri-muted/50 mb-3" />
                    <p className="text-agri-dark dark:text-zinc-200 font-serif text-base font-medium mb-1">All Tasks Completed!</p>
                    <p className="text-xs text-agri-muted leading-relaxed">Relax or queue new seasonal fertilization routines above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* AI Crop & Fertilizer Advisory layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Soil and parameters selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-agri-accent" /> Soil & Climate Matrix
              </h3>

              <div className="space-y-4">
                {/* Soil type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Soil Composition Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-850 text-agri-dark dark:text-zinc-200"
                  >
                    <option value="Black Cotton Soil">Black Cotton Soil (Highly clayey, retains moisture)</option>
                    <option value="Alluvial / Loamy Soil">Alluvial / Loamy Soil (Fertile, high sand-silt mix)</option>
                    <option value="Sandy / Arid Soil">Sandy Arid Soil (Porous, low water rentention)</option>
                    <option value="Red Laterite Soil">Red Laterite Soil (Acidic, iron-rich, porous)</option>
                  </select>
                </div>

                {/* Farmer Region */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Farmer Sowing Region</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-agri-muted absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. Indore, Madhya Pradesh"
                      className="w-full bg-agri-soft/30 border border-agri-border outline-none rounded-xl py-3 pl-9 pr-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-850 text-agri-text dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Season */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Target Sowing Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border outline-none rounded-xl p-3 text-xs font-semibold dark:bg-zinc-800/50 dark:border-zinc-850 text-agri-dark dark:text-zinc-200"
                  >
                    <option value="Kharif (Monsoon)">Kharif Cycle (Monsoon, June - Nov)</option>
                    <option value="Rabi (Winter)">Rabi Cycle (Winter, Oct - April)</option>
                    <option value="Zaid (Summer)">Zaid Cycle (Summer, March - June)</option>
                  </select>
                </div>

                {/* Rainfall Parameter slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-agri-muted uppercase">
                    <span>Average Annual Rainfall</span>
                    <span className="text-agri-deep dark:text-[#8BC34A] font-mono">{rainfall} mm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1800"
                    step="50"
                    value={rainfall}
                    onChange={(e) => setRainfall(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#8BC34A]"
                  />
                </div>

                {/* Temperature Parameter slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-agri-muted uppercase">
                    <span>Average Temperature</span>
                    <span className="text-agri-deep dark:text-[#8BC34A] font-mono">{temperature} °C</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="45"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#8BC34A]"
                  />
                </div>

                {/* Humidity slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-agri-muted uppercase">
                    <span>Average Relative Humidity</span>
                    <span className="text-agri-deep dark:text-[#8BC34A] font-mono">{humidity} %</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    step="5"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#8BC34A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGetAiRecommendation}
                  disabled={isAiLoading}
                  className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3.5 px-4 rounded-full shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-agri-bright" />
                      Synthesizing Agronometrix Matrix...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-agri-bright" /> Generate AI Recommendations
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Micro-nutrient Advisory Note */}
            <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-[24px] p-5 space-y-2 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
              <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-700 dark:text-[#8BC34A]">
                <Leaf className="w-4.5 h-4.5" /> Soil Nutrition Intelligence
              </h4>
              <p className="text-[11px] leading-relaxed font-medium">
                Our AI uses soil taxonomy parameters mapped against Agmarknet climate feeds to predict optimal crop cycles. This matches Indian Council of Agricultural Research (ICAR) guidelines.
              </p>
            </div>
          </div>

          {/* Right Column: AI Output recommendation details */}
          <div className="lg:col-span-7">
            {aiResult ? (
              <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
                
                {/* Header Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agri-border dark:border-zinc-800 pb-5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#8BC34A]/10 p-2.5 rounded-2xl text-agri-deep dark:text-[#8BC34A]">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-agri-accent block mb-0.5">Crop Recommendation</span>
                      <h3 className="font-serif text-lg sm:text-xl font-medium text-agri-dark dark:text-zinc-100">{aiResult.cropName}</h3>
                    </div>
                  </div>
                  <div>
                    <span className="bg-[#8BC34A]/15 text-agri-deep text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-emerald-200 dark:bg-zinc-800 dark:text-emerald-400 dark:border-zinc-700 uppercase tracking-wider">
                      🌱 {aiResult.growingPeriod}
                    </span>
                  </div>
                </div>

                {/* Key Outputs Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expected Yield */}
                  <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4.5 dark:bg-zinc-850/40 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-agri-muted dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Activity className="w-4 h-4 text-agri-accent" /> Expected Yield
                    </div>
                    <p className="text-sm font-semibold text-agri-dark dark:text-zinc-200">{aiResult.expectedYield}</p>
                  </div>

                  {/* Profit estimate */}
                  <div className="bg-[#EBF5FB]/40 border border-blue-100 rounded-2xl p-4.5 dark:bg-zinc-850/30 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-[#2980B9] text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Coins className="w-4 h-4" /> Profit Estimation
                    </div>
                    <p className="text-sm font-semibold text-agri-dark dark:text-zinc-200">{aiResult.profitEstimate}</p>
                  </div>
                </div>

                {/* Water advisory */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-agri-muted uppercase tracking-widest flex items-center gap-1.5">
                    <Droplet className="w-4.5 h-4.5 text-blue-500" /> Water Management & Irrigation Advisory
                  </h4>
                  <p className="text-xs sm:text-sm text-agri-text dark:text-zinc-300 leading-relaxed font-semibold">
                    {aiResult.waterRequirement}
                  </p>
                </div>

                {/* Fertilizer program recommendations */}
                <div className="space-y-4 pt-4 border-t border-agri-border dark:border-zinc-800">
                  <h4 className="text-xs font-serif font-semibold text-agri-dark dark:text-zinc-100">Nutrition & Fertilizer Schedule</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Organic fertilizers */}
                    <div className="bg-agri-soft/40 border border-agri-border rounded-2xl p-4.5 dark:bg-zinc-850/40 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">🌿 Organic Fertilizers</span>
                      <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiResult.organicFertilizers}</p>
                    </div>

                    {/* Chemical fertilizers */}
                    <div className="bg-blue-50/30 border border-blue-100/50 rounded-2xl p-4.5 dark:bg-zinc-850/30 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 block">🧪 Chemical Fertilizers</span>
                      <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{aiResult.chemicalFertizers}</p>
                    </div>
                  </div>

                  {/* Application schedule */}
                  <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-4.5 dark:bg-zinc-850/60 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block">📅 Application Schedule Timeline</span>
                    <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-semibold whitespace-pre-line">{aiResult.applicationSchedule}</p>
                  </div>

                  {/* Precautions */}
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4.5 space-y-1.5 text-amber-900 dark:text-amber-400">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Safety Precautions & Spacing
                    </span>
                    <p className="text-xs leading-relaxed font-medium">{aiResult.precautions}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="border border-dashed border-agri-border bg-agri-soft/20 rounded-[32px] p-12 text-center h-full flex flex-col justify-center items-center dark:border-zinc-800 dark:bg-zinc-900/10 min-h-[400px]">
                <Sparkles className="w-12 h-12 text-agri-muted/50 mb-4" />
                <p className="text-agri-dark dark:text-zinc-200 font-serif text-lg font-medium mb-1">AI Recommendation Ready</p>
                <p className="text-xs text-agri-muted max-w-sm leading-relaxed">Adjust your soil, season, and local rainfall parameters, and trigger recommendations to analyze the best yield-maximizing crops.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
