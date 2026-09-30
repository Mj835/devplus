# DevPulse: Developer Intelligence Dashboard

## Overview

Search GitHub repositories and developers, and drill into a repository's details and recent issues. Built with React 19, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS v4 and lucide-react icons, against the public GitHub REST API.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

No credentials are required. Requires Node `^20.19` or `>=22.12` (see `engines`). Other scripts:

```bash
npm run build         # type-check + production build (dist/)
npm run preview       # serve the production build
npm test              # unit tests (Vitest); npm run test:watch while developing
npm run lint          # oxlint, warnings fail the run
npm run typecheck     # tsc --noEmit
npm run format        # Prettier (format:check in CI)
npm run check         # everything CI runs except the build
```

CI (`.github/workflows/ci.yml`) runs format check, lint, type-check, tests and build on every push and pull request.

**Optional token** (raises GitHub's limit from 60 to 5,000 core requests per hour). There are two ways to set one:

- In the app: click the **Free Tier (60/hr)** badge in the header, or **Configure API Token** on a rate-limit error. The token is stored in this browser's `localStorage` and sent only to `api.github.com`.
- At build time: copy `.env.example` to `.env.local` and set `VITE_GITHUB_TOKEN`. Use this for local development only, because Vite inlines `VITE_*` variables into the client bundle. A token saved in the app takes precedence.

## Features

- Repository and user search with a toggle, 400 ms debounce, and Enter to search immediately. Press `/` or `Ctrl/⌘+K` to focus the search box, and use the "Popular" chips for one-click queries.
- Search state lives in the URL (`?q=react&type=users&page=2`), so it can be shared and back/forward work.
- Page-based pagination that respects GitHub's 1,000-result cap.
- Repository cards show the name, owner and avatar, description, language, stars, forks, open issues, last-updated date and a GitHub link.
- User cards show the avatar, username, name, followers, following, public repos, location and a profile link.
- Repository cards and the repository page have a copy-`git clone` button. User cards link to a search for that user's repositories (`user:<login>`).
- The repository page shows the owner, description, stars, forks, watchers, open issues, language, default branch, created and updated dates, and the 30 most recent issues with pull requests filtered out. You can filter the issues client-side by state (all/open/closed) and by title.
- Loading states: skeleton cards on the first search, dimmed stale results while paging, and skeletons on the detail page.
- Empty states for no query, no results and no issues.
- Error states for network failure, API failure, rate limits (with the reset time), invalid requests (422), a missing repository (404), and a failed issues request that is shown separately from the repository details. Retry buttons appear where a retry can help.
- Responsive layout (CSS grid, single column on phones). The theme toggle cycles System → Dark → Light and is remembered in `localStorage`.
- Accessibility: semantic landmarks, a skip link, a labelled search, a radio group for the search type, and focus moved to the results heading when paging and to the repository heading once it loads. Errors use `role="alert"`. The token dialog is a native modal `<dialog>`: it traps focus, makes the page behind it inert, closes on Escape or a backdrop click, and returns focus to whatever opened it. Issue filters use `aria-pressed`.
- Stats and metadata are real description lists (`<dl>`). Relative dates ("3d ago") are `<time>` elements with the exact date as `dateTime` and tooltip. Muted text and state badges meet WCAG AA contrast (4.5:1) in both themes. A saved theme is applied before first paint, so there's no flash.

## Architecture

Feature-based layout: code that belongs to one page lives with that page. Shared code sits in a small set of top-level folders, and dependencies point inward (`features` → `components`/`api`/`lib`, never the reverse).

```
src/
  main.tsx                 bootstrap only: root element, StrictMode, global CSS
  vite-env.d.ts            typed environment variables
  app/                     application shell
    App.tsx                  providers, layout, lazy routes behind Suspense
    queryClient.ts           TanStack Query defaults (stale/gc times, retry policy)
    RouteErrorBoundary.tsx   render/chunk-load failures -> recoverable screen
    NotFoundPage.tsx
  api/                     everything that talks to GitHub
    client.ts                fetch wrapper: headers, token, abort passthrough, GitHubError
    types.ts                 raw GitHub shapes + domain types
    mappers.ts               raw -> domain (PR filtering, pagination cap)
    github.ts                endpoint functions
    queries.ts               queryOptions factories: the single place query keys are defined
  features/
    search/
      SearchPage.tsx         composes the page; owns the input draft + debounce
      searchParams.ts        URL <-> search state (pure, tested)
      useSearchState.ts      URL-backed [state, update] hook
      components/            SearchHero, SearchBar, PopularSearches, SearchResults,
                             RepoCard, UserCard, ResultsSkeleton
    repository/
      RepositoryPage.tsx     details query, focus management, composition
      loadRepositoryPage.ts  chunk loader shared by the router and hover preloading
      issueFilters.ts        issue state/title filtering (pure, tested)
      components/            RepoOverview, RepoStats, RepoMetadata, RecentIssues, IssueList
  components/              shared UI
    layout/                  Navbar, ThemeToggle
    ErrorState, Pagination, RelativeTime
    ApiTokenModal.tsx        lazy wrapper -> ApiTokenDialog.tsx (native <dialog>)
  hooks/                   useCopyToClipboard, useFocusShortcut
  lib/                     format.ts (Intl formatting, relative time, language colours)
  styles/
    index.css                Tailwind entry: design tokens (light/dark), @theme mapping, base styles
    classes.ts               class strings for patterns used in several files
```

Tests sit next to the code they cover (`*.test.ts`). There are no barrel `index.ts` files: they hide import cycles and make it easy to defeat code splitting by importing a whole folder.

### Code splitting

| Chunk                                                | gzip                | Loaded                                                |
| ---------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| `index` (app shell) + `rolldown-runtime`             | 3.7 kB              | first load                                            |
| `react` / `router` / `query` / `icons` vendor chunks | 68 / 14 / 10 / 4 kB | first load; cached across app deploys                 |
| `shared` (API layer, shared components, helpers)     | 4 kB                | first load                                            |
| `SearchPage`                                         | 5.3 kB              | when the search route renders                         |
| `RepositoryPage`                                     | 3.6 kB              | on hover/focus of a repository link, or on navigation |
| `ApiTokenDialog`                                     | 1.6 kB              | the first time the token dialog opens                 |

- **Routes** are `React.lazy` + `Suspense` (`app/App.tsx`). `RouteErrorBoundary` catches a failed chunk load (typically a stale tab after a deploy) and offers a reload instead of a blank screen.
- **Preloading:** repository links call `loadRepositoryPage()` on `mouseenter`/`focus`, so the page's code is usually cached before the click. Only code is preloaded, never API data: prefetching data on hover would spend the 60 requests/hour unauthenticated budget on repos nobody opens.
- **Vendor chunks** (`vite.config.ts` → `rolldownOptions.output.codeSplitting.groups`) split React, the router, TanStack Query and icons into separately cached files, so an app-only deploy doesn't make users re-download ~95 kB of libraries.

**Styling.** Components use Tailwind utilities. Colours, shadows and fonts come from CSS variables defined once in `styles/index.css` and exposed to Tailwind through `@theme` (`bg-surface`, `text-fg-2`, `border-line`, `shadow-card`, ...). Dark mode only changes the variable values, so components need no `dark:` variants. The root font size is 15px, so fixed pixel sizes from the design are written as arbitrary values (`w-[36px]`). That way they don't drift with the rem scale.

Data flows one way: **URL → query key → TanStack Query → `api/github.ts` → `api/client.ts` → fetch**. Components only receive mapped domain types (`Repo`, `User`, `Issue`) and never see snake_case API shapes.

### State management

| State                                                          | Where it lives                                                    | Why                                                                                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Search query, type, page                                       | URL search params                                                 | Shareable and bookmarkable, back/forward work, one source of truth                                                                    |
| Text being typed                                               | Local `useState` in `SearchPage`                                  | Keeps typing instant. It is committed to the URL after the debounce                                                                   |
| Server data (search, users, repo, issues)                      | TanStack Query cache                                              | Caching, deduplication, cancellation and retry come built in                                                                          |
| Issue filter (state, title text), dialog open, "Copied!" flags | Local `useState`                                                  | Only one component cares about them                                                                                                   |
| GitHub token, theme                                            | `localStorage`, read through `getStoredToken()` and `ThemeToggle` | Kept across reloads. A `devpulse:token-changed` window event keeps the navbar badge in sync when the token changes from an error card |
| Everything else                                                | None needed                                                       | There is no shared client state that justifies a store                                                                                |

### API layer

- Every request goes through `request()` in `client.ts`, which adds headers and the optional token, passes the `AbortSignal` through, and turns every failure into a `GitHubError` with a `kind` of `network | rate-limit | not-found | invalid | server | unknown`. Rate-limit errors also carry `resetAt`.
- `github.ts` declares **raw types** for only the fields we read, then maps them to **domain types**. The mapping also filters pull requests out of issue lists and computes the capped `totalPages`.
- UI code decides what to show by `kind` (`ErrorState`). The retry policy uses `retryable`, so only network errors and 5xx responses are retried automatically, and never more than twice. Rate limits and 4xx errors fail fast, because retrying them only burns quota.

### Type safety

- **Compiler settings:** `tsconfig.json` runs `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals`/`Parameters`, `verbatimModuleSyntax` and `isolatedModules`. There is no `any` in the codebase. `npm run build` type-checks before bundling.
- **API models:** raw GitHub shapes (`RawRepo`, `RawIssue`, ...) are separate from the domain types the UI uses (`Repo`, `Issue`, ...), with explicit mappers between them.
- **Search results:** `SearchResult` is a discriminated union on `type`, so rendering a user card from repository data is a compile error.
- **Errors:** error kinds are a string-literal union, and `GitHubError` carries typed metadata (`status`, `resetAt`).
- **Environment and storage:** `vite-env.d.ts` types the optional `VITE_GITHUB_TOKEN`. Values read from `localStorage` are narrowed with type guards (`isTheme`) rather than casts.
- **Deliberate casts (two):**
  - The JSON body in `request<T>()`: responses are typed, not validated at runtime (see limitations).
  - The `#root` element that `index.html` always provides.

### Caching

Yes, through TanStack Query. `staleTime` is 5 minutes for searches and repo data and 30 minutes for user profiles, `gcTime` is 30 minutes, and refetch-on-focus is off. Going back to an earlier query, page or repository is instant and costs no quota, which matters with 10 search requests per minute and 60 core requests per hour when unauthenticated. There is no persistent (localStorage) cache: data older than a session isn't worth the invalidation complexity.

### Search and async behaviour

- **Debounce:** a 400 ms timeout in an effect commits the typed text to the URL. Enter commits immediately. Typing uses `replace` so history isn't flooded, while page and type changes `push`.
- **Race conditions:** every `(type, q, page)` combination is its own query key. A slow response for `"rea"` can only land in the `"rea"` cache entry and can never overwrite `"react"`. This is the fix for the classic "older response appears after the newer one" bug.
- **Cancellation:** query functions pass TanStack's `AbortSignal` to `fetch`, so requests for queries that have been superseded are aborted. `request()` rethrows aborts untouched so they never show up as errors.
- **Duplicate requests:** identical keys are deduplicated by the cache, and an empty query sends no request (`enabled`).
- **Pagination:** `keepPreviousData` keeps the current page visible (dimmed, `aria-busy`) while the next page loads. The Previous and Next buttons are disabled during that time.
- **Back/forward:** when the URL changes from outside, the input syncs through the "adjust state during render" pattern rather than an effect, which avoids a debounce loop that would overwrite the navigation.

### Performance

- Result sets are small (20 repos or 10 users per page), so no virtualisation or memoization is used. Neither would pay for itself here.
- Avatars use `loading="lazy"` with explicit dimensions so the layout doesn't shift.
- User profile requests go through the cache and are deduplicated, so a user seen before costs nothing.

## Key decisions

**1. Server state with TanStack Query**

- Decision: use TanStack Query for all API data.
- Alternatives considered: `useEffect` + `useState` with a hand-rolled AbortController and cache; Redux Toolkit Query; SWR.
- Why I chose this: the spec asks for caching, cancellation, deduplication, retry and race-condition safety. TanStack Query does all of that with small, declarative code. A hand-rolled version would reimplement the same things with more bugs.
- Trade-off: one dependency (~13 kB gzipped) and its concepts (query keys, stale vs. gc time) that a reviewer needs to know.

**2. The URL as the source of truth for search**

- Decision: `q`, `type` and `page` live only in the URL. There is no copy in React state.
- Alternatives considered: component state, or a global store synced to the URL.
- Why I chose this: one source of truth means there is nothing to keep in sync. Deep links, refresh and back/forward work without extra code.
- Trade-off: the input needs a separate local draft plus a sync-on-navigation step, which is the subtlest code in the app.

**3. Query keys instead of manual sequencing for race conditions**

- Decision: rely on per-query cache entries plus `AbortSignal`.
- Alternatives considered: a "latest request id" ref, or aborting the previous controller by hand.
- Why I chose this: stale data cannot reach the screen, because the screen only reads the entry for the current key. Aborting is a network optimisation on top, not what makes it correct.
- Trade-off: correctness depends on the query key including every input. That is documented in the code, but a future filter added outside the key would reintroduce the bug.

**4. Lazy per-card user profile fetches with a smaller page size**

- Decision: `/search/users` returns only login and avatar, so each `UserCard` fetches `/users/{login}` itself, and user search uses 10 results per page.
- Alternatives considered: fetch all profiles in the search query function with `Promise.all`; the GraphQL API, which returns everything in one call but needs a token; showing only login and avatar.
- Why I chose this: the spec requires followers, following, repos and location. Per-card queries render basic info immediately, fail independently (one bad profile doesn't fail the page), and are cached per user.
- Trade-off: N+1 requests. Unauthenticated users can load about 6 pages of users per hour before hitting the core rate limit. When that happens, cards degrade to "details unavailable" and the rest of the page keeps working. An optional token removes the problem.

**5. A typed error model in one place**

- Decision: `client.ts` normalises every failure into a `GitHubError` with a `kind`.
- Alternatives considered: checking `response.status` inside each component; throwing raw `Error`s.
- Why I chose this: GitHub's rate limiting is subtle (403 _or_ 429, primary vs. secondary, reset header vs. `retry-after`). Handling it once means the retry policy and every error UI agree.
- Trade-off: a plain 403 that isn't a rate limit becomes `unknown`, with GitHub's message shown as is.

**6. Tailwind CSS v4 on top of CSS-variable design tokens**

- Decision: style components with Tailwind utilities. The design tokens stay as CSS variables that Tailwind reads through `@theme`. Dark mode uses `prefers-color-scheme` by default and can be overridden with `data-theme`.
- Alternatives considered: one hand-written stylesheet (the first version, ~1,500 lines), CSS Modules, a UI kit.
- Why I chose this:
  - Styles live next to the markup, and unused CSS is never shipped.
  - Keeping tokens as variables means theming is still one place, and switching themes is just a variable swap.
  - Patterns used in several files are named once in `styles/classes.ts` rather than hidden behind `@apply`.
- Trade-offs:
  - Class strings are long, and design values that don't match Tailwind's scale use arbitrary values.
  - Tailwind's Preflight reset differs from browser defaults, so `index.css` restores the browser's form-control font and spacing, and inline images, which the design was built on.
- How I checked the migration kept the UI identical:
  - For every element, I compared computed styles (colours, fonts, spacing, borders, radii, shadows, layout) and positions between the old stylesheet and the Tailwind version.
  - This covered 20 scenarios (every page, empty, error and dialog state, in light and dark), with a mocked API, at 1280px and 375px.
  - It found zero differences.

**7. Optional in-app token stored in `localStorage`**

- Decision: let the user paste a personal access token in a dialog, and read it on every request.
- Alternatives considered: env var only; a backend proxy that holds the token; no token support.
- Why I chose this: 60 requests per hour runs out fast with user cards. Offering the fix inside the rate-limit error lets someone recover without restarting the dev server. No backend was allowed.
- Trade-off: any XSS on the origin could read a token kept in `localStorage`. It is opt-in, never sent anywhere except `api.github.com`, and the user can remove it. A real product would use OAuth with a server-side session.

**8. Feature folders with route-level code splitting**

- Decision: group code by feature (`features/search`, `features/repository`), lazy-load each route, and preload the repository page's code on link hover or focus.
- Alternatives considered:
  - Type-based folders (`pages/`, `components/`, `hooks/` for everything).
  - A single bundle.
  - Prefetching repository data (not just code) on hover.
- Why I chose this:
  - A feature folder holds everything one page needs, so changing a page rarely touches other folders.
  - Lazy routes keep the first load to the shell, the vendor chunks and the page you land on.
  - Preloading only code costs no API quota and still makes the repository page open instantly.
- Trade-off:
  - A route's first visit without a hover (e.g. a deep link) waits for one small chunk (3.6 kB gzipped) behind a `Suspense` fallback.
  - Cross-feature imports need a deliberate seam (`loadRepositoryPage.ts`) so search doesn't statically pull in the repository page.

**9. oxlint + Prettier instead of ESLint**

- Decision: lint with oxlint (React, hooks, jsx-a11y, import, Vitest plugins) and format with Prettier.
- Alternatives considered: ESLint + `typescript-eslint`; Biome.
- Why I chose this: `typescript-eslint` only supports TypeScript < 6.1, and this project uses TypeScript 7. oxlint doesn't depend on the TypeScript compiler, runs in milliseconds, and ships the rules that matter here.
- Trade-off:
  - No type-aware lint rules (e.g. floating promises). `tsc --noEmit` in CI and strict compiler options cover most of that ground.
  - One rule is suppressed inline, with its reason written next to it (the dialog's backdrop click).

## Trade-offs

| Chose                                             | Over                            | Cost accepted                                                             |
| ------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| TanStack Query for server state                   | Hand-rolled fetch/cache         | One dependency and its concepts                                           |
| URL as the only source of search state            | Component or global state       | A small sync step between the input and the URL                           |
| Per-card user profile requests                    | Fetching every profile up front | N+1 requests; the unauthenticated rate limit runs out after ~6 user pages |
| Page-based pagination                             | Infinite scroll                 | One extra click, but pages are shareable and back/forward work            |
| Client-side issue filters on the 30 loaded issues | Server-side issue search        | Filters don't reach older issues                                          |
| Optional token in `localStorage`                  | A backend/OAuth flow            | The token is readable by scripts on the page (opt-in, documented)         |
| Tailwind + CSS-variable tokens                    | One hand-written stylesheet     | Long class strings; Preflight differences restored in `index.css`         |
| Unit tests for pure logic only                    | Component and E2E tests         | UI flows were verified manually (see Testing)                             |
| Lazy routes + code-only hover preloading          | One bundle / data prefetching   | A deep link waits for one small chunk; hover doesn't warm the data cache  |
| oxlint                                            | ESLint + typescript-eslint      | No type-aware lint rules (typescript-eslint doesn't support TS 7 yet)     |

## Assumptions

- "Recent issues" means the 30 most recently created issues in any state (open or closed), with pull requests excluded. Because the endpoint returns PRs too, fewer than 30 may appear.
- The repository "watchers" count uses `subscribers_count`. GitHub's `watchers_count` is a legacy alias for stars.
- Unauthenticated use is the default, as the brief requires. The token is purely optional.

## Known limitations / what I would do next

- Repository filters (language, minimum stars) are not implemented. They would slot into the query key and be appended as `language:x stars:>=n` qualifiers.
- There are no component or integration tests yet. The next step would be React Testing Library + MSW tests for `SearchPage`: debounce, a race with out-of-order responses, and error states.
- The repository page doesn't seed from the search cache (`initialData`), so it shows a short loader even though the list already had partial data.
- There is no favorites list or repository comparison.
- API responses are typed but not validated at runtime. If GitHub changed a field's shape, it would surface as a rendering bug rather than a clear error. A schema library (e.g. zod) at `request()` would close that gap.
- In dark mode, primary-coloured text on its own tinted background (e.g. the "Public" and count pills) is about 3.4:1 contrast, below AA for small text. Fixing it needs a separate text shade for the primary colour.
- Issue filters work only on the 30 issues already loaded. They are not server-side search.
- Removing an in-app token does not clear a `VITE_GITHUB_TOKEN` baked in at build time.
- Rate-limit messages show the reset time but don't count down or retry automatically.
- Deep links to `/repos/...` need an SPA fallback when deployed. `vite preview` and `vite dev` already provide one.

## Testing approach

Unit tests (Vitest) cover the logic most likely to break silently:

- `client.test.ts`: rate-limit detection (primary and secondary), status-to-kind mapping, non-JSON bodies, network errors vs. aborts.
- `mappers.test.ts`: the pagination cap, PR filtering and null authors in issues, and snake_case → domain mapping.
- `format.test.ts`: compact numbers, relative time and language-colour fallback.
- `searchParams.test.ts`: URL parsing defaults and invalid values, canonical URLs, round-tripping.
- `issueFilters.test.ts`: state filter, trimmed case-insensitive title matching, per-state counts.

Logic that is worth testing lives in pure modules (`mappers`, `searchParams`, `issueFilters`, `format`), so these tests need no DOM or network.

Components are thin and were verified manually in the browser: search, type switching, pagination with focus moving, back/forward, repository details, the 404 repository, empty results, and the 422 beyond-1000-results error. The next layer would be RTL + MSW, as noted above.

## AI usage disclosure

- **Tools:** Claude Code (Anthropic).
- **What I used it for:** scaffolding the Vite/TS config, writing the first drafts of components, the API layer, the CSS and the unit tests, drafting this README, and driving the browser to check the flows.
- **What I decided myself:** the overall architecture (URL as the source of truth, TanStack Query for server state, no global store), the error taxonomy and retry policy, the per-card user-profile strategy and page size given the rate limits, and the scope cuts listed above.
- **What I reviewed or changed:** every generated file. Specific fixes:
  - A first draft of the debounce used a `useDebouncedValue` hook plus an effect that pushed the debounced value to the URL. That version overwrote back/forward navigation for 400 ms, so I replaced it with a timeout effect guarded by `text === q`, plus render-time syncing of the input.
  - With `keepPreviousData`, switching from Repositories to Users briefly rendered repo cards under the Users tab. The fix was the `data.type === type` guard.
  - The heading said "Searching…" after an error, and "Try again" appeared for 422 errors that can never succeed. Both are fixed.
  - In the review pass after the UI redesign:
    - The repository heading moved inside the loaded-data block, so focus-on-navigation silently stopped working. It now focuses once the data loads.
    - The search input had lost its label.
    - The `/` shortcut stole keystrokes from other inputs.
    - The navbar token badge went stale when a token was saved from an error card.
    - The token dialog had no Escape key, focus handling or accessible name.
    - The clipboard buttons showed "Copied!" even when the copy failed.
    - A hardcoded "Public" badge could be wrong for private repositories once a token is set.
  - Tailwind migration: the first pass looked right but had real regressions, which the style comparison caught:
    - Preflight made buttons inherit the page font and line height, so every button got taller.
    - Avatar images became block-level.
    - The hidden radio inputs lost their styles.
    - The search input lost 1px of browser padding.

    All are fixed, and the final comparison shows no differences.

  - Restructure and code splitting: adding the linter surfaced problems in code that already worked.
    - The token dialog wrote a ref during render; it now uses the native `<dialog>` with `onCancel`.
    - An effect listed dependencies it didn't use.
    - Backdrop-click `<div>`s weren't accessible.

    The same per-element style comparison confirmed the page UI is unchanged after the restructure.
- **Rejected suggestions:**
  - Prefetching repository API data on hover. It would make the page open fully instantly, but spend the 60/h budget on repos nobody opens; only the code is preloaded.
  - Barrel `index.ts` files per folder. They add indirection and make it easy to pull a lazy page into the main bundle by accident.
  - Adding Redux/Zustand for search state. There is no shared client state, so a store would only duplicate the URL.
  - Fetching all user profiles inside the search query with `Promise.all`. One failed profile would fail the whole page, and the results would show nothing until the slowest profile arrived.
  - Default React Query retries (3×, including 4xx). Retrying on rate limits burns the remaining quota and delays the error message.
