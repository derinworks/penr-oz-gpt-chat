# CLAUDE.md

Repository context for Claude Code. Facts below are derived from the code; when other
docs disagree, the code wins. Details: [README.md](README.md) (setup + quickstart),
[API.md](API.md) (request/response contracts for both layers).

## What this repo is

A GPT chat web client in TypeScript: a React 19 + Vite single-page app that streams
generated text from an Express 5 proxy, which orchestrates calls to the
[penr-oz-neural-network-v3-torch-ddp](https://github.com/derinworks/penr-oz-neural-network-v3-torch-ddp)
service (tokenize → generate → decode). Follows Karpathy's ng-video-lecture / nanoGPT /
nanochat lineage. No external LLM APIs — everything talks to that local service.

```
React client (:3000) ──► Express proxy (:3001) ──► Neural Network service (:8000)
```

## Module map

- `src/main.tsx`, `index.html` — Vite entry point
- `src/App.tsx` — chat UI + generation settings (model id, encoding, EOT token, block
  size, max tokens, temperature, top-k/top-p, device), persisted via `useLocalStorage`
- `src/api.ts` — client API: `tokenize`/`generate`/`decode` wrappers + `chatStream`
  (SSE parser for `/api/chat`)
- `src/components/` — `MessageList` (auto-scroll, streaming cursor), `ChatInput`
- `src/hooks/useLocalStorage.ts` — localStorage-backed `useState` (keys `chat.*`)
- `server/index.ts` — Express proxy: pass-through `/api/tokenize|generate|decode` plus
  orchestrated SSE `/api/chat`; exports `app`, listens only when run directly
- `.env.example` — all three env vars; `eslint.config.js`, `vitest.config.ts`,
  `tsconfig*.json`, `server/tsconfig.json` — toolchain config

## Commands

```bash
npm install            # or npm ci (CI uses Node 22)
npm run dev            # client (:3000) + proxy (:3001) together, watch mode
npm start              # Vite dev server only
npm run server         # Express proxy only (tsx); server:watch for auto-restart
npm run build          # tsc -b + vite build → dist/
npm run server:build   # tsc -p server/tsconfig.json → dist-server/
npm run lint           # eslint .
npm test               # vitest run — fully offline, fetch is mocked
npm run test:coverage  # vitest + v8 coverage with thresholds
```

CI (`.github/workflows/ci.yml`) runs on Node 22: `npm ci`, lint, client build, server
build, `npm test`. Coverage is not enforced in CI.

## Conventions

- TypeScript strict everywhere; ESM only (`"type": "module"`). ESLint flat config with
  typescript-eslint + react-hooks + react-refresh; `dist`/`dist-server` ignored.
- Tests live beside sources as `*.test.ts` (`server/index.test.ts`, `src/api.test.ts`,
  `src/hooks/useLocalStorage.test.ts`) and run with Vitest in a node environment;
  browser-dependent tests opt into jsdom via a `// @vitest-environment jsdom` pragma.
- Server tests use Supertest against the exported `app` and stub `fetch` with
  `vi.stubGlobal` **before** importing the app.
- Coverage thresholds (`vitest.config.ts`) apply only to `server/index.ts` and
  `src/api.ts`: lines 80, functions 75 (README's "80% line/function" is out of date).
- Keep API.md in sync when changing wire formats between the layers.

## Gotchas

- `/api/chat` SSE events carry **cumulative** text, not deltas: each flush re-decodes
  the full token list and `data: {"text": …}` replaces the transcript (the client's
  `onUpdate(fullText)` overwrites the last assistant message). API.md's
  `{"token": …}` event examples are stale — code wins.
- `eot_token` handling: it is appended to the message before `/tokenize/` so its last
  token id becomes `stop_token` for `/generate/`; empty/omitted (base models) sends no
  stop token. Decoded output is truncated at the first occurrence of the EOT string.
- The proxy buffers streamed token ids and flushes every ~500ms, re-decoding the
  cumulative list on each flush.
- Env-var split: `VITE_`-prefixed vars are baked into the client by Vite; unprefixed
  `PREDICTION_SERVER_URL` / `PORT` are read by the Express proxy via dotenv. In dev the
  client calls `/api/*` through the Vite proxy; production builds target
  `VITE_PROXY_SERVER_URL` directly (`src/api.ts`).
- Upstream timeout is 30s → 504; unreachable service → 502. Once SSE headers are
  flushed, errors arrive as `event: error` events, not HTTP status codes.
- `server/index.ts` starts listening only when it is the main entry point, so tests can
  import `app` without binding a port.
