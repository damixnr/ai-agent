export interface WardrobeItem {
  name: string;
  category: string;
  colors: string[];
  styleNotes?: string;
  formality: "casual" | "smart casual" | "business" | "formal" | "evening";
  weather: Array<"hot" | "warm" | "mild" | "cool" | "cold" | "rainy">;
}

export interface AnalyzeWardrobeInput {
  items: WardrobeItem[];
  occasion?: string;
  preferences?: {
    colorPalette?: string;
    styleKeywords?: string[];
    avoid?: string[];
  };
  count?: number;
}

export interface OutfitRecommendation {
  title: string;
  items: string[];
  colorTheory: string;
  stylingNotes: string;
  occasionFit: string;
  trendInspiration: string;
}

export interface AnalyzeWardrobeResult {
  success: boolean;
  outfits: { outfits: OutfitRecommendation[] };
  raw: string;
}
