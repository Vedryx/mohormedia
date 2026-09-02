# Mohor Media

React port of the **Mohor Media Home (final version)** page from the Claude Design
canvas project `7665f449-c67f-4086-b6c9-84ac3a8df6b5`.

Stack: Vite + React 19, plain CSS (no framework), no runtime dependencies beyond React.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Build and preview production output:

```bash
npm run build
```

## Structure

```
src/
├── main.jsx              entry point
├── App.jsx               page composition + motion setup
├── siteConfig.js         page switches (hero stats, story media, motion, intro)
├── BookingContext.jsx    page-level open/close state for the booking form
├── data/content.js       all copy — services, work, process, stories, footer
├── assets/
│   ├── logo.js           single import point for the brand mark
│   └── mohor-logo.png    official artwork, trimmed and web-sized
├── hooks/
│   ├── useReveal.js      scroll-into-view fade + lift
│   ├── useDragScroll.js  click-and-drag on the work strip
│   └── useScrollY.js     passive scroll offset (nav shadow, hero parallax)
├── styles/
│   ├── tokens.css        colours, type, spacing, easings
│   └── global.css        reset, shared helpers, keyframes
└── components/           one .jsx + .css pair per section
```

Every section from the design is present, in order: `Intro` → `Nav` → `Hero` →
`ClientMarquee` → `Craft` → `Work` → `Process` → `Studio` → `Stories` →
`BookCall` → `Footer`.

## How the design translated

The canvas page is a single HTML file with inline styles, a `DCLogic`
component class, and canvas-only custom elements. Those map to React as follows:

| Design canvas | React |
| --- | --- |
| `<sc-if value="{{ … }}">` | conditional rendering off `siteConfig` / local state |
| `{{ storyCols }}`, `{{ leftW }}`, `{{ ctaH }}` … | CSS classes toggled by an `is-open` / `is-active` state flag |
| `style-hover` / `style-focus` attributes | real `:hover` / `:focus` rules |
| `this.setState` in `renderVals` | `useState` in the owning component |
| `componentDidMount` observers & listeners | `useReveal` / `useDragScroll` / `useScrollY` |
| imperative WAAPI shutter & player overlays | declarative overlay components + CSS keyframes |
| `<image-slot>` (+ `.image-slots.state.json`) | `<ImageSlot>` (+ `localStorage`) |

`support.js` and `image-slot.js` are canvas runtime files; their behaviour is
reimplemented in React rather than copied, so neither ships here.

## Image slots

Photography was never baked into the design — the canvas used droppable
placeholders. `<ImageSlot>` keeps that: each slot shows a labelled placeholder,
and you can drag an image onto it or click to browse. The choice persists in
`localStorage` keyed by slot id, which is handy for review but is per-browser.

To ship real images, drop the files in `src/assets/` and pass a `src`:

```jsx
<ImageSlot id="v2-work-1" src={saffronStreet} alt="Saffron Street rebrand" />
```

Slot ids in use: `v2-hero`, `v2-work-1`…`v2-work-4`, `team-greeting`,
`v2-story-1`…`v2-story-3`.

## Booking flow

Every call to action — the nav button, the hero's "Book a Free Call", and the
footer's "Book a Call" — opens the form in **one** click. They still carry
`href="#mm-book"` so the anchor scroll and right-click/open-in-new-tab keep
working; the click handler additionally flips the shared open state in
`BookingContext`, and the form focuses its first field once the panel settles.

The in-section "Claim My Free Call" button collapses away while the form is
open, so a visitor never sees two buttons for the same intent.

The nav CTA is the page's primary conversion point, so it is styled apart from
the nav links and kept continuously in motion on a shared 3s cycle:

| Animation | What moves |
| --- | --- |
| `mm-cta-halo` | a saffron ring expands out of the pill and fades |
| `mm-cta-sheen` | a light band sweeps across, idling most of the cycle |
| `mm-cta-twinkle` | the `✦` scales up and spins a quarter turn |
| `mm-cta-nudge` | the `↗` drifts up-right and settles back |

Two layering rules keep this visible, and both are easy to break by accident:
the sheen sits at `z-index: 1` with the label spans at `2`, because a negative
z-index would hide it behind the button's own background; and the halo rides on
the button's `box-shadow` rather than a pseudo-element, because the
`overflow: hidden` that keeps the sheen inside the pill would clip a child but
never the element's own shadow.

Hovering stops the loop so the lift and deeper shadow read cleanly, and
everything is dropped under `prefers-reduced-motion`.

## Swapping the logo

`mohor-logo.png` is the official artwork — trimmed to its bounding box from
`Mohor Logo & Post.png` and resized to 512px wide. It has a transparent
background and carries its own मोहोर / MEDIA. lettering.

Change the import in `src/assets/logo.js` to swap it — that is the only place
the mark is referenced. Set `logoIsSquare` to match the new file:

- `true` — square artwork, circle-cropped with a white ring. The footer also
  sets मोहोर / MEDIA. as separate text, since a cropped mark can't show its own.
- `false` — artwork with its own silhouette or transparency (current setting);
  shown uncropped at its natural aspect ratio, and the footer drops the
  duplicate lettering.

Because the artwork's blob is olive, it would disappear against the olive
footer, so the footer sets it on a cream plate — the dark-background
counterpart to the white ring the circle-cropped variant gets.

## Page switches

`src/siteConfig.js` mirrors the editable props the design exposed:

| Key | Values | Effect |
| --- | --- | --- |
| `showHeroStats` | boolean | the 30+ / 120+ / 6 yrs row |
| `storyMedia` | `as authored`, `video`, `photo`, `text` | forces every testimonial's media kind |
| `motion` | `subtle`, `noticeable`, `showy` | reveal distance/duration and hero parallax |
| `showIntro` | boolean | the full-screen logo curtain on load |

## Booking form

`POST /api/book` is a Vercel Function (`api/book.js`). It appends a row to a
Google Sheet and emails an alert. There is no server to run — the function is
deployed alongside the static site.

Run the guards and request shapes without touching Google or Resend:

```bash
npm run test:book
```

### Trying it locally

`npm run dev` serves the endpoint too. Vite's dev server knows nothing about
Vercel Functions, so `vite-dev-api.js` mounts the same `api/` handlers as dev
middleware — the local form runs the real code path, including a live write to
the sheet. The plugin is `apply: 'serve'`, so it never reaches production,
where Vercel runs `api/` itself.

To write to the real sheet from localhost, put the credentials in `.env.local`
(git-ignored — copy `.env.example`). Without it the form returns the generic
error, because `GOOGLE_SHEET_ID` is unset.

Check the wiring without any credentials:

```bash
curl -i -X POST localhost:5173/api/book -H 'content-type: application/json' -d '{"name":"Test","email":"a@b.com","elapsedMs":9000}'
```

A JSON error means the function is reachable. HTML means the request was served
`index.html` instead, and the route is not mounted.

Two things to expect: rows written from localhost land in the **real** sheet, so
delete the test rows afterwards; and `elapsedMs` must be at least 2500 in a
hand-made request, or the timing guard silently drops it.

### Setup

1. **Google Cloud** → create a project → enable the **Google Sheets API**.
2. Create a **service account**, then a **JSON key** for it. The file contains
   `client_email` and `private_key`.
3. **Share the sheet with the service account's email**, as Editor. This is the
   step people miss — the account has no implicit access, and without it every
   append returns 403.
4. Give the sheet a header row matching the column order the function writes:

   | Timestamp | Name | Email | Brief | Referer |
   | --- | --- | --- | --- | --- |

5. Set the variables from `.env.example` in Vercel → Settings → Environment
   Variables.

### Email alerts

Optional. Set `RESEND_API_KEY`, `BOOKING_ALERT_FROM` and `BOOKING_ALERT_TO`;
leave them unset and bookings still reach the sheet, silently. The sender
domain must be verified in Resend. Replying to an alert reaches the prospect —
`reply_to` is set to their address.

A failed alert never fails the booking: the row is already saved, and the
visitor should not see an error about a notification they know nothing about.

### Spam handling

A hidden `company` field and a minimum fill time. Both respond `200` when
tripped, so a bot gets no signal to adapt to, but nothing is written.

This stops naive bots, not a determined one. If spam becomes a problem the next
step is Vercel BotID or a rate limit backed by Upstash — a serverless function
has no memory between invocations, so per-IP limiting needs a store.

### Note on `vercel.json`

The SPA catch-all rewrite now excludes `api/`. Without that exclusion,
`/api/book` matches the catch-all pattern and can be served `index.html`
instead of reaching the function.

## Not wired up
- Social links in the footer are `#` placeholders.
- Work cards play a shutter/player flourish on click, as designed — they do not
  open a gallery, film, or episode yet.
- Contact details (`src/data/content.js`) are the design's sample values.
