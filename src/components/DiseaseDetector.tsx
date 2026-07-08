import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, AlertTriangle, CheckCircle, RefreshCw, FileText, Volume2, VolumeX } from "lucide-react";
import { DiseaseReport } from "../types";

// High-quality public URLs for agriculture plant leaf disease references
const PLANT_SAMPLES = [
  {
    id: "tomato_blight",
    name: "Tomato Leaf (Blight Specimen)",
    url: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400",
    mime: "image/jpeg",
    // Base64 representation of a simple 1x1 green/brown pixel or placeholder so they can analyze instantly even if offline or if download fails
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  },
  {
    id: "corn_rust",
    name: "Maize/Corn Leaf (Rust Specimen)",
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400",
    mime: "image/jpeg",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  }
];

export default function DiseaseDetector() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<DiseaseReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop reading if user unmounts or navigates away
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakReport = () => {
    if (!window.speechSynthesis || !report) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    
    const symptomsText = report.symptoms.join(", ");
    const organicText = report.treatment.organic.join(". ");
    const chemicalText = report.treatment.chemical.join(". ");
    const preventionText = report.prevention.join(". ");

    const text = `
      Diagnosis Report. Disease detected: ${report.diseaseName}. 
      Confidence score is ${report.confidence}. 
      Severity level is ${report.severity}. 
      Key symptoms include: ${symptomsText}. 
      The pest status report is: ${report.pestIdentification}.
      For Organic treatment, we recommend: ${organicText}. 
      For Chemical controls, we recommend: ${chemicalText}. 
      Preventative guidelines are: ${preventionText}. 
      Estimated yield impact is ${report.yieldImpact}.
    `;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN"; // Set India English context

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setReport(null);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Browser Camera Handlers
  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Unable to access system camera. Please select file upload instead.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImage(dataUrl);
        setMimeType("image/jpeg");
        setReport(null);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  // Trigger Gemini Analysis
  const analyzeDisease = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);

    try {
      // Extract clean base64 data from DataURL
      const base64Data = image.split(",")[1] || image;

      const response = await fetch("/api/gemini/analyze-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process plant leaf scan. Check backend configs.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected issue occurred while analyzing the image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectSample = (sample: typeof PLANT_SAMPLES[0]) => {
    setImage(sample.url);
    setMimeType(sample.mime);
    setReport(null);
    setError(null);
  };

  return (
    <div className="space-y-8" id="disease-detector-panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-agri-border pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-serif font-medium text-agri-dark dark:text-zinc-100">Pathology & Pest Scanner</h2>
          <p className="text-xs text-agri-muted">Scan crop leaves via camera or upload images for real-time pathology reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Uploader / Camera box */}
          <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <h3 className="font-serif text-lg font-medium text-agri-dark dark:text-zinc-100 mb-4">Input Leaf Image</h3>

            {showCamera ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col justify-between p-4">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playInline muted />
                <div className="relative z-10 self-end bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                  Facing Mode: Environment
                </div>
                <div className="relative z-10 flex justify-between mt-auto">
                  <button
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="bg-agri-deep hover:bg-agri-dark text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-1 shadow"
                  >
                    <Camera className="w-4 h-4 text-agri-bright" /> Capture Photo
                  </button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : image ? (
              <div className="relative rounded-2xl overflow-hidden border border-agri-border bg-agri-soft aspect-video flex items-center justify-center dark:border-zinc-800">
                <img
                  src={image}
                  alt="Plant Leaf Specimen"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => {
                    setImage(null);
                    setReport(null);
                  }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-agri-accent bg-agri-soft/50"
                    : "border-agri-border hover:border-agri-sage hover:bg-agri-soft/10 dark:border-zinc-800"
                }`}
              >
                <Upload className="w-10 h-10 text-agri-muted/60 mx-auto mb-3" />
                <p className="text-sm font-semibold text-agri-dark dark:text-zinc-200 mb-1">Drag & drop your leaf image here</p>
                <p className="text-xs text-agri-muted mb-5">Supports PNG, JPG, or JPEG up to 10MB</p>
                <div className="flex justify-center gap-2.5">
                  <button
                    type="button"
                    className="bg-agri-soft hover:bg-agri-sage/30 text-agri-deep text-xs font-bold px-4 py-2.5 rounded-full border border-agri-border transition-colors dark:bg-zinc-800 dark:border-zinc-750 dark:text-emerald-400"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="bg-white hover:bg-agri-soft text-agri-deep text-xs font-bold px-4 py-2.5 rounded-full border border-agri-border transition-colors flex items-center gap-1.5 shadow-sm dark:bg-zinc-800 dark:border-zinc-750 dark:text-zinc-100"
                  >
                    <Camera className="w-3.5 h-3.5" /> Use Camera
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {image && !analyzing && !report && (
              <button
                onClick={analyzeDisease}
                className="w-full bg-agri-deep hover:bg-agri-dark text-white font-semibold py-3.5 px-4 rounded-full mt-5 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow text-agri-bright" /> Analyze Leaf Pathology
              </button>
            )}

            {analyzing && (
              <div className="text-center py-6">
                <RefreshCw className="w-8 h-8 text-agri-accent animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-agri-dark dark:text-zinc-200">Analyzing plant pathology...</p>
                <p className="text-xs text-agri-muted mt-1">Inspecting leaf damage and fungal markers via Gemini...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl mt-4 border border-red-100 flex gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Quick Samples list */}
          <div className="bg-white rounded-[32px] border border-agri-border p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <h4 className="text-xs font-bold uppercase tracking-wider text-agri-muted mb-4">Try ready specimens:</h4>
            <div className="grid grid-cols-2 gap-3">
              {PLANT_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => selectSample(sample)}
                  className="border border-agri-border hover:border-agri-sage rounded-2xl overflow-hidden text-left bg-agri-soft/20 transition-all flex flex-col group dark:border-zinc-800"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="h-20 w-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="p-3 text-xs font-bold text-agri-text dark:text-zinc-200 block truncate">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Report Column */}
        <div className="lg:col-span-7">
          {report ? (
            <div className="bg-white rounded-[32px] border border-agri-border p-6 sm:p-8 shadow-sm space-y-6 dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-agri-border dark:border-zinc-800 pb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-agri-soft dark:bg-zinc-800 p-2.5 rounded-2xl">
                    <CheckCircle className="w-6 h-6 text-agri-accent" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-agri-accent block mb-0.5">Diagnosis Report</span>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-agri-dark dark:text-zinc-100">{report.diseaseName}</h3>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <span className="bg-agri-soft text-agri-deep text-[10px] font-bold px-3.5 py-1.5 rounded-full border border-agri-border dark:bg-zinc-800 dark:text-emerald-400 dark:border-zinc-700 uppercase tracking-wider shrink-0">
                    Confidence: {report.confidence}
                  </span>
                  <span className={`text-[10px] font-bold px-3.5 py-1.5 rounded-full border uppercase tracking-wider shrink-0 ${
                    report.severity === "High"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : report.severity === "Moderate"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    Severity: {report.severity}
                  </span>
                </div>
              </div>

              {/* Voice playback tool */}
              <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-zinc-850 p-4 rounded-2xl border border-[#8BC34A]/20">
                <span className="text-xs text-agri-muted dark:text-zinc-400 font-medium">Need voice-guided pathology advice?</span>
                <button
                  onClick={handleSpeakReport}
                  className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isSpeaking
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#8BC34A] hover:bg-[#7CB342] text-white"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {isSpeaking ? "Stop Speaking" : "Speak Result Aloud"}
                </button>
              </div>

              {/* Symptoms */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-agri-muted uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-agri-accent" /> Key Foliar Symptoms
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-agri-text dark:text-zinc-300 pl-1">
                  {report.symptoms.map((symptom, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-agri-bright mt-1.5 shrink-0 text-base leading-none">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pest Identification */}
              <div className="bg-agri-soft/40 rounded-2xl p-5 border border-agri-border dark:bg-zinc-800/20 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-agri-dark dark:text-zinc-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-600" /> Pest / Parasite Activity
                </h4>
                <p className="text-xs sm:text-sm text-agri-muted dark:text-zinc-400 leading-relaxed font-medium">{report.pestIdentification}</p>
              </div>

              {/* Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-agri-soft/50 rounded-2xl p-5 border border-agri-border dark:bg-zinc-800/45 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-agri-deep dark:text-agri-bright uppercase tracking-widest mb-3 flex items-center gap-1">🌿 Organic Treatments</h4>
                  <ul className="space-y-2 text-xs text-agri-dark dark:text-zinc-300 font-medium leading-relaxed">
                    {report.treatment.organic.map((org, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-agri-accent mt-0.5 shrink-0 font-bold">✔</span>
                        <span>{org}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#EBF5FB]/60 rounded-2xl p-5 border border-blue-100 dark:bg-zinc-800/30 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-[#2980B9] uppercase tracking-widest mb-3 flex items-center gap-1">🧪 Chemical Controls</h4>
                  <ul className="space-y-2 text-xs text-agri-dark dark:text-zinc-300 font-medium leading-relaxed">
                    {report.treatment.chemical.map((chem, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#2980B9] mt-0.5 shrink-0 font-bold">✔</span>
                        <span>{chem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prevention & Soil */}
              <div className="space-y-4 pt-4 border-t border-agri-border dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold text-agri-muted uppercase tracking-widest mb-2.5">🛡️ Preventative Guidelines</h4>
                  <ul className="space-y-2 text-sm text-agri-text dark:text-zinc-300 leading-relaxed">
                    {report.prevention.map((prev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-agri-muted mt-1 shrink-0">•</span>
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-dashed border-agri-border dark:border-zinc-800">
                  <div>
                    <h4 className="text-[10px] font-bold text-agri-muted uppercase tracking-wider mb-0.5">Estimated Yield Impact</h4>
                    <p className="text-sm font-semibold text-red-600">{report.yieldImpact}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-agri-muted uppercase tracking-wider mb-0.5">Nutrition/Soil Recommendation</h4>
                    <p className="text-xs text-agri-text dark:text-zinc-300 leading-relaxed font-medium">{report.soilAnalysisRecommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-agri-border bg-agri-soft/20 rounded-[32px] p-12 text-center h-full flex flex-col justify-center items-center dark:border-zinc-800 dark:bg-zinc-900/10 min-h-[400px]">
              <FileText className="w-12 h-12 text-agri-muted/50 mb-4" />
              <p className="text-agri-dark dark:text-zinc-200 font-serif text-lg font-medium mb-1">Pathology Report Ready</p>
              <p className="text-xs text-agri-muted max-w-sm leading-relaxed">Provide a leaf photo and click pathology scan to inspect foliar diseases and pest alerts immediately.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
