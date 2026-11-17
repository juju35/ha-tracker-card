// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `variant` picks the mock data (scripts/mock-states.mjs).
const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "tracker-card", width: 460, config: {} },
  { file: "card-home", type: "tracker-card", width: 460, config: { show_items: false }, variant: "home" },
  { file: "card-lost", type: "tracker-card", width: 460, config: { show_radar: false }, variant: "lost" },
  { file: "mini-card", type: "tracker-mini-card", width: 380, config: {} },
  { file: "mini-card-lost", type: "tracker-mini-card", width: 380, config: {}, variant: "lost" },
  { file: "mini-card-zoom", type: "tracker-mini-card", width: 460, config: {}, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "tracker-card", width: 238, config: {} },
  { file: "mini-card-narrow", type: "tracker-mini-card", width: 170, config: {} },
]);

// One looping GIF per distinct animated state:
//   radar — the radar's beam sweeps round home, and the header's map moves (beam, bobbing pins, route, blinking battery)
//   ring  — an item rings: the bell of its button shakes
export const gifs = twins([
  { file: "radar", type: "tracker-card", width: 460, config: { show_items: false }, seconds: 4 },
  { file: "ring", type: "tracker-card", width: 460, config: { show_radar: false }, clicks: ['[data-action="ring"][data-entity="button.fmd_wallet_play_sound"]'], seconds: 0.9 },
]);
