import React, { useEffect, useMemo, useState } from "react";
import OutfitCard from "./OutfitCard";
import { AnalyzeWardrobeInput, OutfitRecommendation, WardrobeItem } from "../types";

interface StyleWeaverInlineProps {
  controller: {
    analyzeWardrobe: (input: AnalyzeWardrobeInput) => Promise<{ outfits: { outfits: OutfitRecommendation[] } }>;
    saveOutfit: (outfit: OutfitRecommendation) => Promise<unknown>;
    loadState: () => Promise<OutfitRecommendation[]>;
    persistState: (value: OutfitRecommendation[]) => Promise<void>;
    openFullscreen: (state?: unknown) => Promise<void>;
  };
}

interface WardrobeDraftItem {
  name: string;
  category: string;
  colors: string;
  notes: string;
  formality: WardrobeItem["formality"];
  weather: string;
}

const defaultDraft: WardrobeDraftItem = {
  name: "Organic cotton tee",
  category: "top",
  colors: "ivory, bone",
  notes: "Relaxed fit, drop shoulder",
  formality: "casual",
  weather: "warm, mild",
};

export default function StyleWeaverInline({ controller }: StyleWeaverInlineProps) {
  const [draft, setDraft] = useState<WardrobeDraftItem>(defaultDraft);
  const [wardrobe, setWardrobe] = useState<WardrobeDraftItem[]>([defaultDraft]);
  const [occasion, setOccasion] = useState("Weeknight creative industry event");
  const [palette, setPalette] = useState("soft neutrals with a pop");
  const [keywords, setKeywords] = useState("minimalist, artful");
  const [avoid, setAvoid] = useState("neon");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);

  useEffect(() => {
    controller.loadState().then((saved) => {
      if (saved.length) {
        setRecommendations(saved);
      }
    });
  }, [controller]);

  const formattedWardrobe = useMemo(() =>
    wardrobe.map<WardrobeItem>((item) => ({
      name: item.name,
      category: item.category,
      colors: item.colors.split(",").map((c) => c.trim()).filter(Boolean),
      styleNotes: item.notes,
      formality: item.formality,
      weather: item.weather
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry): entry is WardrobeItem["weather"][number] =>
          ["hot", "warm", "mild", "cool", "cold", "rainy"].includes(entry as any)
        ),
    })),
  [wardrobe]);

  const handleAddWardrobe = () => {
    setWardrobe((prev) => [...prev, draft]);
    setDraft({
      ...defaultDraft,
      name: "Italian wool blazer",
      category: "layer",
      colors: "charcoal",
      notes: "Sharp shoulders",
      weather: "cool, evening",
    });
  };

  const handleGenerate = async () => {
    const input: AnalyzeWardrobeInput = {
      items: formattedWardrobe,
      occasion,
      preferences: {
        colorPalette: palette,
        styleKeywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        avoid: avoid.split(",").map((k) => k.trim()).filter(Boolean),
      },
      count: 3,
    };

    setLoading(true);
    try {
      const result = await controller.analyzeWardrobe(input);
      const outfits = result.outfits?.outfits ?? [];
      setRecommendations(outfits);
      await controller.persistState(outfits);
    } catch (error: any) {
      console.error("StyleWeaver failed to analyze wardrobe", error);
      alert(error?.message ?? "Unable to generate outfits. Confirm your MCP server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (outfit: OutfitRecommendation) => {
    try {
      await controller.saveOutfit(outfit);
    } catch (error: any) {
      console.error("Failed to save outfit", error);
      alert("Unable to save outfit in the MCP server.");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #fdfcfa 0%, #f5f3ff 100%)",
        borderRadius: "24px",
        padding: "20px",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.18)",
        border: "1px solid rgba(255,255,255,0.8)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "720px",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>StyleWeaver</h2>
          <p style={{ marginTop: "6px", color: "#4b5563", lineHeight: 1.5 }}>
            Feed StyleWeaver a peek into your wardrobe and get runway-ready outfit combinations that honor your vibe and the
            moment you are dressing for.
          </p>
        </div>
        <button
          type="button"
          onClick={() => controller.openFullscreen({ outfits: recommendations, wardrobe: formattedWardrobe })}
          style={{
            background: "white",
            border: "1px solid rgba(148, 163, 184, 0.4)",
            borderRadius: "999px",
            padding: "10px 18px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
          }}
        >
          Expand Studio
        </button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em" }}>Piece</span>
          <input
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em" }}>Category</span>
          <input
            value={draft.category}
            onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em" }}>Colors</span>
          <input
            value={draft.colors}
            onChange={(e) => setDraft((prev) => ({ ...prev, colors: e.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em" }}>Notes</span>
          <input
            value={draft.notes}
            onChange={(e) => setDraft((prev) => ({ ...prev, notes: e.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569", letterSpacing: "0.05em" }}>Weather</span>
          <input
            value={draft.weather}
            onChange={(e) => setDraft((prev) => ({ ...prev, weather: e.target.value }))}
            style={inputStyle}
            placeholder="warm, rainy"
          />
        </label>
      </section>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleAddWardrobe}
          style={{
            background: "#0f172a",
            color: "white",
            borderRadius: "999px",
            padding: "10px 18px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add to Wardrobe
        </button>
        <div style={{ fontSize: "0.85rem", color: "#475569" }}>{wardrobe.length} pieces saved</div>
      </div>

      <section style={{ display: "grid", gap: "12px" }}>
        <label style={preferenceLabelStyle}>
          <span>Occasion</span>
          <input value={occasion} onChange={(e) => setOccasion(e.target.value)} style={inputStyle} />
        </label>
        <label style={preferenceLabelStyle}>
          <span>Preferred Palette</span>
          <input value={palette} onChange={(e) => setPalette(e.target.value)} style={inputStyle} />
        </label>
        <label style={preferenceLabelStyle}>
          <span>Style Keywords</span>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} style={inputStyle} />
        </label>
        <label style={preferenceLabelStyle}>
          <span>Avoid</span>
          <input value={avoid} onChange={(e) => setAvoid(e.target.value)} style={inputStyle} />
        </label>
      </section>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        style={{
          background: "linear-gradient(135deg, #1f2937, #111827)",
          color: "white",
          borderRadius: "999px",
          padding: "12px 24px",
          border: "none",
          fontWeight: 600,
          letterSpacing: "0.08em",
          cursor: loading ? "progress" : "pointer",
          alignSelf: "flex-start",
          boxShadow: "0 12px 25px rgba(15, 23, 42, 0.2)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Weaving looks..." : "Weave Outfits"}
      </button>

      {recommendations.length > 0 && (
        <section style={{ display: "grid", gap: "14px" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Latest Looks</h3>
          <div style={{ display: "grid", gap: "14px" }}>
            {recommendations.map((outfit) => (
              <OutfitCard key={outfit.title} outfit={outfit} onSave={handleSave} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.4)",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.8)",
  fontSize: "0.9rem",
};

const preferenceLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  fontSize: "0.85rem",
  color: "#475569",
  fontWeight: 600,
  letterSpacing: "0.04em",
};
