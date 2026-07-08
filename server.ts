import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import JSZip from "jszip";
import { FLUTTER_PROJECT_FILES } from "./src/flutterProjectSource";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limits for base64 image uploads (for plant disease analysis)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initialize Gemini client to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. Falling back to simulated AI mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Checks if the given Gemini API error is transient (e.g. rate limit, high demand, unavailable).
 */
function isTransientError(error: any): boolean {
  if (!error) return false;
  
  const errMsg = typeof error === 'string' ? error : (error.message || '');
  const errStr = JSON.stringify(error);
  
  return (
    error.status === "UNAVAILABLE" || 
    error.code === 503 || 
    error.status === "RESOURCE_EXHAUSTED" || 
    error.code === 429 ||
    errMsg.includes("503") || 
    errMsg.includes("high demand") || 
    errMsg.includes("429") || 
    errMsg.includes("RESOURCE_EXHAUSTED") || 
    errMsg.includes("UNAVAILABLE") ||
    errStr.includes("503") || 
    errStr.includes("high demand") || 
    errStr.includes("429") || 
    errStr.includes("RESOURCE_EXHAUSTED") || 
    errStr.includes("UNAVAILABLE")
  );
}

/**
 * Retries an asynchronous function with exponential backoff on transient errors.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  backoffFactor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && isTransientError(error)) {
      console.warn(`[Gemini API] Transient error encountered. Retrying in ${delayMs}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return retryWithBackoff(fn, retries - 1, delayMs * backoffFactor, backoffFactor);
    }
    throw error;
  }
}

/**
 * Robust wrapper around generateContent that automatically falls back to alternative models
 * if gemini-3.5-flash experiences high demand or is temporarily unavailable.
 * Employs automatic retry with backoff for transient errors.
 */
async function generateWithFallback(contents: any, config?: any) {
  const ai = getGemini();
  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash-8b",
    "gemini-3.5-flash",
    "gemini-1.5-pro"
  ];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[Gemini API] Attempting generation with model: ${model}`);
      const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: model,
          contents: contents,
          config: config,
        });
      }, 3, 1000);
      console.log(`[Gemini API] Success with model: ${model}`);
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini API] Model ${model} failed after retries. Error:`, err.message || err);
    }
  }

  throw lastError || new Error("All Gemini models failed to generate content.");
}


// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Secure AI chatbot route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Simulate reply if key is default or empty
      return res.json({
        text: `[Simulated AgriMind AI] Thank you for your farming question: "${message}". In simulated mode, here's a general recommendation: maintain healthy soil moisture, inspect your leaves regularly for pests, and leverage weather-based irrigation. (Configure a valid GEMINI_API_KEY in Secrets for live AI answers!)`
      });
    }

    // Structure chat with system instruction
    const systemInstruction = 
      "You are AgriMind AI, a highly intelligent and compassionate Smart Farming Assistant. " +
      "Your goal is to help farmers, horticulturists, and gardeners optimize crop yields, identify pests, recommend fertilizer " +
      "or irrigation protocols, analyze soil quality, and provide smart agricultural suggestions. " +
      "Always give actionable, direct, and structured advice. Use markdown list styles or bold text for clear readability. " +
      "Be encouraging and mention eco-friendly, sustainable farming methods whenever applicable.";

    const chatContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }
    chatContents.push({ role: "user", parts: [{ text: message }] });

    const response = await generateWithFallback(chatContents, {
      systemInstruction,
      temperature: 0.7,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI assistant" });
  }
});

// AI Disease Detection using Gemini Vision
app.post("/api/gemini/analyze-disease", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "imageBase64 and mimeType are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Simulate disease diagnosis
      return res.json({
        diseaseName: "Early Blight (Alternaria solani) - Simulated Specimen",
        confidence: "91%",
        severity: "Moderate",
        symptoms: [
          "Small dark spots forming target-board rings on older foliage",
          "Surrounding leaf tissue showing chlorosis (yellowing)",
          "Leaf drop on lower foliage exposing stems"
        ],
        pestIdentification: "Hornworm caterpillars or thrips leaf miners identified.",
        treatment: {
          organic: [
            "Prune and discard infected leaves to reduce soil-splashing spores.",
            "Water at the base (drip) rather than overhead sprinkling to keep leaves dry.",
            "Apply neem oil or copper fungicide sprays weekly during damp periods."
          ],
          chemical: [
            "Apply preventative chlorothalonil or copper-hydroxide fungicide treatments as per labeled guides."
          ]
        },
        prevention: [
          "Enforce 3-year crop rotation schedules (avoid rotating nightshades).",
          "Maintain plant spacing of at least 24 inches for proper airflow."
        ],
        soilAnalysisRecommendation: "Keep soil nitrogen balanced. High nitrogen encourages dense foliage susceptible to early blight.",
        yieldImpact: "15-25% yield loss due to premature defoliation and sunscald if untreated."
      });
    }

    const ai = getGemini();

    const prompt = 
      "Analyze this agricultural or plant leaf image. Identify if there is any disease, pest infestation, " +
      "or physiological disorder. Provide a detailed structured analysis in JSON format conforming EXACTLY to the following schema: " +
      "{\n" +
      "  \"diseaseName\": \"Name of the disease or disorder (e.g. Tomato Early Blight)\",\n" +
      "  \"confidence\": \"estimated confidence percentage (e.g. 92%)\",\n" +
      "  \"severity\": \"Low / Moderate / High\",\n" +
      "  \"symptoms\": [\"symptom 1\", \"symptom 2\"],\n" +
      "  \"pestIdentification\": \"Identify any visible pests or pest damage, or write 'None detected'\",\n" +
      "  \"treatment\": {\n" +
      "    \"organic\": [\"organic action 1\", \"organic action 2\"],\n" +
      "    \"chemical\": [\"chemical treatment 1\", \"chemical treatment 2\"]\n" +
      "  },\n" +
      "  \"prevention\": [\"prevention tip 1\", \"prevention tip 2\"],\n" +
      "  \"soilAnalysisRecommendation\": \"Quick advice on soil/nutrient/water changes to help the plant recover\",\n" +
      "  \"yieldImpact\": \"estimated yield impact if left untreated (e.g. 10-30% loss)\"\n" +
      "}\n" +
      "Make sure you return ONLY the raw JSON string without markdown blocks, or just return JSON. No other text.";

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    };

    const textPart = { text: prompt };

    const response = await generateWithFallback(
      { parts: [imagePart, textPart] },
      {
        responseMimeType: "application/json",
      }
    );

    const resultText = response.text || "{}";
    try {
      const parsedData = JSON.parse(resultText.trim());
      res.json(parsedData);
    } catch {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.status(500).json({ error: "Failed to parse AI response into structured JSON", rawText: resultText });
      }
    }
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with image analysis" });
  }
});

// Weather Recommendations endpoint using AI to suggest specific tasks
app.post("/api/weather/recommendations", async (req, res) => {
  try {
    const { temp, condition, humidity, wind, rainChance } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      let irr = "Standard watering required.";
      let pest = "Regular scouting recommended.";
      let spray = "Favorable conditions for foliar sprays.";

      if (rainChance > 50) {
        irr = "Delay irrigation. Rain is forecasted, which will provide natural soil moisture.";
        pest = "High moisture increases fungal spore germination. Inspect leaves for mildew or blight.";
        spray = "Avoid applying pesticides or fertilizers. Rain will wash treatments away.";
      } else if (temp > 35) {
        irr = "Increase watering frequency. Water early in the morning or late evening to minimize evaporation.";
        pest = "Dry, hot weather favors spider mites. Monitor lower leaf surfaces.";
        spray = "Avoid spraying during peak heat to prevent chemical leaf burn (phytotoxicity).";
      } else if (humidity > 80) {
        irr = "Reduce irrigation slightly. High humidity slows soil drying.";
        pest = "Prime conditions for downy mildew and rust. Ensure good crop ventilation.";
        spray = "Apply preventative bio-fungicides if persistent high humidity continues.";
      }

      return res.json({
        irrigation: irr,
        pestManagement: pest,
        sprayingFertilization: spray,
        harvestingSowing: (rainChance > 50) ? "Postpone harvesting to keep yield dry. Good time for wet-sowing crops." : "Excellent conditions for harvesting and open sowing."
      });
    }

    const ai = getGemini();
    const prompt = 
      `For a farm with the following weather: Temperature: ${temp}°C, Condition: ${condition}, ` +
      `Humidity: ${humidity}%, Wind Speed: ${wind} km/h, Chance of Rain: ${rainChance}%. ` +
      `Provide specific, expert farming recommendations in JSON format conforming EXACTLY to the following schema: ` +
      `{\n` +
      `  "irrigation": "precise watering recommendation based on evapotranspiration risk",\n` +
      `  "pestManagement": "pest/disease scouting advisory suited for this climate state",\n` +
      `  "sprayingFertilization": "suitability statement for spraying liquid fertilizers or pest controls",\n` +
      `  "harvestingSowing": "advisory on harvesting dried crops or optimal planting actions"\n` +
      `}`;

    const response = await generateWithFallback(prompt, {
      responseMimeType: "application/json"
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Weather Recommendation API Error:", error);
    res.json({
      irrigation: "Maintain standard crop watering cycles.",
      pestManagement: "Inspect crops for regional pests and fungal symptoms.",
      sprayingFertilization: "Perform scheduled liquid fertilization under calm winds.",
      harvestingSowing: "Proceed with standard harvesting or planting schedules."
    });
  }
});

// Serve downloadable Flutter project ZIP directly from backend
app.get("/api/flutter/download", async (req, res) => {
  try {
    const zip = new JSZip();

    FLUTTER_PROJECT_FILES.forEach((file) => {
      zip.file(file.path, file.content);
    });

    const contentBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="agrimind_ai_flutter.zip"');
    res.send(contentBuffer);
  } catch (err: any) {
    console.error("Failed to generate zip file on backend:", err);
    res.status(500).json({ error: "Failed to generate Flutter bundle ZIP" });
  }
});

// -----------------------------------------------------------------------------
// Wrapped server initialization to support async bundlers and avoid top-level await
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgriMind AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start fullstack server:", err);
});
