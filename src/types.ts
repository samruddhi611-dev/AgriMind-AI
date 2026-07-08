export interface WeatherTelemetry {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  recommendations?: {
    irrigation: string;
    pestManagement: string;
    sprayingFertilization: string;
    harvestingSowing: string;
  };
}

export interface CropPrice {
  id: string;
  cropName: string;
  marketName: string;
  currentPrice: number;
  lastPrice: number;
  unit: string;
  state: string;
  category: 'Cereal' | 'Pulse' | 'Vegetable' | 'Fruit' | 'Cash Crop';
}

export interface GovernmentScheme {
  id: string;
  title: string;
  category: 'Central' | 'State';
  department: string;
  eligibility: string;
  benefit: string;
  applyLink: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface DiseaseReport {
  diseaseName: string;
  confidence: string;
  severity: 'Low' | 'Moderate' | 'High';
  symptoms: string[];
  pestIdentification: string;
  treatment: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
  soilAnalysisRecommendation: string;
  yieldImpact: string;
}
