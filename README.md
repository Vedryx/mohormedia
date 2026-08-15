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

## Not wired up

- **The "Book a Call" form does not submit anywhere.** `onSubmit` in
  `src/components/BookCall.jsx` only flips to the thank-you label, matching the
  design's stub. Point it at your form endpoint before launch.
- Social links in the footer are `#` placeholders.
- Work cards play a shutter/player flourish on click, as designed — they do not
  open a gallery, film, or episode yet.
- Contact details (`src/data/content.js`) are the design's sample values.
