import { defineApp, z } from "@openai/chatgpt-apps-sdk";
import { OUTFIT_LIBRARY, OutfitBundle, Occasion } from "./data/outfitLibrary";

interface OutfitQuery {
  occasion?: Occasion;
  weather?: "warm" | "cool" | "transitional" | "all-weather";
  budgetLevel?: "saver" | "classic" | "investment";
  keywords?: string[];
}

const matchByOccasion = (bundle: OutfitBundle, query: OutfitQuery) => {
  if (!query.occasion) return true;
  return bundle.occasion === query.occasion;
};

const matchByWeather = (bundle: OutfitBundle, query: OutfitQuery) => {
  if (!query.weather) return true;
  if (!bundle.weather) return true;
  return bundle.weather === query.weather;
};

const matchByBudget = (bundle: OutfitBundle, query: OutfitQuery) => {
  if (!query.budgetLevel) return true;
  return bundle.budgetLevel === query.budgetLevel;
};

const matchByKeywords = (bundle: OutfitBundle, query: OutfitQuery) => {
  if (!query.keywords?.length) return true;
  const haystack = [
    bundle.bodyFocus ?? "",
    ...bundle.options.flatMap((option) => [
      option.title,
      option.mood,
      option.stylingNotes,
      ...(option.sustainabilityTip ? [option.sustainabilityTip] : []),
      ...option.heroPieces,
      ...option.accessories
    ])
  ]
    .join(" ")
    .toLowerCase();

  return query.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
};

const filterBundles = (query: OutfitQuery) =>
  OUTFIT_LIBRARY.filter(
    (bundle) =>
      matchByOccasion(bundle, query) &&
      matchByWeather(bundle, query) &&
      matchByBudget(bundle, query) &&
      matchByKeywords(bundle, query)
  );

const streamWeaver = defineApp({
  name: "Stream Weaver",
  version: "0.1.0",
  metadata: {
    tagline: "Weave together outfits with color, texture, and confidence",
    accentColor: "#5f4b8b"
  },
  conversation: {
    system: `You are Stream Weaver, an empathetic co-stylist that helps users craft fashion looks. Blend data-driven insight with emotional support. Always gather occasion, weather, budget, preferred silhouettes, colors, and accessibility needs before offering guidance.`
  },
  tools: {
    outfitIdeas: {
      description:
        "Retrieve curated outfit ideas that align with the user's occasion, climate, budget, and styling goals.",
      input: z
        .object({
          occasion: z
            .enum(["office", "weekend", "evening", "date-night", "wedding", "festival", "travel", "athleisure"])
            .optional(),
          weather: z.enum(["warm", "cool", "transitional", "all-weather"]).optional(),
          budgetLevel: z.enum(["saver", "classic", "investment"]).optional(),
          keywords: z.array(z.string()).optional()
        })
        .describe("Signals extracted from the conversation to personalize outfit results."),
      handler: async ({ occasion, weather, budgetLevel, keywords }) => {
        const bundles = filterBundles({ occasion, weather, budgetLevel, keywords });

        if (!bundles.length) {
          return {
            matches: [],
            narrative:
              "I couldn't find a perfect pre-built bundle, so I'll craft custom combinations using general style principles."
          };
        }

        const response = bundles.map((bundle) => ({
          occasion: bundle.occasion,
          weather: bundle.weather,
          budgetLevel: bundle.budgetLevel,
          bodyFocus: bundle.bodyFocus,
          options: bundle.options.map((option) => ({
            id: option.id,
            title: option.title,
            mood: option.mood,
            palette: option.palette,
            heroPieces: option.heroPieces,
            accessories: option.accessories,
            stylingNotes: option.stylingNotes,
            sustainabilityTip: option.sustainabilityTip
          }))
        }));

        return {
          matches: response,
          narrative:
            "Here are curated outfit concepts you can weave into your wardrobe. Feel free to mix, match, or request adjustments!"
        };
      }
    }
  },
  ui: {
    cards: [
      {
        id: "style-principles",
        title: "How Stream Weaver personalizes outfits",
        body: [
          "✧ Cross-references your occasion, climate, and vibe goals",
          "✧ Balances proportions using your stated comfort zones",
          "✧ Suggests color stories and textures that harmonize",
          "✧ Recommends sustainable or budget-aware swaps"
        ]
      },
      {
        id: "confidence",
        title: "Confidence reminders",
        body: [
          "• Wear what lets you move with ease",
          "• Texture contrast adds instant depth",
          "• Accessories can act as conversation starters"
        ]
      }
    ]
  }
});

export default streamWeaver;
