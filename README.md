# Technology Enhanced Learning

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create `.env.local` for environment variables:
```
NEXT_PUBLIC_PROVIDER=mock
PROVIDER_API_KEY=
```

By default, the app uses a mock provider. Set `NEXT_PUBLIC_PROVIDER=mock` or leave `PROVIDER_API_KEY` unset to use the mock stream.

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

1. Edit `src/lib/provider.ts`
2. Replace the mock implementation with your provider's API
3. Set your API key in `.env.local`:
```
PROVIDER_API_KEY=your-api-key-here
```
