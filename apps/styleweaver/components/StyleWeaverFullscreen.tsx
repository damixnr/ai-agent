import React, { useEffect, useMemo, useState } from "react";
import OutfitCard from "./OutfitCard";
import { AnalyzeWardrobeInput, OutfitRecommendation, WardrobeItem } from "../types";

interface StyleWeaverFullscreenProps {
  controller: {
    analyzeWardrobe: (input: AnalyzeWardrobeInput) => Promise<{ outfits: { outfits: OutfitRecommendation[] } }>;
    saveOutfit: (outfit: OutfitRecommendation) => Promise<unknown>;
    loadState: () => Promise<OutfitRecommendation[]>;
    persistState: (value: OutfitRecommendation[]) => Promise<void>;
  };
  initialState: {
    outfits?: OutfitRecommendation[];
    wardrobe?: WardrobeItem[];
  };
}

export default function StyleWeaverFullscreen({ controller, initialState }: StyleWeaverFullscreenProps) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(initialState.wardrobe ?? []);
  const [count, setCount] = useState(3);
  const [occasion, setOccasion] = useState("Creative director portfolio review");
  const [moodboard, setMoodboard] = useState("Modernist, confident, textured");
  const [avoid, setAvoid] = useState("overly corporate, rigid silhouettes");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>(initialState.outfits ?? []);

  useEffect(() => {
    if (!recommendations.length) {
      controller.loadState().then((saved) => {
        if (saved.length) {
          setRecommendations(saved);
        }
      });
    }
  }, []);

  const wardrobeTable = useMemo(
    () =>
      wardrobe.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(148, 163, 184, 0.4)" }}>
              <th style={headCell}>Item</th>
              <th style={headCell}>Category</th>
              <th style={headCell}>Colors</th>
              <th style={headCell}>Notes</th>
              <th style={headCell}>Formality</th>
              <th style={headCell}>Weather</th>
            </tr>
          </thead>
          <tbody>
            {wardrobe.map((item) => (
              <tr key={item.name} style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}>
                <td style={bodyCell}>{item.name}</td>
                <td style={bodyCell}>{item.category}</td>
                <td style={bodyCell}>{item.colors.join(", ")}</td>
                <td style={bodyCell}>{item.styleNotes ?? "—"}</td>
                <td style={bodyCell}>{item.formality}</td>
                <td style={bodyCell}>{item.weather.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#475569" }}>Add wardrobe context from the inline widget to unlock bespoke looks.</p>
      ),
    [wardrobe]
  );

  const handleGenerate = async () => {
    const input: AnalyzeWardrobeInput = {
      items: wardrobe,
      occasion,
      preferences: {
        colorPalette: moodboard,
        avoid: avoid.split(",").map((entry) => entry.trim()).filter(Boolean),
      },
      count,
    };

    setLoading(true);
    try {
      const result = await controller.analyzeWardrobe(input);
      const outfits = result.outfits?.outfits ?? [];
      setRecommendations(outfits);
      await controller.persistState(outfits);
    } catch (error: any) {
      console.error("StyleWeaver fullscreen failed", error);
      alert(error?.message ?? "Unable to reach the StyleWeaver MCP tools.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (outfit: OutfitRecommendation) => {
    try {
      await controller.saveOutfit(outfit);
    } catch (error: any) {
      console.error("Failed to save outfit", error);
      alert("Saving outfits failed. Check your MCP server logs.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e5e7ff 100%)",
        padding: "32px",
        boxSizing: "border-box",
        color: "#0f172a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>StyleWeaver Atelier</h1>
          <p style={{ marginTop: "8px", maxWidth: "760px", lineHeight: 1.6, color: "#334155" }}>
            StyleWeaver synthesizes color theory, proportion play, and current runway references to produce outfits that feel
            intentional. Refine prompts, request alternates, and archive your favorites to evolve your personal lookbook.
          </p>
        </div>
      </header>

      <section style={{ background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "24px", boxShadow: shadow }}>
        <h2 style={{ marginTop: 0 }}>Wardrobe Overview</h2>
        {wardrobeTable}
      </section>

      <section style={{ background: "rgba(255,255,255,0.85)", borderRadius: "24px", padding: "24px", boxShadow: shadow }}>
        <h2 style={{ marginTop: 0 }}>Creative Direction</h2>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <label style={fieldLabelStyle}>
            <span>Occasion</span>
            <input value={occasion} onChange={(e) => setOccasion(e.target.value)} style={fieldInputStyle} />
          </label>
          <label style={fieldLabelStyle}>
            <span>Color & Texture Vision</span>
            <input value={moodboard} onChange={(e) => setMoodboard(e.target.value)} style={fieldInputStyle} />
          </label>
          <label style={fieldLabelStyle}>
            <span>Elements to Avoid</span>
            <input value={avoid} onChange={(e) => setAvoid(e.target.value)} style={fieldInputStyle} />
          </label>
          <label style={fieldLabelStyle}>
            <span>Number of Outfits</span>
            <input
              type="number"
              min={1}
              max={5}
              value={count}
              onChange={(e) => setCount(Number.parseInt(e.target.value, 10))}
              style={fieldInputStyle}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          style={generateButtonStyle(loading)}
        >
          {loading ? "Curating" : "Generate Couture"}
        </button>
      </section>

      <section style={{ display: "grid", gap: "18px" }}>
        <h2 style={{ margin: 0 }}>Curated Looks</h2>
        {recommendations.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            {recommendations.map((outfit) => (
              <OutfitCard key={outfit.title} outfit={outfit} onSave={handleSave} />
            ))}
          </div>
        ) : (
          <p style={{ color: "#475569" }}>Once you generate outfits, they will appear here as collectible cards.</p>
        )}
      </section>
    </div>
  );
}

const shadow = "0 24px 60px rgba(15, 23, 42, 0.18)";

const headCell: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  padding: "10px 12px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const bodyCell: React.CSSProperties = {
  padding: "12px",
  fontSize: "0.9rem",
  verticalAlign: "top",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "0.85rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  color: "#475569",
};

const fieldInputStyle: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.5)",
  padding: "12px",
  fontSize: "0.95rem",
  background: "rgba(248, 250, 252, 0.9)",
};

const generateButtonStyle = (loading: boolean): React.CSSProperties => ({
  marginTop: "20px",
  alignSelf: "flex-start",
  background: "linear-gradient(120deg, #0f172a, #4338ca)",
  color: "white",
  borderRadius: "999px",
  padding: "14px 28px",
  border: "none",
  fontWeight: 600,
  letterSpacing: "0.08em",
  cursor: loading ? "progress" : "pointer",
  boxShadow: "0 18px 40px rgba(67, 56, 202, 0.25)",
  opacity: loading ? 0.7 : 1,
});
