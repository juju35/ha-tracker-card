// ---------------------------------------------------------------------------
// Illustrated header: a street map at the right of the banner, home in the middle of a radar, a pin per item
// ---------------------------------------------------------------------------
import { SWEEP_MS } from "./core.js";
import { ICONS, esc } from "./helpers.js";

// The night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the
// day picture after sunset).
export const isNight = (hass, config) => {
  if (config?.illustration_theme === "night") return true;
  if (config?.illustration_theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// Home on the map (drawn on 0 0 200 80, shown from x 30): the radar's centre.
export const MAP_HOME = [128, 46];
export const PIN = "M0 0C-5.6 -6.6 -5.6 -13.2 0 -13.2C5.6 -13.2 5.6 -6.6 0 0Z";

// A pin hanging at (x, y): its colour, the item's state (away pins bob, a low battery blinks, a lost one fades and
// pulses red).
export const mapPin = ({ x, y, tint, away, low, lost }, i) => {
  const cls = ["tk-pin", away ? "away" : "", lost ? "lost" : ""].filter(Boolean).join(" ");
  const pulse = lost ? `<circle class="tk-pulse" r="6"/>` : "";
  const batt = low && !lost ? `<g class="tk-batt" transform="translate(5 -18)"><rect x="0" y="0" width="9" height="5" rx="1"/><rect x="9" y="1.5" width="1.2" height="2"/><rect class="lvl" x="1" y="1" width="2" height="3"/></g>` : "";
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${pulse}<g class="${cls}" style="--c: ${esc(tint)}; animation-delay: ${(-i * 0.37).toFixed(2)}s"><path d="${PIN}"/><circle cy="-8.6" r="2.2"/></g>${batt}</g>`;
};

// The map: streets, a park, a pond, the radar round home and its sweep (the state's colour), a route to the farthest
// item away, home's pin and the items' pins. `uid` keeps each card's ids apart on a page with several cards.
export const trackerScene = ({ uid, state, pins, far }) => {
  const [hx, hy] = MAP_HOME;
  const streets = [18, 46, 68].map((y) => `<path d="M0 ${y}H200"/>`).join("") + [30, 80, 130, 172].map((x) => `<path d="M${x} 0V80"/>`).join("");
  const route = far ? `<path class="tk-route" d="M${hx} ${hy}Q${((hx + far.x) / 2).toFixed(1)} ${(Math.min(hy, far.y) - 14).toFixed(1)} ${far.x.toFixed(1)} ${(far.y - 2).toFixed(1)}"/>` : "";
  return `<svg class="tk-scene tk-${state}" viewBox="30 0 170 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs><radialGradient id="tk-glow-${uid}"><stop offset="0" stop-color="var(--tk-st)" stop-opacity=".28"/><stop offset="1" stop-color="var(--tk-st)" stop-opacity="0"/></radialGradient></defs>
    <g class="tk-streets">${streets}</g>
    <g class="tk-park"><rect x="36" y="23" width="38" height="17" rx="2"/><rect x="136" y="3" width="30" height="10" rx="2"/><circle cx="56" cy="31" r="3.4"/><circle cx="64" cy="29" r="2.6"/></g>
    <rect class="tk-pond" x="86" y="52" width="38" height="11" rx="5"/>
    <circle cx="${hx}" cy="${hy}" r="30" fill="url(#tk-glow-${uid})"/>
    <g class="tk-radar" transform="translate(${hx} ${hy})"><circle r="30"/><circle r="17"/><g class="tk-sweep"><path d="M0 0L30 0A30 30 0 0 0 21.2 -21.2Z"/></g></g>
    ${route}
    ${pins.map(mapPin).join("")}
    <g class="tk-home" transform="translate(${hx} ${hy})"><path d="M0 0C-6.6 -7.6 -6.6 -15.4 0 -15.4C6.6 -15.4 6.6 -7.6 0 0Z"/><path class="roof" transform="translate(-4 -14) scale(.333)" d="${ICONS.home}"/></g>
  </svg>`;
};

export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; --g: 10px; --tk-scene-w: min(180px, 50%);
            background: #eef3e8; color: #0d2a45; }
  .banner.night { background: #1f2a38; color: #fff; }
  .banner.st-ok { --tk-st: #43a047; } .banner.st-active { --tk-st: #2f80ed; } .banner.st-warn { --tk-st: #f29d00; } .banner.st-crit { --tk-st: #e53935; }
  .banner.night.st-active { --tk-st: #4f8fe0; }
  /* The map fills the right of the banner above the ground strip, fading into the sky under the text. */
  .tk-scene { position: absolute; right: 0; bottom: var(--g); width: var(--tk-scene-w); height: calc(100% - var(--g)); overflow: hidden;
              -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 14%); mask-image: linear-gradient(90deg, transparent 0, #000 14%); }
  .tk-streets path { stroke: #fff; stroke-width: 4; fill: none; } .night .tk-streets path { stroke: #2e3c50; }
  .tk-park rect { fill: #cfe5c0; } .tk-park circle { fill: #a9d18f; } .night .tk-park rect { fill: #25384a; } .night .tk-park circle { fill: #2c4a3a; }
  .tk-pond { fill: #bfe0f7; } .night .tk-pond { fill: #1b3a5a; }
  .tk-radar circle { fill: none; stroke: var(--tk-st); stroke-opacity: .4; }
  .tk-sweep { fill: var(--tk-st); opacity: .2; transform-box: view-box; transform-origin: 0 0; animation: tk-turn ${SWEEP_MS}ms linear infinite; }
  .tk-route { fill: none; stroke: var(--tk-st); stroke-width: 1.4; stroke-dasharray: 3 3; stroke-linecap: round; opacity: .8; animation: tk-flow 1.2s linear infinite; }
  .tk-pin path { fill: var(--c); stroke: rgba(0,0,0,.18); stroke-width: .5; } .tk-pin circle { fill: #fff; }
  .tk-pin.away { animation: tk-bob 2.4s ease-in-out infinite; }
  .tk-pin.lost { opacity: .55; } .tk-pin.lost path { stroke: #e53935; stroke-width: 1; stroke-dasharray: 2 1.4; }
  .tk-pulse { fill: none; stroke: #e53935; stroke-width: 1.2; transform-box: fill-box; transform-origin: center; animation: tk-pulse 1.8s ease-out infinite; }
  .tk-batt rect { fill: #f29d00; } .tk-batt rect:first-child { fill: #fff; stroke: #f29d00; stroke-width: .9; } .tk-batt .lvl { fill: #e53935; }
  .night .tk-batt rect:first-child { fill: #1f2a38; }
  .tk-batt { animation: tk-blink 1.2s steps(2) infinite; }
  .tk-home path { fill: var(--tk-st); stroke: #fff; stroke-width: .8; } .tk-home .roof { fill: #fff; stroke: none; }
  .night .tk-home path:first-child { stroke: #1f2a38; }
  @keyframes tk-turn { to { transform: rotate(360deg); } }
  @keyframes tk-flow { to { stroke-dashoffset: -12; } }
  @keyframes tk-bob { 50% { transform: translateY(-1.6px); } }
  @keyframes tk-pulse { from { transform: scale(.5); opacity: 1; } to { transform: scale(1.8); opacity: 0; } }
  @keyframes tk-blink { 50% { opacity: .25; } }
  /* The ground strip: a map edge, light green with the dashed blue line of a route. */
  .ground { position: absolute; left: 0; right: 0; bottom: 0; height: var(--g); }
  .g-map { background-color: #dfe8d2; background-image: repeating-linear-gradient(90deg, #2f80ed 0 5px, transparent 5px 10px);
           background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 55%; box-shadow: inset 0 2px 0 #fff; }
  .night .g-map { background-color: #22303a; box-shadow: inset 0 2px 0 #2e3c50; }
  /* The text on the sky at the left: the round icon (its colour follows the state), the title and the subtitle. */
  .htext { position: absolute; left: 12px; top: 0; bottom: var(--g); right: calc(var(--tk-scene-w) * .7); display: flex; align-items: center; gap: 10px; min-width: 0; z-index: 1; }
  .htext .titles { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .htext .name { font-size: 16px; font-weight: 500; }
  .htext .sub { font-size: 13px; color: #3b5b78; }
  .night .htext .sub { color: rgba(255,255,255,.78); }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tk-tint) 22%, transparent); }
  .banner .type-icon .icon { fill: color-mix(in srgb, var(--tk-tint) 82%, #0d2a45); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--tk-tint) 62%, #fff); }
  /* The mini card's detail button: a frosted round button in the banner's top-right corner. */
  .banner .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; cursor: pointer; width: 24px; height: 24px;
                  border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .banner .zoom .icon { width: 16px; height: 16px; }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #ffffff; }
  .banner .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .htext .titles { flex: 1 1 0; min-width: 0; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
  /* The status pill on the banner: the status colour on frosted glass. */
  .banner .chip { display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; margin: 0; max-width: 51%; padding: 1px 8px; border-radius: 12px;
                  font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; overflow: hidden; box-sizing: border-box;
                  background: color-mix(in srgb, var(--c, var(--tk-accent)) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c, var(--tk-accent)) 45%, #0d2a45); }
  .banner.night .chip { background: color-mix(in srgb, var(--c, var(--tk-accent)) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c, var(--tk-accent)) 35%, #ffffff); }
  .banner .chip .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--c, var(--tk-accent)); }
  .banner .chip .chip-text { display: inline; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .banner + .content { padding-top: 12px; }
  /* Narrow card: no room for the map beside the text, the background alone stays. */
  /* The mini card: the map steps aside for the detail button in the top-right corner. */
  @container tk-card (min-width: 251px) {
    .banner:has(> .zoom) .tk-scene { right: 30px; }
    .banner:has(> .zoom) .htext { right: calc(var(--tk-scene-w) * .7 + 30px); }
  }
  @container tk-card (max-width: 250px) { .tk-scene { display: none; } .htext { right: 36px; } }
`;
