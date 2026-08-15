// Page-level switches. These mirror the editable props on the design canvas
// (showHeroStats / storyMedia / motion), so the same knobs exist in code.

export const siteConfig = {
  /** Show the 30+ / 120+ / 6 yrs row under the hero copy. */
  showHeroStats: true,

  /**
   * Force every client story to render as a given media kind.
   * 'as authored' keeps each story's own kind: 'video' | 'photo' | 'text'.
   */
  storyMedia: 'as authored',

  /** Reveal intensity: 'subtle' | 'noticeable' | 'showy'. */
  motion: 'showy',

  /** Play the full-screen logo intro on first load. */
  showIntro: true,
};

export const motionPresets = {
  subtle: { distance: 14, duration: 0.6, parallax: 0 },
  noticeable: { distance: 24, duration: 0.8, parallax: 0.06 },
  showy: { distance: 38, duration: 1, parallax: 0.06 },
};

export function getMotion(name = siteConfig.motion) {
  return motionPresets[name] ?? motionPresets.showy;
}
