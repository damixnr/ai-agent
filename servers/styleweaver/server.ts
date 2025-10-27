import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

dotenv.config();

const server = new McpServer(
  { name: "styleweaver-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set. generateOutfits will use fallback responses.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "category", "colors", "formality", "weather"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          colors: { type: "array", items: { type: "string" }, minItems: 1 },
          styleNotes: { type: "string" },
          formality: {
            type: "string",
            enum: ["casual", "smart casual", "business", "formal", "evening"]
          },
          weather: {
            type: "array",
            items: {
              type: "string",
              enum: ["hot", "warm", "mild", "cool", "cold", "rainy"]
            },
            minItems: 1
          }
        }
      }
    },
    occasion: { type: "string" },
    preferences: {
      type: "object",
      additionalProperties: false,
      properties: {
        colorPalette: { type: "string" },
        styleKeywords: { type: "array", items: { type: "string" } },
        avoid: { type: "array", items: { type: "string" } }
      }
    },
    count: { type: "integer", minimum: 1, default: 3 }
  }
} as const;

const generateResultSchema = {
  type: "object",
  additionalProperties: false,
  required: ["success", "outfits"],
  properties: {
    success: { type: "boolean", const: true },
    outfits: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "items",
          "paletteExplanation",
          "compatibilityNotes",
          "occasionFit",
          "trendTouch",
          "stylingTips"
        ],
        properties: {
          title: { type: "string" },
          items: { type: "array", items: { type: "string" }, minItems: 2 },
          paletteExplanation: { type: "string" },
          compatibilityNotes: { type: "string" },
          occasionFit: { type: "string" },
          trendTouch: { type: "string" },
          stylingTips: { type: "array", items: { type: "string" }, minItems: 1 }
        }
      }
    }
  }
} as const;

type GenerateInput = {
  items: Array<{
    name: string;
    category: string;
    colors: string[];
    styleNotes?: string;
    formality: "casual" | "smart casual" | "business" | "formal" | "evening";
    weather: Array<"hot" | "warm" | "mild" | "cool" | "cold" | "rainy">;
  }>;
  occasion?: string;
  preferences?: {
    colorPalette?: string;
    styleKeywords?: string[];
    avoid?: string[];
  };
  count?: number;
};

type GenerateResult = {
  success: true;
  outfits: Array<{
    title: string;
    items: string[];
    paletteExplanation: string;
    compatibilityNotes: string;
    occasionFit: string;
    trendTouch: string;
    stylingTips: string[];
  }>;
};

function buildPrompt(input: GenerateInput): string {
  const { items, occasion, preferences, count } = input;
  const lines: string[] = [];

  lines.push("You are StyleWeaver, a fashion strategist blending colour theory, silhouette balance, and trend analysis.");
  lines.push("Craft outfits that feel intentional, wearable, and grounded in contemporary style cues.");
  lines.push("");
  lines.push("Wardrobe items:");
  items.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name} (${item.category}) | colours: ${item.colors.join(", ")} | formality: ${item.formality} | weather: ${item.weather.join(", ")}${
        item.styleNotes ? ` | notes: ${item.styleNotes}` : ""
      }`
    );
  });

  if (occasion) {
    lines.push("");
    lines.push(`Occasion: ${occasion}`);
  }

  if (preferences) {
    lines.push("");
    lines.push("Preferences:");
    if (preferences.colorPalette) {
      lines.push(`- Palette: ${preferences.colorPalette}`);
    }
    if (preferences.styleKeywords?.length) {
      lines.push(`- Style keywords: ${preferences.styleKeywords.join(", ")}`);
    }
    if (preferences.avoid?.length) {
      lines.push(`- Avoid: ${preferences.avoid.join(", ")}`);
    }
  }

  lines.push("");
  lines.push(`Generate ${count ?? 3} complete outfit${count === 1 ? "" : "s"} following the JSON schema provided.`);
  lines.push("Focus on colour harmony (complementary, analogous, triadic, monochrome), silhouette compatibility, and trend relevance.");

  return lines.join("\n");
}

async function createOutfits(input: GenerateInput): Promise<GenerateResult> {
  const fallback = buildFallbackOutfit(input);

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "Respond ONLY with JSON matching the provided schema."
        },
        {
          role: "user",
          content: buildPrompt(input)
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "StyleWeaverOutfits",
          schema: generateResultSchema
        }
      }
    });

    const outputText = typeof response.output_text === "string" ? response.output_text : undefined;
    const jsonText =
      outputText ??
      (Array.isArray(response.output)
        ? response.output
            .flatMap((item) => {
              if (item.type === "output_text" && Array.isArray(item.content)) {
                return item.content
                  .map((content) => (content as { text?: string }).text)
                  .filter((text): text is string => typeof text === "string");
              }
              if (item.type === "message" && Array.isArray(item.content)) {
                return item.content
                  .map((content) =>
                    content.type === "output_text" ? (content as { text?: string }).text : undefined
                  )
                  .filter((text): text is string => typeof text === "string");
              }
              return [];
            })
            .join("")
        : undefined);

    if (!jsonText) {
      return fallback;
    }

    const parsed = JSON.parse(jsonText) as GenerateResult;

    if (!parsed.outfits?.length) {
      return fallback;
    }

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      console.warn("OpenAI response failure", error.message);
    } else {
      console.warn("OpenAI response failure", error);
    }
    return fallback;
  }
}

function buildFallbackOutfit(input: Partial<GenerateInput>): GenerateResult {
  const items = Array.isArray(input.items) ? input.items : [];
  const first = items[0];
  const second = items[1];
  const palette = first?.colors.join(", ") ?? "neutral";

  return {
    success: true,
    outfits: [
      {
        title: "Effortless tonal balance",
        items: [
          first ? `${first.name} (${first.category})` : "Silky blouse",
          second ? `${second.name} (${second.category})` : "Tailored trousers"
        ],
        paletteExplanation: `Centred on ${palette} shades for a cohesive impression, echoing ${input.preferences?.colorPalette ?? "classic tonal harmony"}.`,
        compatibilityNotes: "Combines structure and softness to flatter varied proportions while staying comfortable.",
        occasionFit: input.occasion ? `Adapted for ${input.occasion} with optional layering.` : "Versatile from daytime meetings to elevated evenings.",
        trendTouch: "Highlights subtle metallic accessories—a current micro-trend for understated glamour.",
        stylingTips: [
          "Introduce texture contrast via knit or leather accessories for depth.",
          "Finish with footwear matching the darkest garment to elongate the silhouette."
        ]
      }
    ]
  };
}

server.registerTool(
  "generateOutfits",
  {
    description:
      "generate intelligent outfits using OpenAI considering color harmony (complementary/analogous/triadic/monochrome), silhouette compatibility (proportions, structure vs drape), occasion/formality, and current trends.",
    input_schema: generateInputSchema
  },
  async (input) => {
    const payload = (input ?? {}) as Partial<GenerateInput>;

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return buildFallbackOutfit({
        items: [],
        occasion: payload.occasion,
        preferences: payload.preferences,
        count: payload.count
      });
    }

    const result = await createOutfits(payload as GenerateInput);
    return result;
  }
);

const saveOutfitSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "items", "stylingNotes"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    items: { type: "array", items: { type: "string" }, minItems: 1 },
    stylingNotes: { type: "string" },
    inspiration: { type: "string" }
  }
} as const;

type SaveInput = {
  title: string;
  summary: string;
  items: string[];
  stylingNotes: string;
  inspiration?: string;
};

async function persistOutfit(entry: SaveInput): Promise<void> {
  const targetDir = path.resolve(process.cwd(), "configs");
  const targetPath = path.join(targetDir, "saved-outfits.json");

  await fs.mkdir(targetDir, { recursive: true });

  let existing: SaveInput[] = [];
  try {
    const current = await fs.readFile(targetPath, "utf-8");
    existing = JSON.parse(current) as SaveInput[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  const updated = [entry, ...existing];
  await fs.writeFile(targetPath, JSON.stringify(updated, null, 2), "utf-8");
}

server.registerTool(
  "saveOutfit",
  {
    description: "Persist an outfit summary for later reference.",
    input_schema: saveOutfitSchema
  },
  async (input) => {
    const payload = (input ?? {}) as Partial<SaveInput>;

    if (!payload.title || !payload.summary || !Array.isArray(payload.items) || !payload.items.length || !payload.stylingNotes) {
      return { success: false, message: "Missing required fields." };
    }

    try {
      await persistOutfit(payload as SaveInput);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        console.warn("Failed to save outfit", error.message);
        return { success: false, message: error.message };
      }
      console.warn("Failed to save outfit", error);
      return { success: false, message: "Unknown error" };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

export default server;
