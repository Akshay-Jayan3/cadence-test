# Cadence — calendar frontend

A lightweight team calendar built against the Cadence API. Register, sign in, plan your
week, and create / edit / delete events from a week grid.

- **Live:** _<!-- TODO: paste the Vercel/Netlify URL here -->_
- **API:** https://interview-task-01-be.vercel.app ([docs](https://interview-task-01-be.vercel.app/docs))

---

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | React 19 + TypeScript | Required. |
| Build | Vite 8 (+ React Compiler) | Fastest setup I'm confident in. |
| Routing | React Router 7 (data router) | Lazy route modules, so auth pages aren't in the calendar bundle. |
| Server state | TanStack Query 5 | Caching keyed per visible week, plus the optimistic-update / rollback primitives the flaky `PATCH` needs. |
| UI state | Local `useState` | Nothing outlives a screen; a store would be ceremony. |
| Styling | Tailwind CSS 4 | Design-system tokens declared once in `@theme`, used as utilities everywhere. |
| HTTP | Axios | Interceptors give one place for bearer auth and token refresh. |

No component library — every primitive in `src/components/ui` is hand-built from the Figma
design system, as the brief asked.

---

## Getting started

**Prerequisites:** Node `^20.19.0 || >=22.12.0` (Vite 8's requirement) and npm.

```bash
git clone https://github.com/Akshay-Jayan3/cadence-test.git
cd cadence-test
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:5173. `.env.example` already points at the live API, so
no edits are needed to run against it.

There is no seeded test account — register your own from `/register`, or via
`POST /auth/register` in the API docs.

### Environment

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Base URL of the Cadence API. Also used to resolve relative `avatarUrl` paths (`/avatars/<id>`). |

`.env.local` is gitignored. **When deploying, set `VITE_API_BASE_URL` in the host's
environment settings** — Vite inlines it at build time, so a missing value produces a build
that silently requests `undefined/events`.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR. |
| `npm run build` | Type-checks (`tsc -b`) then builds to `dist/`. |
| `npm run preview` | Serves the built `dist/` locally. |
| `npm run lint` | ESLint. |
| `npm test` | Vitest, single run. |
| `npm run test:watch` | Vitest in watch mode. |

---

## Project structure

```
src/
  app/          providers, router, route guard
  components/   ui/ primitives (Button, Input, Modal, …), layout
  features/
    auth/       login, register, session hook
    calendar/   week grid, drag hook, mini month picker, sidebar, toolbar, date utils
    events/     event form, create/edit modals, details card, mutation hooks
    settings/   account tab (profile + password)
  lib/
    api/        axios client + one module per resource
    auth/       token storage and session helpers
```

Feature-first, so everything one screen needs sits together and the API layer stays the
only thing that knows about HTTP. Tests live beside the code they cover.

---

## How I handled the flaky `PATCH /events/:id`

The brief is explicit that this endpoint adds 300–900 ms of latency and fails ~8% of the
time, and that "call it and hope" is the wrong answer. The handling lives in
[`useUpdateEvent.ts`](src/features/events/hooks/useUpdateEvent.ts) and its call sites in
[`CalendarPage.tsx`](src/features/calendar/pages/CalendarPage.tsx).

**1. The UI updates immediately, before the request resolves.** `onMutate` cancels any
in-flight `['events']` queries (so a slow refetch can't land on top of the optimistic
write) and patches the event in cache. At 300–900 ms of latency, waiting for the server
would make every edit feel broken.

**2. Every affected cache entry is snapshotted, not just the current one.** Events are
cached per visible week — `['events', fromIso, toIso]` — so an edit can touch more than
one entry. `onMutate` captures them all via `getQueriesData` and returns them as mutation
context.

**3. On failure, the exact previous state is restored.** `onError` walks that snapshot and
writes each key back. No re-derivation, no guessing — the user's grid returns to precisely
what it showed before.

**4. The failure is visible and recoverable.** A silent rollback is arguably worse than no
optimism at all: the event snaps back and the user has no idea why. So a failed update
raises a toast that names the failure and offers **Retry**, which replays the same
mutation with the same payload. I chose explicit retry over automatic backoff because at
an 8% failure rate a single retry usually succeeds, and a user watching their calendar
jump around under invisible retries loses trust in it faster than one that says "that
didn't save — try again."

**5. Server truth wins in the end.** `onSettled` invalidates `['events']` on both success
and failure, so the cache reconciles against the server rather than trusting the optimistic
value indefinitely.

**Where it's triggered from.** Drag-to-reschedule (vertical for time, horizontal across
days) and resize-from-the-bottom-edge both call this path, as does the edit modal's Save.
The gesture logic lives in [`useEventDrag.ts`](src/features/calendar/hooks/useEventDrag.ts):
pointer events rather than HTML5 drag-and-drop, so it works with touch; a 4px threshold
distinguishes a drag from a click, so tapping an event still opens its details; and the
dragged card renders the times it would land on, so the label tracks the gesture rather
than snapping at the end.

One deliberate choice: reschedules snap the *delta* to 15 minutes, not the resulting
absolute time. Dragging a 10:46 event down two hours puts it at 12:46, not 12:45. It keeps
the duration exact and never silently shifts an event the user didn't mean to move.

---

## Trade-offs

- **Tokens in `localStorage`.** The API returns bearer tokens in the response body and sets
  no cookie, so `httpOnly` was never on the table. `localStorage` survives reload and keeps
  the refresh flow simple; the accepted cost is XSS exposure. In-memory access tokens with
  a silent refresh on boot would be stricter, and is what I'd do for anything real.
- **Refresh is single-flight.** Refresh tokens rotate, and the brief warns that replaying a
  spent one revokes every session. A shared `refreshPromise` in
  [`client.ts`](src/lib/api/client.ts) means several concurrent 401s trigger exactly one
  `POST /auth/refresh`, and the new refresh token is persisted each time — never the
  original.
- **Event colors use the API's five hexes, not the Figma swatches.** They differ slightly
  (`#0EA5A5` vs `#10A7A7`, and so on). The API validates colors server-side, so the API
  values win for the picker and for rendering event blocks; the Figma values remain the
  design tokens for chrome in `@theme`.
- **TanStack Query is the only state manager.** Everything durable is server state. Adding
  Redux or Zustand for a handful of modal booleans would have been overhead.
- **Week view only.** Day and Month are out of scope per the brief, so the toggle is
  present but its two unbacked tabs are disabled rather than selectable-and-empty. Same
  reasoning for the search field, the notification bell and "Join call".
- **No default `Content-Type` on the axios instance.** Pinning one would make axios
  serialise `FormData` to JSON, which silently drops the avatar file that
  `/auth/register` and `PATCH /profile` expect as multipart. Axios already sends JSON for
  plain-object bodies, so the header is better left to it.
- **Tests cover logic, not screens.** 15 tests across event positioning, drag maths, and
  the optimistic-update rollback — the parts where a regression is silent. Component and
  flow tests would be next.

---

## What I'd do with more time

In rough priority order:

1. **Side-by-side layout for overlapping events.** Two events at the same hour currently
   stack at the same offset instead of splitting the column width.
2. **Keyboard reschedule.** Dragging is pointer-only; arrow keys on a focused event should
   move it, both for accessibility and for precision.
3. **Multi-day events.** An event is placed on its start day only; one crossing midnight
   should render on both. `getEventPosition` already clips correctly — it's the day filter
   in `WeekCalendar` that needs to hand the event to both columns.
4. **Component and flow tests** on top of the current unit coverage — the create/edit
   modals and the auth refresh interceptor in particular.
5. **An accessibility pass** — focus trapping in the modal, roving focus across the grid,
   and keyboard-driven event creation.
6. **Token storage.** Move the access token in-memory with a silent refresh on boot, as
   described above.

---

## Out of scope

Rendered as static or disabled UI per the brief, with no endpoint behind them: "Continue
with Google", "Forgot password?", guests/attendees, recurring events, the notification
bell, "Join call", Day/Month views, the sidebar "My calendars" list (events carry a colour,
not a category), Settings → Security/Notifications, and the search bar.
