// ---------------------------------------------------------------------------
// Discovery, places and distances
// ---------------------------------------------------------------------------
import { TINTS, TRACKER_PLATFORMS } from "./core.js";
import { asList, byDevice, devName, deviceClass, domainOf, keyText, shortName, stateCount, valid } from "./helpers.js";

// Shown unless hidden in Home Assistant or a configuration / diagnostic entity.
export const visible = (hass, id) => {
  const e = hass.entities?.[id];
  return !e || (!e.hidden && !e.hidden_by && !e.entity_category);
};

// The buttons that make an item ring: a sound first (play sound, ring, beep, buzz), locating it otherwise; never one that stops a sound. Matched as
// whole words of the button's own name (translation key, entity id and name without the device's name): a device called "Keyring" rings nothing.
export const RING_FIRST = /(^|_)(play_sound|ring|sound|beep|buzz)(_|$)/;
export const RING_ELSE = /(^|_)(alarm|find|identify|locate)(_|$)/;
export const STOP = /(^|_)stop(_|$)/;
export const snake = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
// The words of an entity's own name, without its device's name.
export const ownKeys = (hass, x) => {
  const dev = snake(devName(hass.devices?.[x.device_id]));
  let id = x.entity_id.split(".")[1] || "";
  if (dev && id.startsWith(`${dev}_`)) id = id.slice(dev.length + 1);
  return [snake(x.translation_key), id, snake(shortName(hass, x.entity_id))].filter(Boolean);
};
export const ownMatch = (hass, x, re) => ownKeys(hass, x).some((k) => re.test(k));
// A binary sensor saying the item is lost; not a lost connection or signal.
export const isLostFlag = (x) => {
  const id = x.entity_id.split(".")[1] || "";
  return x.translation_key === "lost" || (/_lost$/.test(id) && !/(connection|signal|link)_lost$/.test(id));
};

// The entities of an item's device that the card reads: its battery, its Bermuda area, its "last seen" time, its estimated distance (Private BLE
// Device, iBeacon), its lost flag and the button (or the Tractive buzzer switch) that makes it ring.
export const companions = (hass, id) => {
  const e = hass.entities?.[id];
  const list = (e?.device_id && byDevice(hass).get(e.device_id)) || [];
  const of = (domain) => list.filter((x) => x.entity_id !== id && domainOf(x.entity_id) === domain && hass.states[x.entity_id]);
  const battery =
    of("sensor").find((x) => deviceClass(hass, x.entity_id) === "battery")?.entity_id ||
    of("binary_sensor").find((x) => deviceClass(hass, x.entity_id) === "battery")?.entity_id ||
    null;
  const area = of("sensor").find((x) => x.translation_key === "area" || /_area$/.test(x.entity_id))?.entity_id || null;
  // Last seen: a timestamp sensor named so (last_seen, last_located, last_update) first, a looser name only else.
  const stamps = of("sensor").filter((x) => deviceClass(hass, x.entity_id) === "timestamp");
  const seen =
    (stamps.find((x) => /last[ _-]?(seen|located|update)/i.test(keyText(x, hass))) || stamps.find((x) => /seen|located/i.test(keyText(x, hass))))
      ?.entity_id || null;
  const estimate = of("sensor").find((x) => x.translation_key === "estimated_distance" || /estimated_distance$/.test(x.entity_id))?.entity_id || null;
  const lostFlag = of("binary_sensor").find(isLostFlag)?.entity_id || null;
  const buttons = of("button").filter((x) => !ownMatch(hass, x, STOP));
  const button = (buttons.find((x) => ownMatch(hass, x, RING_FIRST)) || buttons.find((x) => ownMatch(hass, x, RING_ELSE)))?.entity_id || null;
  const buzzer = of("switch").find((x) => x.translation_key === "tracker_buzzer" || /buzzer/.test(keyText(x, hass)))?.entity_id || null;
  return { battery, area, seen, estimate, lost: lostFlag, button, buzzer };
};

// What rings an item: its button, else its buzzer switch (Tractive).
export const ringer = (it) => it.button || it.buzzer || null;

export const _cache = new WeakMap();

// Phones, tablets and computers that tag integrations (Google Find My Device, SmartThings Find) also list: left out
// of the automatic list, by their device's model or name.
export const PHONE_RE = /\b(i?phone|smartphone|ipad|tablet|pixel \d+[a-z]*|pixel (fold|tablet)|galaxy (s|a|z|note|tab)\s?\d*|macbook|imac)\b/i;
export const isPhone = (hass, e) => {
  const d = hass.devices?.[e?.device_id];
  return PHONE_RE.test(`${d?.model || ""} ${d?.name_by_user || ""} ${d?.name || ""}`);
};

// The trackers of the configuration (entity ids, or { entity, name, icon, color, battery, area, button }), else every
// visible device tracker of a tag, collar or GPS tracker integration; each one with its companions.
export const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify(config.trackers ?? null)}|${stateCount(hass)}`;
  if (per.has(sig)) return per.get(sig);
  // Edited in the visual editor, each new configuration is a new key: only the last few are kept.
  if (per.size >= 16) per.clear();
  const listed = config.trackers !== undefined;
  const src = listed
    ? asList(config.trackers).map((x) => (typeof x === "string" ? { entity: x } : x))
    : Object.values(hass.entities || {})
        .filter((e) => domainOf(e.entity_id) === "device_tracker" && TRACKER_PLATFORMS.includes(e.platform) && visible(hass, e.entity_id) && !isPhone(hass, e))
        .map((e) => ({ entity: e.entity_id }));
  const items = src
    .filter((x) => x?.entity && hass.states[x.entity])
    .map((x) => {
      const e = hass.entities?.[x.entity];
      const name = x.name || devName(hass.devices?.[e?.device_id]) || shortName(hass, x.entity);
      return { ...companions(hass, x.entity), ...x, name, platform: e?.platform || null };
    });
  if (!listed) items.sort((a, b) => a.name.localeCompare(b.name));
  items.forEach((it, i) => {
    it.tint = it.color || TINTS[i % TINTS.length];
  });
  const out = { items };
  per.set(sig, out);
  return out;
};

// The distance in km between two points (haversine).
export const distanceKm = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * rad) / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, a)));
};

// The direction from the first point to the second, in radians clockwise from north.
export const bearing = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const y = Math.sin((lon2 - lon1) * rad) * Math.cos(lat2 * rad);
  const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) - Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon2 - lon1) * rad);
  return Math.atan2(y, x);
};

// The radar's range: the first round distance (km) at least the farthest item's.
export const RANGES = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 20000];
export const niceRange = (km) => RANGES.find((r) => r >= km) ?? RANGES[RANGES.length - 1];

// Where an item is: home, a zone (named), away or unknown.
export const placeOf = (s) => {
  if (!s || !valid(s)) return "unknown";
  if (s.state === "home") return "home";
  if (s.state === "not_home") return "away";
  return "zone";
};
