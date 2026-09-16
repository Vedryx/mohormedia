const work = [
  {
    id: "v2-work-1",
    title: "Saffron Street Eatery",
    meta: "Rebrand · Hospitality",
    result: "Footfall +40%",
    type: "photo",
    badge: "Photo set · 14",
    veilLabel: "View photo set",
    placeholder: "Saffron Street — rebrand still",
  },
  {
    id: "v2-work-2",
    title: "Baker's Dozen",
    meta: "Performance · D2C",
    result: "3.2× ROAS in 90 days",
    type: "photo",
    badge: "Photo set · 22",
    veilLabel: "View photo set",
    placeholder: "Baker's Dozen — campaign still",
  },
  {
    id: "v2-work-3",
    title: "Vaidya Wellness",
    meta: "Films · Wellness",
    result: "+48% direct bookings",
    type: "video",
    badge: "Brand film · 2:14",
    veilLabel: "Play the film",
    placeholder: "Vaidya Wellness — brand film frame",
  },
  {
    id: "v2-work-4",
    title: "Codewell",
    meta: "Web & SEO · SaaS",
    result: "2.1× demo signups",
    type: "podcast",
    badge: "Podcast · Ep 08",
    veilLabel: "Play episode",
    placeholder: "Codewell — podcast episode still",
  },
];
const stories = [
  {
    id: "v2-story-1",
    tab: "Priya's story",
    quote:
      '"Mohor didn\'t just redesign our brand — they made people feel something about a family restaurant again. Footfall is up 40% and our packaging gets photographed more than our food."',
    author: "Priya Sharma",
    role: "Founder, Saffron Street Eatery",
    kind: "video",
    runtime: "1 min 12 sec",
    placeholder: "Priya — video still or photo",
  },
  {
    id: "v2-story-2",
    tab: "Vikram's story",
    quote:
      '"We had spent two years buying clicks that went nowhere. Mohor rebuilt the funnel from the message down — same budget, 3.2× the return, and reports I can actually read."',
    author: "Vikram Desai",
    role: "Director, Baker's Dozen",
    kind: "photo",
    placeholder: "Vikram — video still or photo",
  },
  {
    id: "v2-story-3",
    tab: "Neha's story",
    quote:
      '"They filmed for three days and somehow captured what we had been failing to explain for three years. Direct bookings are up 48% and we finally sound like ourselves."',
    author: "Neha Kulkarni",
    role: "Co-founder, Vaidya Wellness",
    kind: "text",
    placeholder: "Neha — video still or photo",
  },
];
const base = {
  subtitle: "",
  description: "",
  category: "Other",
  result: "",
  kind: "text",
  mediaUrl: "",
  posterUrl: "",
  alt: "",
  link: "",
  status: "published",
};
export const seed = {
  revision: 0,
  work: work.map((w) => ({
    ...base,
    id: w.id,
    title: w.title,
    subtitle: w.meta,
    result: w.result,
    status: "draft",
  })),
  stories: stories.map((s) => ({
    ...base,
    id: s.id,
    title: s.author,
    subtitle: s.role,
    description: s.quote,
  })),
  brands: [
    {
      id: "wingwise",
      title: "WingWise Aviation Academy",
      mediaUrl: "/clients/wingwise.jpg",
    },
    {
      id: "ray-design",
      title: "Ray Design Studios",
      mediaUrl: "/clients/ray-design-studios.png",
    },
    { id: "arka", title: "Arka", mediaUrl: "/clients/arka.png" },
  ].map((b) => ({ ...base, ...b, kind: "image", alt: b.title })),
};
