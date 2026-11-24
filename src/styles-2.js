// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
import { SWEEP_MS } from "./core.js";

export const TRACKER_STYLE = `
  .radar { position: relative; width: 100%; aspect-ratio: 1; }
  .radar svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .radar .disc { fill: color-mix(in srgb, var(--tk-accent) 8%, transparent); stroke: color-mix(in srgb, var(--tk-accent) 35%, transparent); stroke-width: 1; }
  .radar .ringl { fill: none; stroke: color-mix(in srgb, var(--tk-accent) 30%, transparent); stroke-width: .8; stroke-dasharray: 2 3; }
  .radar .homezone { fill: color-mix(in srgb, var(--tk-accent) 14%, transparent); stroke: color-mix(in srgb, var(--tk-accent) 40%, transparent); stroke-width: 1; }
  .radar .homedot { fill: var(--tk-accent); }
  .radar .homeicon { fill: #fff; }
  .radar .blip { cursor: pointer; }
  .radar .blip circle { fill: var(--ha-card-background, var(--card-background-color, #fff)); stroke: var(--c); stroke-width: 2.5; }
  .radar .blip path { fill: color-mix(in srgb, var(--c) 75%, var(--primary-text-color)); }
  .radar .blip.lost { opacity: .45; }
  .radar .blip.lost circle { stroke-dasharray: 3 3; }
  .radar .blip:focus-visible { outline: none; }
  .radar .blip:focus-visible circle { stroke-width: 4; }
  /* The sweep: a beam turns round the radar. */
  .radar .sweep { position: absolute; inset: 4%; border-radius: 50%; pointer-events: none; animation: tk-sweep ${SWEEP_MS}ms linear infinite;
                  background: conic-gradient(from 0deg, transparent 0deg 300deg, color-mix(in srgb, var(--tk-accent) 6%, transparent) 320deg, color-mix(in srgb, var(--tk-accent) 30%, transparent) 360deg); }
  @keyframes tk-sweep { to { transform: rotate(360deg); } }
  .items { --cols: 2; }
  .tile-head { cursor: pointer; border-radius: 6px; }
  .tile-head:focus-visible { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: 2px; }
  .tile .row-text { gap: 0; }
  .badges .pill .num { font-variant-numeric: tabular-nums; }
  button.pill { border: none; font: inherit; font-size: 12px; cursor: pointer; }
  button.pill:disabled { opacity: .45; cursor: default; }
  button.pill:focus-visible { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: 1px; }
  /* The ring buttons: the accent mixed with the text colour, readable in the dark theme too. */
  .pill.accent { color: color-mix(in srgb, var(--tk-accent) 40%, var(--primary-text-color)); }
  .pill.accent .icon, .btn.ring .icon { color: color-mix(in srgb, var(--tk-accent) 55%, var(--primary-text-color)); }
  .pill.ringing .icon { animation: tk-shake .9s ease-in-out infinite; transform-origin: 50% 10%; }
  .btn.ringing .icon { animation: tk-shake .9s ease-in-out infinite; transform-origin: 50% 10%; }
  @keyframes tk-shake { 0%, 50%, 100% { transform: rotate(0); } 10%, 30% { transform: rotate(-16deg); } 20%, 40% { transform: rotate(16deg); } }
  .mini .hero-art { width: 84px; }
  .mini .hero-body { gap: 4px; }
  @container tk-card (max-width: 340px) {
    .items { --cols: 1; }
    .hero-art { width: 96px; }
  }
  @container tk-card (max-width: 260px) {
    .hero { flex-direction: column; align-items: stretch; }
    .hero-art { width: 120px; margin: 0 auto; }
    .mini .hero { flex-direction: row; align-items: center; }
    .mini .hero-art { display: none; }
  }
  @container tk-card (max-width: 200px) {
    .mini .btn.ring { display: none; }
  }
`;
