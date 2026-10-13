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
    id: "story-aproop",
    quote:
      '"Mohor took the time to understand what we actually make before they said a word about how to sell it. The work came back sharper than our own brief, and it still sounds like us."',
    author: "Samruddhi Kuchik",
    role: "Aproop Productions",
    link: "https://aproopproductions.com",
  },
  {
    id: "story-vedryx",
    quote:
      '"We build software, not brands — so we handed that half to Mohor. Clear thinking, quick turnarounds, and none of the agency theatre. They are the team we point our own clients to."',
    author: "Dev Saini",
    role: "VedryxTech",
    link: "https://vedryxtech.com",
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
    link: s.link,
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
