# StyleWeaver

StyleWeaver is an OpenAI Apps SDK experience that weaves curated outfits from a user's wardrobe. The project ships with a
Model Context Protocol (MCP) server that integrates the OpenAI API for real outfit generation and a React front-end designed
for ChatGPT inline and fullscreen surfaces.

## Getting Started

1. Install dependencies: `npm install`.
2. Configure your environment by setting `OPENAI_API_KEY`.
3. Launch the MCP server: `npm run dev:server`.
4. Serve the app bundle inside the ChatGPT Apps runtime via `npm run dev:app`.

The inline widget allows you to seed wardrobe items quickly, generate outfits, and open the fullscreen atelier for deeper
creative direction. Generated outfits can be saved back through the MCP server via the `saveOutfit` tool.
