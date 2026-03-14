# German Practice

A casual German language learning app for practicing vocabulary, nouns (gender/declension), verbs (conjugation across 7 tenses), and adjectives (declension/comparison). Built as a monorepo with a React Native mobile app, a terminal CLI, and an AI-powered vocabulary generator.

Vibe-coded by Harshvardhan Rao.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run mobile app (Expo)
pnpm mobile

# Run CLI
pnpm german

# Run tests
pnpm test

# Type-check
pnpm typecheck

# Lint & format
pnpm lint
```

## Repository Structure

```
german-app/
  assets/
    data/                     # JSON data files (nouns, verbs, adjectives, others)
  wordlists/                  # Plain-text word lists for tool-b input (A1-B2)
  packages/
    core/                     # Shared library: types, schemas, engine, generators, session
    mobile/                   # React Native (Expo) app
    web/                      # Vite + React web app (Cloudflare Pages)
    cli/                      # Terminal UI (Ink)
    tool-b/                   # Claude API vocabulary metadata generator
```

## Packages

### @german/core

Shared TypeScript library used by both the mobile app and CLI. Contains all business logic with no UI dependencies.

**Exports:**

| Export | Description |
|--------|-------------|
| `@german/core/types` | Type definitions, constants (`LEVELS`, `CATEGORIES`, `BATCH_SIZES`) |
| `@german/core/schemas` | Zod validation schemas for nouns, verbs, adjectives, others |
| `@german/core/engine` | Conjugation engine (7 tenses), noun declension, adjective declension |
| `@german/core/generators` | Card generators for each category + starred words |
| `@german/core/session` | Session FSM reducer, history key computation, base word extraction |
| `@german/core/data` | JSON data loaders with level filtering |
| `@german/core/dictionary` | Dictionary building, filtering, and merging |

**Session FSM:**

```
Setup ──START──▸ Active ──all answered──▸ Revision* ──queue empty──▸ Complete ──RESET──▸ Setup
                   │                         │
                   │ ANSWER_WRONG             │ ANSWER_WRONG
                   ▼                         ▼
              add to revision queue      add to next revision round
```

- `ANSWER_RIGHT`: advance to next card
- `ANSWER_WRONG`: add card to revision queue, advance
- After all cards: if revision queue non-empty, enter Revision phase
- Revision repeats until all wrong answers are corrected
- `correctFirstAttempt` only counted in Active phase

**Card Generation:**

| Category | Cards per item | Level gating |
|----------|---------------|--------------|
| Vocabulary | 1 per word (de→en or en→de) | All levels |
| Nouns | ~5 (gender + plural + declension cases) | All levels |
| Verbs | 2 (A1) → 4 (A2) → 6 (B1) → 7 (B2+) | Tenses unlock by level |
| Adjectives | Declension (3 paradigms × 4 cases) + comparison | All levels |

**Verb tenses by level:**

| Level | Tenses |
|-------|--------|
| A1 | Prasens, Perfekt |
| A2 | + Futur I, Prateritum |
| B1 | + Plusquamperfekt, Konjunktiv II |
| B2+ | + Konjunktiv I |

**Cumulative verb loading:** Verb exercises include all verbs from lower levels (A2 includes A1, B1 includes A1+A2, etc.) plus 9 core verbs (haben, sein, werden, konnen, mussen, sollen, wollen, durfen, mogen). The dictionary shows only level-specific words.

**Word prioritization:** In the vocabulary category, when 90%+ of words at a level have been encountered, unseen words are placed first in the shuffled batch.

### @german/mobile

React Native app built with Expo SDK 54, React 19, and React Native 0.81.

**Screens:**

| Screen | Purpose |
|--------|---------|
| `SplashVideo` | Plays startup animation (`AppStartScreenAnimation.mp4`) using `expo-video` |
| `SetupScreen` | Level → Category → Direction → Batch size selection. Also: dictionary, verb dictionary, starred words, word counter, exit |
| `FlashcardScreen` | Card display with tap-to-reveal, right/wrong buttons, star toggle, report button, expandable details |
| `CompleteScreen` | Session stats: cards, accuracy, revision rounds, time |
| `DictionaryScreen` | Searchable word list per level or all levels. Module-level cache persists across opens |
| `VerbDictionaryScreen` | Verb conjugation browser: searchable verb list → tense selection → full conjugation table with report button |
| `ExitScreen` | Shows app logo, exits after 1.5s (Android) |
| `ReportModal` | Issue reporting with type selection + optional comment, sent via webhook |
| `InfoModal` | Word counter explanation + reset option |

**Theme:** Dark theme with `#1a1a2e` background, `#e94560` accent, `#4ecca3` correct, `#f0a500` warning.

**Storage:** AsyncStorage for session history, encountered words (per level), starred words, and anonymous analytics ID.

**Config:** `src/config.ts` reads `REPORT_WEBHOOK_URL` for the Google Apps Script webhook (used for both issue reports and analytics). On mobile, the URL is hardcoded in `src/config.ts` since it's baked into the APK regardless.

**Analytics:** On each app open, a single ping is sent to the webhook with an anonymous UUID (generated on first launch), OS, and OS version. The Google Apps Script upserts a row per UUID in an "Analytics" sheet tab, incrementing the open count. No personal data is collected.

### @german/web

Web app built with Vite + React, deployed to [Cloudflare Pages](https://german-practice.pages.dev) (free tier). Same feature set as mobile: flashcards, dictionary, verb conjugation browser, starred words, word counter, and issue reporting with rate limiting.

**Screens:** Same as mobile (minus SplashVideo and ExitScreen).

**Keyboard shortcuts (FlashcardScreen):**

| Key | Action |
|-----|--------|
| Space / Enter | Reveal answer |
| Arrow Right / `g` | Mark correct |
| Arrow Left / `w` | Mark wrong |
| `d` | Toggle details |
| Escape | Back to setup |

**Storage:** localStorage for session history, encountered words, starred words, and rate-limit tracking.

**Rate limiting (issue reports):** 20 reports per 24 hours, 30-second cooldown between submissions (client-side via localStorage).

**Development:**

```bash
pnpm web          # Start dev server (http://localhost:5173)
pnpm build        # Build all packages including web
```

**Deployment:**

```bash
cd packages/web
npx wrangler pages deploy dist --project-name german-practice --commit-dirty=true
```

### @german/cli

Terminal UI built with Ink (React for the terminal). Same session logic as mobile, using file-system storage (`~/.german-app/`).

```bash
pnpm german
```

### @german/tool-b

AI-powered vocabulary metadata generator using the Claude API via `@anthropic-ai/sdk`.

```bash
# Fill word metadata using Claude
pnpm tool-b fill --type nouns --level A1 --input ./wordlists/a1-nouns.txt --output ./assets/data/nouns.json

# Validate existing data
pnpm tool-b validate --type nouns --output ./assets/data/nouns.json
```

**Input format** (one word per line, optional example sentence):

```
Tisch: Der Tisch ist im Wohnzimmer.
Lampe
Stuhl: Der Stuhl ist bequem.
```

Sends batches to Claude to generate: gender, plural forms, conjugation details, meanings, examples. Validates output against Zod schemas. Merges with existing data (deduplicates by word).

## Data

### JSON Data Files (`assets/data/`)

Four JSON files containing all word data across levels A1-B2:

| File | Content | Schema fields |
|------|---------|---------------|
| `nouns.json` | ~1400 nouns | word, gender (m/f/n), plural_suffix, is_n_dekl, level, meaning, example |
| `verbs.json` | ~800 verbs | infinitiv, type, auxiliary, stem_change_pres, present_forms, praeteritum_root, partizip_ii, konjunktiv_ii_root, prepositions, connections, level, meaning, example |
| `adjectives.json` | ~350 adjectives | word, is_declinable, is_comparable, komparativ, superlativ, level, meaning, example |
| `others.json` | ~200 other words | word, level, meaning, example |

### Wordlists (`wordlists/`)

Plain-text input files for tool-b, organized by level and category:

```
a1-nouns.txt, a1-verbs.txt, a1-adjectives.txt, a1-others.txt
a2-nouns.txt, a2-verbs.txt, a2-adjectives.txt, a2-others.txt
b1-nouns.txt, b1-verbs.txt, b1-adjectives.txt, b1-others.txt
b2-nouns.txt, b2-verbs.txt, b2-adjectives.txt, b2-others.txt
```

## Key Design Decisions

- **No spaced repetition.** This is a casual pick-and-go practice app. Revision happens only within a session (wrong answers are re-asked until correct).
- **Back-to-back dedup only.** Each session saves its words; the next session of the same category+level excludes those words. Only the last session is excluded (overwrite, not append). If all words are excluded, the filter is ignored.
- **Encountered words are vocab-only.** The cumulative word counter only increments for the Vocabulary category, not Nouns/Verbs/Adjectives exercises.
- **Card ID format:** `{type}-{subtype}-{word}` (e.g., `verb-present-machen-ich`, `noun-gender-Tisch`). Used for revision queue tracking and base word extraction for history.
- **Storage abstraction.** `SessionHistoryStorage` and `StarredWordsStorage` interfaces allow different implementations: AsyncStorage (mobile) and filesystem (CLI).
- **Dictionary caching.** Once loaded, dictionary entries are cached in a module-level `Map` for the app session. Cleared only on app kill.

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages (Turbo) |
| `pnpm test` | Run all tests (Vitest) |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint & format check (Biome) |
| `pnpm mobile` | Start Expo dev server |
| `pnpm web` | Start web dev server (Vite) |
| `pnpm german` | Run CLI app |
| `pnpm tool-b` | Run vocabulary generator |

### Code Style

- **Formatter:** Biome
- **Indentation:** Tabs
- **Line width:** 100 characters
- **Imports:** Auto-organized by Biome
- **JSON:** 2-space indent

### Testing

Tests are in `packages/core/__tests__/` using Vitest:

```bash
pnpm test
```

Test files cover: schemas, data loading, noun declension, adjective declension, verb conjugation (all 7 tenses), session FSM, starred words, and card generators.

### Building Installables

Builds use [EAS Build](https://docs.expo.dev/build/introduction/). Install the EAS CLI first:

```bash
npm install -g eas-cli
eas login
```

**Android APK** (direct install, no Play Store needed):

```bash
cd packages/mobile
eas build --profile preview --platform android
```

The APK is downloaded from the EAS dashboard or the URL printed after the build completes. Share the `.apk` file directly — recipients install it by opening the file on their Android device (enable "Install from unknown sources" if prompted).

**iOS Simulator build** (`.app` for local testing):

```bash
cd packages/mobile
eas build --profile preview --platform ios
```

This produces a `.tar.gz` containing a `.app` bundle. Extract and drag into the iOS Simulator.

**iOS device build** (Ad Hoc distribution):

For installing on physical iOS devices without the App Store, you need an Apple Developer account ($99/year) and must register test device UDIDs.

```bash
# Register devices first
eas device:create

# Build for registered devices
eas build --profile preview --platform ios
```

Recipients install via the link provided by EAS (opens in Safari, installs a provisioning profile then the app).

**Production builds** (Play Store / App Store):

```bash
# Android App Bundle (.aab) for Play Store
eas build --profile production --platform android

# iOS archive (.ipa) for App Store / TestFlight
eas build --profile production --platform ios
```

**Local builds** (no EAS cloud, requires Android SDK / Xcode):

```bash
# Android APK locally
eas build --profile preview --platform android --local

# iOS locally (macOS + Xcode required)
eas build --profile preview --platform ios --local
```

### Adding a New Level

1. Create wordlists in `wordlists/` (e.g., `c1-nouns.txt`, `c1-verbs.txt`, etc.)
2. Run `pnpm tool-b fill` for each category to generate metadata
3. The data is appended to existing JSON files in `assets/data/`
4. The level will automatically appear in the app (levels are defined in `LEVELS` constant)

### Adding a New Category

1. Add the category to the `Category` type and `CATEGORIES` constant in `packages/core/src/types/german.ts`
2. Create a generator in `packages/core/src/generators/`
3. Add the generator to `packages/core/src/generators/index.ts`
4. Handle the new category in `resolveCards()` in `packages/mobile/src/hooks/useSession.ts`, `packages/web/src/hooks/useSession.ts`, and `packages/cli/src/hooks/useSession.ts`

## Sensitive Configuration

The Google Apps Script webhook URL is the only sensitive value. It is **not** committed for the web package.

| Package | How the webhook URL is configured |
|---------|-----------------------------------|
| **web** | `packages/web/.env` file (gitignored). Set `VITE_REPORT_WEBHOOK_URL=<url>`. Read at build time via `import.meta.env`. |
| **mobile** | Hardcoded in `packages/mobile/src/config.ts`. The URL is baked into the APK — no way to hide it from a determined user. Acceptable since the webhook only appends rows to a Google Sheet. |

If the `.env` file is missing or the variable is empty, the "Report Issue" button is simply hidden.

**To get the current deployment link and Google Sheet access**, reach out to helpmesis25@gmail.com.

### Setting up your own webhook

To create your own Google Apps Script webhook for issue reporting:

1. Create a new Google Sheet
2. Open **Extensions → Apps Script**
3. Add a `doPost(e)` function that parses `e.postData.contents` as JSON and appends a row with: timestamp, word, level, category, issue type, and comment
4. Deploy as a **Web App** (Execute as: Me, Access: Anyone)
5. Copy the deployment URL and set it as:
   - **Web:** `VITE_REPORT_WEBHOOK_URL` in `packages/web/.env`
   - **Mobile:** `REPORT_WEBHOOK_URL` in `packages/mobile/src/config.ts`

The webhook receives POST requests with this JSON body:

```json
{
  "word": "der Tisch",
  "level": "A1",
  "category": "vocab",
  "issueType": "Spelling Mistake",
  "comment": "",
  "timestamp": "2026-03-14T12:00:00Z"
}
```

Without a webhook URL configured, all report functionality is disabled and the app works normally.

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                     @german/core                       │
│                                                        │
│  types/    schemas/    engine/    generators/           │
│  session/  data/       dictionary/                     │
└───┬──────────────┬──────────────┬──────────────────────┘
    │              │              │
    ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ @german/ │ │ @german/ │ │ @german/ │ │ @german/ │
│ mobile   │ │ web      │ │ cli      │ │ tool-b   │
│          │ │          │ │          │ │          │
│ Expo RN  │ │ Vite     │ │ Ink      │ │ Claude   │
│ AsyncStr │ │ localStr │ │ File FS  │ │ API      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Data Flow

```
wordlists/*.txt ──tool-b──▸ assets/data/*.json
                                    │
                              loadNouns/Verbs/etc.
                                    │
                              generateXxxCards()
                                    │
                              shuffle + slice(batchSize)
                                    │
                              Session FSM (Active → Revision → Complete)
                                    │
                              saveSessionWords() + saveEncounteredWords()
```
