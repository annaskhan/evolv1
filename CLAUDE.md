# LiveListen - Evolv

Real-time audio translation app supporting 10 languages with AI-powered transcription and translation. Built as a PWA with native mobile support via Capacitor.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with PostCSS
- **AI/Translation:** Anthropic Claude SDK (Haiku 4.5) for translation, Deepgram Nova-3 for speech recognition
- **Mobile:** Capacitor 8 (iOS & Android)
- **Testing:** Vitest
- **Package Manager:** npm

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run build:static  # Static export for Capacitor (sets STATIC_EXPORT=true)
npm test              # Run tests (vitest run)
npm run test:watch    # Watch mode tests
npm run lint          # ESLint via next lint
npm run typecheck     # TypeScript type checking (tsc --noEmit)
npm run mobile:build  # Build static + capacitor sync
npm run cap:sync      # Sync Capacitor
```

## Project Structure

```
src/
├── app/                      # Next.js App Router pages & API routes
│   ├── page.tsx              # Main application
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles & animations
│   ├── api/translate/        # Claude translation endpoint (streaming)
│   ├── api/deepgram-token/   # Deepgram token endpoint
│   ├── privacy/              # Privacy policy
│   └── terms/                # Terms of service
├── components/               # React components (ConsentBanner, OnboardingScreen, PermissionGate, SettingsModal, SessionViewer, HistoryModal)
├── hooks/                    # Custom hooks (useAppLifecycle, useAudioVisualizer, useOnlineStatus, useReducedMotion)
├── lib/                      # Utilities (constants.ts for languages, sessions.ts for localStorage)
├── __tests__/                # Vitest tests
└── speech.d.ts               # Web Speech API types
public/
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
└── *.png                     # App icons
```

## Environment Variables

Required in `.env.local` (see `.env.example`):
- `ANTHROPIC_API_KEY` - Claude API key for translation
- `DEEPGRAM_API_KEY` - Deepgram API key for speech recognition

Optional:
- `NEXT_PUBLIC_API_BASE_URL` - API base URL (defaults to empty)
- `STATIC_EXPORT` - Set to `true` for Capacitor mobile builds

## Key Architecture Decisions

- **Translation API** (`src/app/api/translate/route.ts`): Streaming responses, rate-limited (60 req/min per IP), max 2000 chars, context-aware with prior translations for coherence. Special handling for Islamic/religious terminology.
- **Speech Recognition**: Deepgram WebSocket with utterance end detection (2000ms). Falls back gracefully on connection issues.
- **Session Storage**: localStorage-based, max 50 sessions, exportable as text.
- **PWA**: Service worker uses network-first for API routes, stale-while-revalidate for static assets.
- **Security**: Strong CSP headers, X-Frame-Options DENY, input validation, prompt injection prevention.

## Supported Languages

Arabic (RTL), English, French, Spanish, Urdu (RTL), Turkish, Malay, Indonesian, Bengali, Somali

## Code Conventions

- Path alias: `@/*` maps to `./src/*`
- TypeScript strict mode enabled
- Dark theme with warm accent colors (#c4a882)
- Mobile-first responsive design
- Accessibility: reduced motion support, ARIA labels, RTL support
