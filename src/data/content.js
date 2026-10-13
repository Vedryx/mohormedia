// All copy and structured content for the Mohor Media home page.
// Editing text here is enough — no component needs to change.

import wingwise from '../assets/clients/wingwise.jpg';
import arka from '../assets/clients/arka.png';
import rayDesignStudios from '../assets/clients/ray-design-studios.png';

export const nav = [
  { label: 'What We Do', href: '#mm-craft' },
  { label: 'Studio', href: '#mm-team' },
  { label: 'Work', href: '#mm-work' },
  { label: 'Stories', href: '#mm-stories' },
];

export const heroStats = [
  { value: '30+', label: 'Brands grown' },
  { value: '120+', label: 'Campaigns shipped' },
  { value: '6 yrs', label: 'Of quiet craft' },
];

// Client logos. Each file is trimmed to its own artwork and keeps the
// background the brand supplied (navy, dark green, white), so the marquee shows
// them as tiles rather than trying to knock out backgrounds that are not
// transparent in the source files.

// width/height are the files' intrinsic pixel sizes. They are passed to the
// <img> so the browser reserves the right box before a lazy image arrives —
// without them the flex items collapse to zero width and the rail jumps.
export const clients = [
  { name: 'WingWise Aviation Academy', logo: wingwise, width: 400, height: 360 },
  { name: 'Ray Design Studios', logo: rayDesignStudios, width: 290, height: 360 },
  { name: 'Arka', logo: arka, width: 511, height: 360 },
];

export const crafts = [
  {
    number: '01',
    title: 'Podcast Studio',
    description:
      'A room, a mic and an edit bay — shows that build authority episode after episode.',
    tags: ['Recording', 'Editing', 'Distribution'],
  },
  {
    number: '02',
    title: 'Branding & Identity',
    description:
      'Logos, systems and stories that give your brand a face worth remembering.',
    tags: ['Logo & visual identity', 'Brand strategy', 'Naming'],
  },
  {
    number: '03',
    title: 'Digital Marketing',
    description:
      'Full-funnel campaigns that turn scrolls into stops, and stops into sales.',
    tags: ['Campaigns', 'Funnels', 'Email'],
  },
  {
    number: '04',
    title: 'Social Media',
    description:
      'Feeds with a pulse — content calendars, community and everyday relevance.',
    tags: ['Content', 'Community', 'Reels'],
  },
  {
    number: '05',
    title: 'Performance Ads',
    description:
      'Meta, Google and beyond — media buying obsessed with return, not reach.',
    tags: ['Meta ads', 'Google ads', 'ROAS'],
  },
  {
    number: '06',
    title: 'Content & Films',
    description:
      "Scripts, shoots and edits that don't need an agency reel to prove they work.",
    tags: ['Brand films', 'Photography', 'Editing'],
  },
  {
    number: '07',
    title: 'Web & SEO',
    description:
      'Sites that load fast, read clearly and get found without paying for every click.',
    tags: ['Websites', 'Technical SEO', 'Analytics'],
  },
];

export const work = [
  {
    id: 'v2-work-1',
    title: 'Saffron Street Eatery',
    meta: 'Rebrand · Hospitality',
    result: 'Footfall +40%',
    type: 'photo',
    badge: 'Photo set · 14',
    veilLabel: 'View photo set',
    placeholder: 'Saffron Street — rebrand still',
  },
  {
    id: 'v2-work-2',
    title: "Baker's Dozen",
    meta: 'Performance · D2C',
    result: '3.2× ROAS in 90 days',
    type: 'photo',
    badge: 'Photo set · 22',
    veilLabel: 'View photo set',
    placeholder: "Baker's Dozen — campaign still",
  },
  {
    id: 'v2-work-3',
    title: 'Vaidya Wellness',
    meta: 'Films · Wellness',
    result: '+48% direct bookings',
    type: 'video',
    badge: 'Brand film · 2:14',
    veilLabel: 'Play the film',
    placeholder: 'Vaidya Wellness — brand film frame',
  },
  {
    id: 'v2-work-4',
    title: 'Codewell',
    meta: 'Web & SEO · SaaS',
    result: '2.1× demo signups',
    type: 'podcast',
    badge: 'Podcast · Ep 08',
    veilLabel: 'Play episode',
    placeholder: 'Codewell — podcast episode still',
  },
];

export const process = [
  {
    number: '01',
    title: 'Listen & Dig',
    description:
      'We start with your customers, not our portfolio. Deep interviews, market mapping and honest audits before a single pixel.',
    icon: 'listen',
  },
  {
    number: '02',
    title: 'Shape the Story',
    description:
      'Positioning, messaging and a creative platform — the one sharp idea everything else grows from.',
    icon: 'shape',
  },
  {
    number: '03',
    title: 'Craft & Create',
    description:
      'Identity, content, films and campaigns made in-house, reviewed with you weekly. No black boxes, no surprises.',
    icon: 'craft',
  },
  {
    number: '04',
    title: 'Launch & Grow',
    description:
      'We ship, measure and prune. Every campaign reports back with numbers you can read without a translator.',
    icon: 'launch',
  },
];

export const studio = {
  greeting: "Namaste,\nwe're Mohor.",
  headline: 'A small team that treats your budget like ',
  headlineItalic: 'its own.',
  body: 'No account managers relaying messages. You work directly with the strategist, the media buyer and the director who make your campaigns — from the first call to the last cut.',
  chips: ['Pune-based', '7 people'],
};

export const stories = [
  {
    id: 'story-aproop',
    tab: "Samruddhi's story",
    quote:
      '"Mohor took the time to understand what we actually make before they said a word about how to sell it. The work came back sharper than our own brief, and it still sounds like us."',
    author: 'Samruddhi Kuchik',
    role: 'Aproop Productions',
    link: 'https://aproopproductions.com',
    kind: 'text',
    placeholder: 'Samruddhi — video still or photo',
  },
  {
    id: 'story-vedryx',
    tab: "Dev's story",
    quote:
      '"We build software, not brands — so we handed that half to Mohor. Clear thinking, quick turnarounds, and none of the agency theatre. They are the team we point our own clients to."',
    author: 'Dev Saini',
    role: 'VedryxTech',
    link: 'https://vedryxtech.com',
    kind: 'text',
    placeholder: 'Dev — video still or photo',
  },
];

export const bookPoints = [
  'No pitch decks. Just honest conversation.',
  'Ideas you keep, free of charge.',
  'Reply within one working day.',
];

export const contact = {
  email: 'hello@mohormedia.com',
  // Both studio lines. `href` is the dial string; `label` is what the footer shows.
  phones: [
    { label: '+91 88558 78941', href: '+918855878941' },
    { label: '+91 87666 97127', href: '+918766697127' },
  ],
  location: 'Pune, Maharashtra, India',
  // Office address, one line per rendered row in the footer.
  addressLines: [
    '4th floor, Renuka Sankalpa Appt.,',
    'Bhoir colony, Chinchwad - 411033',
    'Pune, Maharashtra, India',
  ],
};

export const footerColumns = [
  {
    title: 'Services',
    links: [
      { label: 'Podcast Studio', href: '#mm-craft' },
      { label: 'Branding & Identity', href: '#mm-craft' },
      { label: 'Digital Marketing', href: '#mm-craft' },
      { label: 'Social Media', href: '#mm-craft' },
      { label: 'Performance Ads', href: '#mm-craft' },
      { label: 'Content & Films', href: '#mm-craft' },
      { label: 'Web & SEO', href: '#mm-craft' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'What We Do', href: '#mm-craft' },
      { label: 'Studio', href: '#mm-team' },
      { label: 'Work', href: '#mm-work' },
      { label: 'Book a Call', href: '#mm-book' },
    ],
  },
];
