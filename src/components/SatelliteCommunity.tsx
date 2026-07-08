import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, Globe, MessageSquare, Send, ThumbsUp, Compass, 
  Layers, Map, Cloud, HelpCircle, CheckCircle, Award, 
  Users, UserPlus, Heart 
} from "lucide-react";

interface ForumPost {
  id: string;
  author: string;
  location: string;
  content: string;
  likes: number;
  comments: number;
  hasLiked: boolean;
  category: "General" | "Success Story" | "Ask Expert" | "Disease Alerts";
  timestamp: string;
}

export default function SatelliteCommunity() {
  const [activeSegment, setActiveSegment] = useState<"satellite" | "forum">("satellite");

  // Satellite State
  const [ndviMode, setNdviMode] = useState<"true_color" | "ndvi_infrared">("ndvi_infrared");
  const [satelliteCloudCover, setSatelliteCloudCover] = useState(4); // cloud %
  const [satelliteIndex, setSatelliteIndex] = useState(0.72); // NDVI health metric
  const ndviCanvasRef = useRef<HTMLCanvasElement>(null);

  // Community State
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([
    {
      id: "p1",
      author: "Rajesh G. Shinde",
      location: "Dhar, MP",
      content: "Has anyone started seeing signs of whitefly on cotton leaves? Yesterday I spotted minor speckles on my lower branches. Planning on spraying Neem-based emulsion this evening.",
      likes: 12,
      comments: 3,
      hasLiked: false,
      category: "Disease Alerts",
      timestamp: "2 hours ago"
    },
    {
      id: "p2",
      author: "Sanjay Kumar",
      location: "Indore District",
      content: "Unbelievable results this year with double-row Soybean drilling! My NDVI index touched 0.78, which is the highest I've managed in three seasons. Soil moisture retention holds up remarkably.",
      likes: 24,
      comments: 6,
      hasLiked: true,
      category: "Success Story",
      timestamp: "5 hours ago"
    },
    {
      id: "p3",
      author: "Deepak Choudhary",
      location: "Dewas, MP",
      content: "Does anyone have recommendations for high-yield Rabi Mustard seeds? Our soil sample test shows rich potassium but organic carbon is slightly low. Need expert feedback.",
      likes: 8,
      comments: 9,
      hasLiked: false,
      category: "Ask Expert",
      timestamp: "1 day ago"
    }
  ]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostCat, setNewPostCat] = useState<ForumPost["category"]>("General");

  // Draw NDVI or True Color Satellite Simulation on Canvas
  useEffect(() => {
    if (activeSegment !== "satellite") return;
    const canvas = ndviCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ndviMode === "true_color") {
      // Draw organic farm field blocks (greens/browns)
      ctx.fillStyle = "#4CAF50"; // Block 1
      ctx.fillRect(40, 50, 180, 120);

      ctx.fillStyle = "#388E3C"; // Block 2
      ctx.fillRect(230, 50, 160, 180);

      ctx.fillStyle = "#8D6E63"; // Fallow Block 3 (Brown)
      ctx.fillRect(40, 180, 180, 130);

      ctx.fillStyle = "#66BB6A"; // Block 4
      ctx.fillRect(230, 240, 240, 70);

      ctx.fillStyle = "#2E7D32"; // Block 5
      ctx.fillRect(410, 50, 230, 180);

      // Draw road/canals separating blocks
      ctx.strokeStyle = "#D7CCC8";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(225, 0);
      ctx.lineTo(225, canvas.height);
      ctx.stroke();

      ctx.strokeStyle = "#81D4FA"; // Irrigation Canal (Blue)
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 235);
      ctx.lineTo(canvas.width, 235);
      ctx.stroke();
    } else {
      // NDVI Infrared Spectrometry Overlay
      // Good health index = deep green, stressed index = red/yellow/orange

      // Deep Healthy Vegetation
      ctx.fillStyle = "rgba(46, 125, 50, 0.85)"; // High chlorophyll (Block 5)
      ctx.fillRect(410, 50, 230, 180);
      ctx.fillStyle = "rgba(56, 142, 60, 0.8)"; // Block 2
      ctx.fillRect(230, 50, 160, 180);

      // Medium Healthy Vegetation
      ctx.fillStyle = "rgba(139, 195, 74, 0.8)"; // Moderate NDVI (Block 1)
      ctx.fillRect(40, 50, 180, 120);

      // Low/Stressed Vegetation or Fallow (Red/Yellow)
      ctx.fillStyle = "rgba(230, 126, 34, 0.8)"; // Yellow/Orange stressed Block 4
      ctx.fillRect(230, 240, 240, 70);
      ctx.fillStyle = "rgba(217, 83, 79, 0.85)"; // Red Fallow soil Block 3
      ctx.fillRect(40, 180, 180, 130);

      // Draw roads (cold grey)
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(225, 0);
      ctx.lineTo(225, canvas.height);
      ctx.stroke();

      ctx.strokeStyle = "#1D4ED8"; // canal
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 235);
      ctx.lineTo(canvas.width, 235);
      ctx.stroke();

      // Spectrometry Labels on map
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("NDVI: 0.82 (EXCELLENT)", 430, 80);
      ctx.fillText("NDVI: 0.74 (HEALTHY)", 250, 80);
      ctx.fillText("NDVI: 0.65 (GOOD)", 55, 80);
      ctx.fillText("NDVI: 0.42 (STRESSED)", 250, 270);
      ctx.fillText("NDVI: 0.15 (BARE SOIL)", 55, 210);
    }
  }, [ndviMode, activeSegment]);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: "Ramesh Patel (You)",
      location: "Indore, MP",
      content: newPostText,
      likes: 0,
      comments: 0,
      hasLiked: false,
      category: newPostCat,
      timestamp: "Just now"
    };

    setForumPosts([newPost, ...forumPosts]);
    setNewPostText("");
  };

  const toggleLike = (id: string) => {
    setForumPosts(forumPosts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
          hasLiked: !p.hasLiked
        };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-8" id="satellite-community-panel">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-agri-border pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100 font-semibold">Smart Tech & Community Hub</h2>
          <p className="text-xs text-agri-muted">Trace canopy health using real-time NDVI spectrometry or discuss strategies with regional producers.</p>
        </div>
      </div>

      {/* Main Segments Selector bar */}
      <div className="bg-white rounded-[32px] border border-agri-border p-4 shadow-sm flex gap-4 dark:bg-zinc-900 dark:border-zinc-800">
        <button
          onClick={() => setActiveSegment("satellite")}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-6 rounded-2xl border transition-all ${
            activeSegment === "satellite"
              ? "bg-[#8BC34A26] text-agri-deep border-[#8BC34A44] font-bold dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400"
              : "bg-agri-soft/50 hover:bg-agri-soft text-agri-muted border-agri-border dark:bg-zinc-850 dark:border-zinc-800"
          }`}
        >
          <Globe className="w-4.5 h-4.5" /> Satellite Crop Monitoring
        </button>

        <button
          onClick={() => setActiveSegment("forum")}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-3.5 px-6 rounded-2xl border transition-all ${
            activeSegment === "forum"
              ? "bg-[#8BC34A26] text-agri-deep border-[#8BC34A44] font-bold dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400"
              : "bg-agri-soft/50 hover:bg-agri-soft text-agri-muted border-agri-border dark:bg-zinc-850 dark:border-zinc-800"
          }`}
        >
          <Users className="w-4.5 h-4.5" /> Farmer Discussion Forum
        </button>
      </div>

      {/* Dynamic Segment Rendering */}
      {activeSegment === "satellite" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Spectrometry Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100">Live NDVI Spectral Overlay</h3>
                <p className="text-xs text-agri-muted">Analyze relative chlorophyll absorption indexes over your selected coordinate plots.</p>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-2 border border-agri-border rounded-full p-1 bg-agri-soft/30 dark:border-zinc-800 dark:bg-zinc-950">
                <button
                  onClick={() => setNdviMode("true_color")}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${
                    ndviMode === "true_color" ? "bg-white text-agri-dark shadow dark:bg-zinc-850 dark:text-zinc-100" : "text-agri-muted"
                  }`}
                >
                  Natural Color
                </button>
                <button
                  onClick={() => setNdviMode("ndvi_infrared")}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${
                    ndviMode === "ndvi_infrared" ? "bg-white text-agri-dark shadow dark:bg-zinc-850 dark:text-zinc-100" : "text-agri-muted"
                  }`}
                >
                  NDVI Spectrometry
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative aspect-video rounded-2xl border border-agri-border overflow-hidden dark:border-zinc-800">
              <canvas
                ref={ndviCanvasRef}
                width={700}
                height={380}
                className="w-full h-full block"
              />
            </div>
          </div>

          {/* Telemetry metadata (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-5">
              <h3 className="font-serif text-base font-semibold text-agri-dark dark:text-zinc-100 border-b border-agri-border dark:border-zinc-800 pb-3">
                Satellite Diagnostics
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-agri-text dark:text-zinc-300">
                  <span className="flex items-center gap-1"><Radio className="w-4 h-4 text-agri-accent" /> Sentinel-2A Overpass</span>
                  <span className="font-mono font-bold">2.5 hrs ago</span>
                </div>

                <div className="flex justify-between items-center text-xs text-agri-text dark:text-zinc-300">
                  <span className="flex items-center gap-1"><Cloud className="w-4 h-4 text-blue-500" /> Cloud Interference</span>
                  <span className="font-mono font-bold">{satelliteCloudCover}% Cover</span>
                </div>

                {/* Index progress */}
                <div className="p-4 bg-agri-soft/40 border border-agri-border rounded-2xl dark:bg-zinc-800/30 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-agri-accent">Mean Crop Canopy Index</span>
                    <span className="font-mono font-bold text-xs">0.72</span>
                  </div>
                  <div className="h-2 bg-agri-border rounded-full overflow-hidden dark:bg-zinc-800">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all" 
                      style={{ width: `${(satelliteIndex * 100).toString()}%` }} 
                    />
                  </div>
                  <span className="text-[9px] text-agri-muted block leading-snug">Average NDVI readings above 0.70 represent excellent vegetative chlorophyll health with minimal moisture deficit stress.</span>
                </div>

                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-2xl border border-yellow-100 flex gap-2 text-xs leading-relaxed">
                  <Globe className="w-5 h-5 shrink-0 text-yellow-600" />
                  <p>Sentinel satellite spectrographic orbits provide 10-meter pixel resolution scans every 5 days. Connect paid drone arrays for sub-centimeter orthomosaics.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeSegment === "forum" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Post Submission (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-agri-accent" /> Start Conversation
              </h3>

              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Channel Category</label>
                  <select
                    value={newPostCat}
                    onChange={(e) => setNewPostCat(e.target.value as any)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3 text-xs font-bold dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-dark dark:text-zinc-200"
                  >
                    <option value="General">General Discussion</option>
                    <option value="Success Story">Success Stories</option>
                    <option value="Ask Expert">Consult Experts</option>
                    <option value="Disease Alerts">Pests & Disease Alerts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your farming queries, warnings, or findings here. Let the local community assist..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    className="w-full bg-agri-soft/30 border border-agri-border focus:border-agri-accent outline-none rounded-xl p-3.5 text-xs font-medium dark:bg-zinc-800/50 dark:border-zinc-800 text-agri-text dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3 px-4 rounded-full shadow transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-agri-bright" /> Post message
                </button>
              </form>
            </div>
          </div>

          {/* Posts Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {forumPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-4"
              >
                {/* Author and timestamp */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-agri-dark dark:text-zinc-200 text-sm">{post.author}</h4>
                    <span className="text-[10px] text-agri-muted font-semibold block">{post.location} • {post.timestamp}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-agri-border bg-agri-soft text-agri-deep dark:bg-zinc-800 dark:border-zinc-700 dark:text-emerald-400`}>
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-agri-muted leading-relaxed font-medium">
                  {post.content}
                </p>

                {/* Likes/Comments actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-agri-border dark:border-zinc-800 text-xs">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors font-bold ${
                      post.hasLiked ? "text-agri-accent" : "text-agri-muted hover:text-agri-accent"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${post.hasLiked ? "fill-agri-accent" : ""}`} /> 
                    <span>{post.likes} Likes</span>
                  </button>

                  <span className="text-agri-muted flex items-center gap-1.5 font-bold">
                    <MessageSquare className="w-4 h-4 text-agri-muted" /> 
                    <span>{post.comments} Comments</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
