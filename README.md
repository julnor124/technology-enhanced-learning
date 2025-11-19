# Technology Enhanced Learning

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` for environment variables:
```
NEXT_PUBLIC_PROVIDER=mock
PROVIDER_API_KEY=
PROVIDER_MODEL=gpt-4o-mini
PROVIDER_ENDPOINT=https://api.openai.com/v1/chat/completions
```

By default, the app uses a mock provider (no network calls). Remove `NEXT_PUBLIC_PROVIDER=mock` and provide a valid `PROVIDER_API_KEY` to stream responses from your OpenAI-compatible backend. You can also point `PROVIDER_ENDPOINT` to a fully compatible proxy such as Together, Groq, or an on-prem router.

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Connecting a Real AI Provider

1. Set `PROVIDER_API_KEY`, `PROVIDER_MODEL`, and (optionally) `PROVIDER_ENDPOINT` in `.env.local`.
2. Ensure the endpoint is OpenAI Chat Completions compatible (supports SSE streaming).
3. Deploy normally—`src/lib/provider.ts` already handles chunked streaming and will fall back to the mock implementation if env vars are missing.
