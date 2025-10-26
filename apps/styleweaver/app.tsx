import React from "react";
import { createRoot } from "react-dom/client";
import InlineSurface from "./components/StyleWeaverInline";
import FullscreenSurface from "./components/StyleWeaverFullscreen";
import { OutfitRecommendation, AnalyzeWardrobeInput } from "./types";
import { readState, writeState } from "./state";

const STATE_KEY = "styleweaver:lastRecommendations";

async function analyzeWardrobe(input: AnalyzeWardrobeInput) {
  if (!window.openai?.actions?.callTool) {
    throw new Error("StyleWeaver is not connected to the OpenAI runtime. Tools are unavailable.");
  }
  return window.openai.actions.callTool({
    name: "analyzeWardrobe",
    arguments: input,
  });
}

async function saveOutfit(outfit: OutfitRecommendation) {
  if (!window.openai?.actions?.callTool) {
    throw new Error("OpenAI runtime is unavailable for saving outfits.");
  }
  return window.openai.actions.callTool({
    name: "saveOutfit",
    arguments: {
      title: outfit.title,
      summary: outfit.occasionFit,
      items: outfit.items,
      stylingNotes: outfit.stylingNotes,
      inspiration: outfit.trendInspiration,
    },
  });
}

function registerComponents() {
  const inlineId = "styleweaver:inline";
  const fullscreenId = "styleweaver:fullscreen";

  const openFullscreen = async (state?: unknown) => {
    if (!window.openai?.app?.openFullscreen) {
      throw new Error("Fullscreen mode is not supported in this environment.");
    }
    await window.openai.app.openFullscreen({
      id: fullscreenId,
      initialState: state,
    });
  };

  window.openai?.app?.registerComponent?.({
    id: inlineId,
    displayName: "StyleWeaver",
    render: ({ element }) => {
      const root = createRoot(element);
      const controller = {
        analyzeWardrobe,
        saveOutfit,
        loadState: () => readState<OutfitRecommendation[]>(STATE_KEY, []),
        persistState: (value: OutfitRecommendation[]) => writeState(STATE_KEY, value),
        openFullscreen,
      };
      root.render(<InlineSurface controller={controller} />);
      return () => root.unmount();
    },
  });

  window.openai?.app?.registerComponent?.({
    id: fullscreenId,
    displayName: "StyleWeaver",
    render: ({ element, state }) => {
      const root = createRoot(element);
      const controller = {
        analyzeWardrobe,
        saveOutfit,
        loadState: () => readState<OutfitRecommendation[]>(STATE_KEY, []),
        persistState: (value: OutfitRecommendation[]) => writeState(STATE_KEY, value),
      };
      root.render(
        <FullscreenSurface
          controller={controller}
          initialState={(state as { outfits?: OutfitRecommendation[] }) ?? {}}
        />
      );
      return () => root.unmount();
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", registerComponents);
} else {
  registerComponents();
}
