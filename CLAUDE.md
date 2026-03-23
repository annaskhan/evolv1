# Evolv

Personal growth companion app — track goals, journal your journey, and watch yourself grow. Built as a PWA with native mobile support via Capacitor.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 with PostCSS
- **AI:** Anthropic Claude SDK (Haiku 4.5) — used for AI coaching/insights (planned)
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
│   ├── page.tsx              # Home / Dashboard
│   ├── layout.tsx            # Root layout with AppShell
│   ├── globals.css           # Theme system, animations, component styles
│   ├── goals/page.tsx        # Goals management
│   ├── journal/page.tsx      # Journal entries
│   ├── progress/page.tsx     # Progress dashboard
│   ├── settings/page.tsx     # App settings
│   ├── api/translate/        # Claude translation endpoint (legacy)
│   └── api/deepgram-token/   # Deepgram token endpoint (legacy)
├── components/
│   ├── AppShell.tsx           # App wrapper (onboarding gate + nav)
│   ├── BottomNav.tsx          # Bottom tab navigation
│   ├── ThemeProvider.tsx      # Light/dark/system theme context
│   └── Onboarding.tsx         # Multi-step onboarding flow
├── lib/
│   ├── constants.ts           # App constants, focus areas, nav items
│   └── storage.ts             # localStorage helpers
├── __tests__/                 # Vitest tests
└── speech.d.ts                # Web Speech API types
public/
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker
└── *.png                      # App icons
```

## Environment Variables

Required in `.env.local` (see `.env.example`):
- `ANTHROPIC_API_KEY` - Claude API key for AI features

Optional:
- `STATIC_EXPORT` - Set to `true` for Capacitor mobile builds

## Key Architecture Decisions

- **Theme System**: Light/dark/system modes via CSS custom properties and `data-theme` attribute on `<html>`. ThemeProvider context.
- **Onboarding**: Multi-step flow (welcome → name → focus areas → ready). Stores state in localStorage. Gates the main app.
- **Navigation**: Bottom tab bar with 4 items (Home, Goals, Journal, Progress). Settings accessible from home page header.
- **Storage**: localStorage-based via `src/lib/storage.ts`. Keys prefixed with `evolv_`.
- **PWA**: Service worker with network-first for navigation, stale-while-revalidate for static assets.
- **Security**: Strong CSP headers, X-Frame-Options DENY.

## Code Conventions

- Path alias: `@/*` maps to `./src/*`
- TypeScript strict mode enabled
- Calming green/earth tone theme (primary: #2d6a4f)
- Mobile-first responsive design
- Accessibility: reduced motion support, ARIA labels, 44px touch targets, focus-visible styles
