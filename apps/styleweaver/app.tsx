import React, { useCallback, useMemo, useState } from "react";

type WardrobeItem = {
  name: string;
  category: string;
  colors: string[];
  styleNotes?: string;
  formality: "casual" | "smart casual" | "business" | "formal" | "evening";
  weather: Array<"hot" | "warm" | "mild" | "cool" | "cold" | "rainy">;
};

type OutfitPlan = {
  title: string;
  items: string[];
  paletteExplanation: string;
  compatibilityNotes: string;
  occasionFit: string;
  trendTouch: string;
  stylingTips: string[];
};

type Preferences = {
  colorPalette?: string;
  styleKeywords?: string[];
  avoid?: string[];
};

type GeneratePayload = {
  items: WardrobeItem[];
  occasion?: string;
  preferences?: Preferences;
  count?: number;
};

type GenerateResponse = {
  success: boolean;
  outfits: OutfitPlan[];
};

declare global {
  interface Window {
    styleWeaverMcp?: {
      callTool: (name: string, input: unknown) => Promise<unknown>;
    };
  }
}

const defaultItem: WardrobeItem = {
  name: "",
  category: "",
  colors: [""],
  formality: "casual",
  weather: ["mild"]
};

const palettePlaceholder = "e.g. warm earth tones, jewel, monochrome";

async function callGenerateOutfits(payload: GeneratePayload): Promise<OutfitPlan[]> {
  const toolClient = typeof window !== "undefined" ? window.styleWeaverMcp : undefined;

  if (toolClient?.callTool) {
    const raw = await toolClient.callTool("generateOutfits", payload);
    if (raw && typeof raw === "object" && "outfits" in raw) {
      return (raw as GenerateResponse).outfits;
    }
  }

  try {
    const response = await fetch("/generateOutfits-dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<GenerateResponse>;
      if (data?.outfits?.length) {
        return data.outfits;
      }
    }
  } catch (err) {
    console.warn("Dev fallback request failed", err);
  }

  // Safe fallback if all else fails
  const pool = Array.isArray(payload.items) ? payload.items : [];
  const firstTop = pool.find((item) => item.category.toLowerCase().includes("top"));
  const firstBottom = pool.find(
    (item) => item.category.toLowerCase().includes("pant") || item.category.toLowerCase().includes("skirt")
  );
  const colors = firstTop?.colors ?? pool[0]?.colors ?? ["neutral"];
  const colorBlend = colors.join(", ");

  return [
    {
      title: "Polished fallback ensemble",
      items: [
        firstTop ? `${firstTop.name} (${firstTop.category})` : pool[0]?.name ?? "Favorite top",
        firstBottom ? `${firstBottom.name} (${firstBottom.category})` : "Tailored trousers"
      ],
      paletteExplanation: `Harmonised around ${colorBlend} for a balanced look that feels cohesive even without AI assistance.`,
      compatibilityNotes: "Balanced proportions between upper and lower garments, maintaining comfort and structure.",
      occasionFit: payload.occasion
        ? `Adapted for ${payload.occasion} with versatile layering pieces.`
        : "Adaptable for a range of day-to-night settings.",
      trendTouch: "Incorporates current texture play trend with a mix of matte and subtle sheen finishes.",
      stylingTips: [
        "Add a statement accessory in a complementary tone to energise the palette.",
        "Finish with footwear that matches either the lightest or darkest garment for cohesion."
      ]
    }
  ];
}

function normaliseList(value: string): string[] | undefined {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : undefined;
}

const App: React.FC = () => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [draft, setDraft] = useState<WardrobeItem>(defaultItem);
  const [occasion, setOccasion] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({});
  const [count, setCount] = useState(3);
  const [outfits, setOutfits] = useState<OutfitPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddItem = useMemo(() => draft.name && draft.category && draft.colors.filter(Boolean).length > 0, [draft]);

  const resetDraft = useCallback(() => {
    setDraft({ ...defaultItem, colors: [""], weather: ["mild"] });
  }, []);

  const handleAddItem = useCallback(() => {
    if (!canAddItem) return;
    const cleanedColors = draft.colors.map((color) => color.trim()).filter(Boolean);
    const cleanedWeather = Array.from(new Set(draft.weather));
    setItems((prev) => [...prev, { ...draft, colors: cleanedColors, weather: cleanedWeather }]);
    resetDraft();
  }, [canAddItem, draft, resetDraft]);

  const handleGenerate = useCallback(async () => {
    if (!items.length) {
      setError("Add at least one wardrobe item to generate outfits.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: GeneratePayload = {
        items,
        occasion: occasion || undefined,
        preferences: {
          colorPalette: preferences.colorPalette || undefined,
          styleKeywords: preferences.styleKeywords?.filter(Boolean),
          avoid: preferences.avoid?.filter(Boolean)
        },
        count
      };

      const result = await callGenerateOutfits(payload);
      setOutfits(result);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while generating outfits. A fallback ensemble has been provided.");
    } finally {
      setIsLoading(false);
    }
  }, [items, occasion, preferences, count]);

  return (
    <div className="app-container" style={{ fontFamily: "Inter, system-ui, sans-serif", padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>StyleWeaver</h1>
        <p style={{ color: "#555" }}>
          Blend your wardrobe into intelligent outfits with colour harmony, silhouette balance, and trend-aware guidance.
        </p>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Wardrobe items</h2>
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            background: "#fafafa",
            padding: "1rem",
            borderRadius: "0.75rem",
            border: "1px solid #e3e3e3"
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Name</span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Tailored blazer"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Category</span>
            <input
              value={draft.category}
              onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="Outerwear"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Colours</span>
            <input
              value={draft.colors.join(", ")}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, colors: event.target.value.split(",").map((token) => token.trim()) }))
              }
              placeholder="charcoal, stone"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Style notes</span>
            <input
              value={draft.styleNotes ?? ""}
              onChange={(event) => setDraft((prev) => ({ ...prev, styleNotes: event.target.value || undefined }))}
              placeholder="Structured shoulders"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Formality</span>
            <select
              value={draft.formality}
              onChange={(event) => setDraft((prev) => ({ ...prev, formality: event.target.value as WardrobeItem["formality"] }))}
            >
              <option value="casual">Casual</option>
              <option value="smart casual">Smart casual</option>
              <option value="business">Business</option>
              <option value="formal">Formal</option>
              <option value="evening">Evening</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Weather readiness</span>
            <select
              multiple
              size={3}
              value={draft.weather}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  weather: Array.from(event.target.selectedOptions).map((option) => option.value as WardrobeItem["weather"][number])
                }))
              }
            >
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="mild">Mild</option>
              <option value="cool">Cool</option>
              <option value="cold">Cold</option>
              <option value="rainy">Rainy</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={handleAddItem} disabled={!canAddItem} style={{ padding: "0.5rem 1rem", borderRadius: "999px" }}>
            Add item
          </button>
          {!canAddItem && <span style={{ color: "#999" }}>Provide name, category, and at least one colour.</span>}
        </div>
        {items.length > 0 && (
          <ul style={{ marginTop: "1rem", paddingLeft: "1.25rem" }}>
            {items.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong> · {item.category} · {item.colors.join(", ")} · {item.formality}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Context</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Occasion</span>
            <input value={occasion} onChange={(event) => setOccasion(event.target.value)} placeholder="Gallery opening" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Preferred colour palette</span>
            <input
              value={preferences.colorPalette ?? ""}
              onChange={(event) => setPreferences((prev) => ({ ...prev, colorPalette: event.target.value || undefined }))}
              placeholder={palettePlaceholder}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Style keywords</span>
            <input
              value={preferences.styleKeywords?.join(", ") ?? ""}
              onChange={(event) => setPreferences((prev) => ({ ...prev, styleKeywords: normaliseList(event.target.value) }))}
              placeholder="minimalist, architectural"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Avoid</span>
            <input
              value={preferences.avoid?.join(", ") ?? ""}
              onChange={(event) => setPreferences((prev) => ({ ...prev, avoid: normaliseList(event.target.value) }))}
              placeholder="ruffles, neon"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span>Outfit count</span>
            <input
              type="number"
              min={1}
              value={count}
              onChange={(event) => setCount(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
            />
          </label>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1.1rem",
            borderRadius: "999px",
            background: "#111",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          {isLoading ? "Weaving outfits..." : "Generate outfits"}
        </button>
        {error && <p style={{ color: "#c0392b", marginTop: "0.75rem" }}>{error}</p>}
      </section>

      <section>
        <h2>Outfit recommendations</h2>
        {outfits.length === 0 ? (
          <p style={{ color: "#777" }}>Generated looks will appear here with palette, fit, and styling insight.</p>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {outfits.map((outfit, index) => (
              <article key={index} style={{ border: "1px solid #e3e3e3", borderRadius: "1rem", padding: "1.5rem", background: "white" }}>
                <header style={{ marginBottom: "0.75rem" }}>
                  <h3 style={{ margin: 0 }}>{outfit.title}</h3>
                  <p style={{ color: "#666" }}>{outfit.occasionFit}</p>
                </header>
                <p><strong>Items:</strong> {outfit.items.join(", ")}</p>
                <p><strong>Palette:</strong> {outfit.paletteExplanation}</p>
                <p><strong>Compatibility:</strong> {outfit.compatibilityNotes}</p>
                <p><strong>Trend touch:</strong> {outfit.trendTouch}</p>
                <div>
                  <strong>Styling tips</strong>
                  <ul>
                    {outfit.stylingTips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
