// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { CARD_ICONS } from "./core.js";
import { STRINGS } from "./i18n/strings.js";

export const BASE_ICONS = {
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};
export const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
export const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

export const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);

export const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
export const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
export const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
export const domainOf = (id) => String(id || "").split(".")[0];
export const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
export const DAY_MS = 8.64e7;

export const NUM_FMT = {};
export const fmtNum = (v, digits, locale) =>
  (NUM_FMT[`${locale}|${digits}`] ||= new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })).format(v);
// The other Intl formats, made once per locale and options (a render formats many times and distances).
export const INTL_FMT = new Map();
export const intlFmt = (Kind, locale, opts) => {
  const key = `${Kind.name}|${locale}|${JSON.stringify(opts)}`;
  let f = INTL_FMT.get(key);
  if (!f) INTL_FMT.set(key, (f = new Kind(locale, opts)));
  return f;
};
// The number of states, counted once per `hass.states` (shared by every card on the page).
export const _stateCount = new WeakMap();
export const stateCount = (hass) => {
  let n = _stateCount.get(hass.states);
  if (n === undefined) _stateCount.set(hass.states, (n = Object.keys(hass.states).length));
  return n;
};

// "8:12", "1:05:00": a countdown, rounded up to the second.
export const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
export const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};




// "12 min ago", "in 3 h", "2 days ago": the largest unit that fits, rounded.
export const fmtRelative = (hass, config, ms) => {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const rtf = intlFmt(Intl.RelativeTimeFormat, intlLocale(hass, config), { numeric: "auto", style: "short" });
  if (abs < 6e4) return rtf.format(0, "minute");
  if (abs < 3.6e6) return rtf.format(Math.round(diff / 6e4), "minute");
  if (abs < DAY_MS) return rtf.format(Math.round(diff / 3.6e6), "hour");
  return rtf.format(Math.round(diff / DAY_MS), "day");
};

// A length of time in its largest unit: "45 min", "7 h", "3 d" (the unit names from Intl).
export const fmtSpan = (hass, config, ms) => {
  const locale = intlLocale(hass, config);
  const unit = (n, u) => intlFmt(Intl.NumberFormat, locale, { style: "unit", unit: u, unitDisplay: "narrow" }).format(n);
  if (ms < 3.6e6) return unit(Math.max(0, Math.round(ms / 6e4)), "minute");
  if (ms < 2 * DAY_MS) return unit(Math.round(ms / 3.6e6), "hour");
  return unit(Math.round(ms / DAY_MS), "day");
};

// Registries: entries by device, names, areas.
export const _byDevice = new WeakMap();
export const byDevice = (hass) => {
  let map = _byDevice.get(hass.entities);
  if (map) return map;
  map = new Map();
  for (const e of Object.values(hass.entities || {})) {
    if (!e.device_id) continue;
    if (!map.has(e.device_id)) map.set(e.device_id, []);
    map.get(e.device_id).push(e);
  }
  _byDevice.set(hass.entities, map);
  return map;
};
export const devName = (d) => d?.name_by_user || d?.name || "";
export const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;
// What an entity is called, to recognise it: its id, translation key and names (registry and state), as snake_case.
export const keyText = (e, hass) =>
  [e.entity_id, e.translation_key, e.name, hass.states[e.entity_id]?.attributes?.friendly_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
export const deviceClass = (hass, id) => hass.states[id]?.attributes?.device_class;
// Name of an entity without its device's name in front ("Kitchen Pasta" on the device "Kitchen" → "Pasta").
export const shortName = (hass, id) => {
  const name = nameOf(hass, id);
  const dev = devName(hass.devices?.[hass.entities?.[id]?.device_id]);
  return dev && name.startsWith(`${dev} `) && name.length > dev.length + 1 ? name.slice(dev.length + 1) : name;
};
