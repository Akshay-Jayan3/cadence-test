# Cadence

Frontend for the Cadence calendar take-home. React + TypeScript + Vite.

**Live:** _<!-- TODO: paste deployed URL here -->_
**API:** https://interview-task-01-be.vercel.app (docs at `/docs`)

## Running it

Needs Node 20.19+ or 22.12+ (Vite 8 won't start on older).

```bash
git clone https://github.com/Akshay-Jayan3/cadence-test.git
cd cadence-test
npm install
cp .env.example .env.local
npm run dev
```

Runs on http://localhost:5173. The example env file already points at the live API so you shouldn't need to touch it.

No shared test account, just register one at `/register`.

### Env

One variable:

`VITE_API_BASE_URL` — base URL of the API. Also used to build avatar URLs, since the API returns those as relative paths like `/avatars/<id>`.

`.env.local` is gitignored. If you deploy this, set `VITE_API_BASE_URL` in the host's env settings. Vite inlines it at build time, so if it's missing you get a build that quietly requests `undefined/events`.

### Scripts

`dev`, `build`, `preview`, `lint`, `test`, `test:watch`.

## Stack

- React 19 + TypeScript, Vite 8
- React Router 7, routes lazy loaded so the auth pages aren't in the calendar bundle
- TanStack Query for anything coming from the API
- Tailwind 4, design tokens declared in `src/index.css`
- Axios, mainly so token refresh can live in one interceptor

No component library. Everything in `src/components/ui` is built from the Figma design system.

## Layout

```
src/
  app/          providers, router, route guard
  components/   ui primitives, layout
  features/
    auth/       login, register, session hook
    calendar/   week grid, drag hook, mini month picker, sidebar, toolbar
    events/     form, create/edit modals, details card, mutation hooks
    settings/   account tab
  lib/
    api/        axios client, one module per resource
    auth/       token storage
```

Grouped by feature so a screen's pieces stay together, and only `lib/api` knows about HTTP. Tests sit next to what they test.

## The flaky PATCH

This is the part the brief cares about, so in detail.

When you drag or resize an event the UI updates immediately, before the request goes out. At 300–900ms of latency, waiting on the server makes every edit feel broken.

Events are cached per visible week (`['events', from, to]`), and a single edit can touch more than one of those entries. So `onMutate` grabs every matching entry with `getQueriesData` and holds onto them. It also cancels in-flight `events` queries first, otherwise a slow refetch can land on top of the optimistic write and undo it.

If the request fails, `onError` writes those snapshots back. Exact previous state, nothing recalculated.

A silent rollback is arguably worse than no optimistic update at all: the event just snaps back and you have no idea why. So a failure also puts up a toast with a Retry button that replays the same mutation. I went with manual retry rather than automatic backoff. At an 8% failure rate one retry usually works, and a calendar that shuffles things around on its own is harder to trust than one that admits it failed.

`onSettled` invalidates either way, so the cache ends up agreeing with the server.

Drag, resize and the edit modal's Save all go through this path. The gesture code is in `features/calendar/hooks/useEventDrag.ts`. Pointer events rather than HTML5 drag and drop, so touch works. There's a 4px threshold before something counts as a drag, otherwise tapping an event to open it nudges it by a pixel. While you're dragging, the card shows the time it would land on.

One thing I went back and forth on: the 15 minute snap applies to how far you dragged, not to the resulting time. Drag a 10:46 event down two hours and you get 12:46, not 12:45. Keeps the duration exact and doesn't move an event you weren't trying to move.

## Trade-offs

**Tokens in localStorage.** The API returns them in the response body and doesn't set a cookie, so httpOnly was never an option. localStorage survives a reload and keeps the refresh flow simple. Downside is XSS exposure. For anything real I'd keep the access token in memory and refresh on boot.

**Refresh is single-flight.** Refresh tokens rotate, and reusing a spent one kills every session for that user. So there's one shared promise in `lib/api/client.ts`: several 401s at once trigger exactly one `POST /auth/refresh`, and the new refresh token gets persisted each time.

**No default `Content-Type` on the axios instance.** If you set one, axios serialises `FormData` to JSON and the avatar file silently vanishes. Took me a while to spot. Axios already sends JSON for plain object bodies, so it's better left alone.

**Event colours come from the API, not Figma.** The five hex values differ slightly from the design swatches (`#0EA5A5` vs `#10A7A7`, and so on). The API validates them server-side, so those win for the picker and the event blocks. The Figma values are still the theme tokens for everything else.

**TanStack Query is the only state management.** Everything that outlives a render is server state. Pulling in Redux or Zustand for a few modal booleans would be overkill.

**Week view only.** Day and Month are out of scope, so the tabs are there but disabled rather than clickable and empty. Same reasoning for search, the notification bell and Join call.

**Tests cover logic, not screens.** 15 of them, across event positioning, the drag maths and the optimistic rollback. Those are the places where a bug wouldn't be obvious from looking at the app.

## With more time

1. Overlapping events. Two things at the same hour sit on top of each other instead of splitting the column width.
2. Keyboard reschedule. Dragging is pointer only right now.
3. Multi-day events only render on their start day. `getEventPosition` already clips correctly, it's the day filter in `WeekCalendar` that needs to hand the event to both columns.
4. Tests for the modals and the refresh interceptor.
5. Accessibility pass. Focus trap in the modal, arrow keys across the grid.
6. Move the access token out of localStorage, as above.

## Not wired up

In the design but with no endpoint behind them, so they render disabled: Continue with Google, Forgot password, guests/attendees, recurring events, the notification bell, Join call, Day and Month views, the My calendars list (events carry a colour, not a category), Settings → Security and Notifications, and search.

## One note on tests

The vitest config skips the React Compiler babel plugin, which crashes the test worker, and runs files serially. Three jsdom environments in parallel ran my machine out of memory.
