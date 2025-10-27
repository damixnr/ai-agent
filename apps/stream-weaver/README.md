# Stream Weaver

Stream Weaver is a ChatGPT Apps SDK experience focused on inclusive fashion guidance. It combines empathetic conversation patterns with structured outfit data so users can make confident wardrobe choices for any occasion.

## App concept

* **Role** – A co-stylist that listens first, clarifies goals, then presents at least two curated outfit pathways.
* **Tone** – Encouraging, body-positive, budget-aware, and sustainability-minded.
* **Data** – A small seed library of outfit bundles organized by occasion and budget. The assistant can remix ideas even when an exact match is unavailable.

## Project structure

```
apps/stream-weaver
├── app.json              # Manifest metadata consumed by ChatGPT Apps
├── package.json          # SDK tooling scripts and dependencies
├── tsconfig.json         # TypeScript configuration for the app runtime
├── README.md             # Project overview and contribution tips
└── src
    ├── index.ts          # Core ChatGPT App definition using the SDK
    └── data
        └── outfitLibrary.ts
```

## Key capabilities

* Collects and filters outfit bundles based on occasion, weather, budget, and keyword cues.
* Encourages inclusive styling by highlighting accessibility and sustainability considerations.
* Ships with UI card content to help users understand how Stream Weaver personalizes recommendations.

## Local development

> **Note:** The dependency versions mirror OpenAI's official Apps SDK examples. Install packages before running commands.

```bash
npm install
npm run dev
```

Use `npm run build` to produce a distributable bundle or `npm run lint` to validate coding standards.

## Extending the fashion library

Add new `OutfitBundle` entries in `src/data/outfitLibrary.ts`. Each bundle can specify a `sustainabilityTip` and multiple `options` to cover various style moods or accessibility needs.
