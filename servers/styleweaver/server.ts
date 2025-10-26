import { createServer } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";
import dotenv from "dotenv";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. StyleWeaver tools will fail until it is provided.");
}

const SAVE_FILE = path.resolve(process.cwd(), "configs", "saved-outfits.json");

const server = createServer({
  name: "styleweaver-mcp",
  version: "0.1.0",
  description: "StyleWeaver fashion intelligence tools",
  capabilities: {
    tools: {},
  },
});

server.tool(
  {
    name: "analyzeWardrobe",
    description:
      "Analyze a list of clothing items and optional user preferences to generate curated outfits with styling rationale.",
    inputSchema: z.object({
      items: z
        .array(
          z.object({
            name: z.string().describe("Human-readable item name."),
            category: z.string().describe("Category like top, bottom, shoe, accessory."),
            colors: z.array(z.string()).describe("Key colors present in the garment."),
            styleNotes: z
              .string()
              .describe(
                "Relevant context such as fabric, fit, pattern, or vibe (e.g. 'tailored wool blazer')."
              )
              .optional(),
            formality: z
              .enum(["casual", "smart casual", "business", "formal", "evening"])
              .describe("The formality band where the item is most appropriate."),
            weather: z
              .array(z.enum(["hot", "warm", "mild", "cool", "cold", "rainy"]))
              .describe("Climate conditions where this item shines."),
          })
        )
        .min(1),
      occasion: z
        .string()
        .describe("The user-supplied occasion, mood, or goal for the outfit (e.g. 'summer rooftop party').")
        .optional(),
      preferences: z
        .object({
          colorPalette: z
            .string()
            .describe("Preferred palette descriptors like 'earth tones' or 'monochrome neutrals'.")
            .optional(),
          styleKeywords: z
            .array(z.string())
            .describe("Keywords describing personal style cues (e.g. 'minimalist', 'retro', 'sporty').")
            .optional(),
          avoid: z
            .array(z.string())
            .describe("Colors, fabrics, or vibes to avoid.")
            .optional(),
        })
        .default({}),
      count: z
        .number()
        .int()
        .min(1)
        .max(5)
        .default(3)
        .describe("Number of outfits to generate."),
    }),
  },
  async ({ input }) => {
    const prompt = `You are StyleWeaver, an elite fashion stylist building cohesive outfits.
Input wardrobe items: ${JSON.stringify(input.items, null, 2)}
Occasion or mood: ${input.occasion ?? "unspecified"}
Preferences: ${JSON.stringify(input.preferences, null, 2)}

Rules:
- Build ${input.count} distinct outfits by combining tops, bottoms, layers, shoes, and accessories.
- Respect color harmony, contrast, and undertones. Explain why colors work.
- Match the vibe to the occasion and weather suitability.
- Reference current fashion trends and give actionable styling notes.
- Highlight hero piece(s), silhouette balance, and texture play.
- Provide step-by-step dressing instructions and optional hair/makeup cues.
- Present output as JSON with an array 'outfits', each containing 'title', 'items' (array of wardrobe item names or "new suggestion"), 'colorTheory', 'stylingNotes', 'occasionFit', and 'trendInspiration'.`;

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: "You are a visionary fashion stylist who speaks with clarity and warmth.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const message = response.output_text;

    if (!message) {
      throw new Error("StyleWeaver did not receive a response body from the OpenAI API.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(message);
    } catch (error) {
      throw new Error(`Failed to parse StyleWeaver response: ${message}`);
    }

    return {
      success: true,
      outfits: parsed,
      raw: message,
    };
  }
);

server.tool(
  {
    name: "saveOutfit",
    description: "Persist an outfit recommendation or mood board for future reference.",
    inputSchema: z.object({
      title: z.string(),
      summary: z.string(),
      items: z.array(z.string()),
      stylingNotes: z.string(),
      inspiration: z.string().optional(),
    }),
  },
  async ({ input }) => {
    const existing = await loadSavedOutfits();
    const entry = {
      ...input,
      savedAt: new Date().toISOString(),
    };
    existing.unshift(entry);
    await fs.mkdir(path.dirname(SAVE_FILE), { recursive: true });
    await fs.writeFile(SAVE_FILE, JSON.stringify(existing, null, 2), "utf-8");

    return {
      success: true,
      saved: entry,
    };
  }
);

async function loadSavedOutfits(): Promise<any[]> {
  try {
    const raw = await fs.readFile(SAVE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  server.start();
}

export default server;
