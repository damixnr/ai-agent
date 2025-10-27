# StyleWeaver

StyleWeaver combines a local Vite React interface with an MCP v1 server to generate trend-aware outfits using the OpenAI API.

## Requirements

- Node.js 18+
- An OpenAI API key with access to `gpt-4o-mini`

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and add your OpenAI key:
   ```bash
   cp .env.example .env
   # then edit .env to set OPENAI_API_KEY
   ```
3. Start the MCP server:
   ```bash
   npm run dev:server
   ```
4. In a separate terminal, start the React app:
   ```bash
   npm run dev:app -- --host
   ```

The MCP server registers two tools:
- `generateOutfits` – calls OpenAI to create outfits grounded in colour theory, compatibility, and trends.
- `saveOutfit` – stores generated looks in `configs/saved-outfits.json` for later inspiration.

The UI includes a development fallback that attempts to POST to `/generateOutfits-dev` when no MCP bridge is connected, and otherwise surfaces a safe locally generated outfit.
