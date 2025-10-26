import React from "react";
import { OutfitRecommendation } from "../types";

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  onSave?: (outfit: OutfitRecommendation) => void;
  disabled?: boolean;
}

const cardStyles: React.CSSProperties = {
  borderRadius: "20px",
  padding: "18px",
  background: "linear-gradient(145deg, rgba(250,250,250,0.92), rgba(230,230,230,0.85))",
  boxShadow: "0 12px 30px rgba(15, 30, 45, 0.12)",
  border: "1px solid rgba(255,255,255,0.6)",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const pillStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  padding: "4px 12px",
  background: "rgba(0,0,0,0.05)",
  fontSize: "0.75rem",
  letterSpacing: "0.02em",
  fontWeight: 600,
  textTransform: "uppercase",
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "#4b5563",
  textTransform: "uppercase",
};

export default function OutfitCard({ outfit, onSave, disabled }: OutfitCardProps) {
  return (
    <article style={cardStyles}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{outfit.title}</h3>
        <span style={pillStyles}>Trend: {outfit.trendInspiration}</span>
      </header>
      <section>
        <div style={sectionTitleStyles}>Key Pieces</div>
        <ul style={{ margin: "6px 0", paddingLeft: "18px", color: "#111827" }}>
          {outfit.items.map((item) => (
            <li key={item} style={{ marginBottom: "4px" }}>
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <div style={sectionTitleStyles}>Color Story</div>
        <p style={{ margin: "6px 0", color: "#1f2937", lineHeight: 1.6 }}>{outfit.colorTheory}</p>
      </section>
      <section>
        <div style={sectionTitleStyles}>Styling Notes</div>
        <p style={{ margin: "6px 0", color: "#1f2937", lineHeight: 1.6 }}>{outfit.stylingNotes}</p>
      </section>
      <section>
        <div style={sectionTitleStyles}>Occasion Fit</div>
        <p style={{ margin: "6px 0", color: "#1f2937", lineHeight: 1.6 }}>{outfit.occasionFit}</p>
      </section>
      {onSave && (
        <button
          type="button"
          onClick={() => onSave(outfit)}
          disabled={disabled}
          style={{
            alignSelf: "flex-start",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "10px 20px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Save Lookbook Entry
        </button>
      )}
    </article>
  );
}
