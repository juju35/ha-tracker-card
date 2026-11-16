import assert from "node:assert/strict";
import { test } from "node:test";
import { HOME, mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const tk = load({ names: ["resolve", "companions", "distanceKm", "bearing", "niceRange", "placeOf", "iconFor", "STRINGS", "LANGUAGES"] });
const TrackerCard = tk.element("tracker-card");
const TrackerMiniCard = tk.element("tracker-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en", data, config } = {}) => {
  const d = data ?? mockData(variant);
  const calls = [];
  return { calls, ...d, config, language, locale: { language }, callService: (...a) => calls.push(a), callWS: async () => null };
};

const mount = async (config = {}, variant = "default", Card = TrackerCard, opts = {}) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(variant, opts);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  // Intl puts narrow no-break spaces in numbers and units ("1,8 km"): plain spaces for the assertions.
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[   ]/g, " ") };
};

const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("distances and bearings from home", () => {
  assert.equal(Math.round(tk.distanceKm(48.1, -1.6, 48.1, -1.6)), 0);
  assert.ok(Math.abs(tk.distanceKm(48.8566, 2.3522, 45.764, 4.8357) - 392) < 3, "Paris – Lyon");
  assert.ok(Math.abs(tk.bearing(HOME.latitude, HOME.longitude, HOME.latitude + 1, HOME.longitude)) < 1e-9, "north");
  assert.ok(Math.abs(tk.bearing(HOME.latitude, HOME.longitude, HOME.latitude, HOME.longitude + 1) - Math.PI / 2) < 0.02, "east");
  assert.equal(tk.niceRange(0.3), 0.5);
  assert.equal(tk.niceRange(229), 500);
  assert.equal(tk.niceRange(1e6), 20000);
});

test("places: home, a zone, away, unknown", () => {
  assert.equal(tk.placeOf({ state: "home" }), "home");
  assert.equal(tk.placeOf({ state: "not_home" }), "away");
  assert.equal(tk.placeOf({ state: "Park" }), "zone");
  assert.equal(tk.placeOf({ state: "unavailable" }), "unknown");
  assert.equal(tk.placeOf(undefined), "unknown");
});

test("icons from the names, in English and French", () => {
  assert.equal(tk.iconFor("Car keys"), "key");
  assert.equal(tk.iconFor("Clés"), "key");
  assert.equal(tk.iconFor("Vélo"), "bike");
  assert.equal(tk.iconFor("Dog"), "paw");
  assert.equal(tk.iconFor("Suitcase"), "suitcase");
  assert.equal(tk.iconFor("Sac à dos"), "bag");
  assert.equal(tk.iconFor("Thing"), "tag");
});

test("the trackers of tag, collar and GPS integrations are found, not the phones", () => {
  const m = tk.resolve(makeHass(), {});
  same(
    m.items.map((it) => [it.name, it.platform]),
    [
      ["Backpack", "bermuda"],
      ["Bike", "paj_gps"],
      ["Dog", "tractive"],
      ["Keys", "tile"],
      ["Suitcase", "findmy"],
      ["Wallet", "googlefindmy"],
    ],
  );
});

test("their devices give the battery, the Bermuda area and the ring button", () => {
  const hass = makeHass();
  same(tk.companions(hass, "device_tracker.gps_bike"), { battery: "sensor.gps_bike_battery", area: null, seen: null, button: null });
  same(tk.companions(hass, "device_tracker.ble_backpack"), { battery: null, area: "sensor.ble_backpack_area", seen: null, button: null });
  assert.equal(tk.companions(hass, "device_tracker.fmd_wallet").button, "button.fmd_wallet_play_sound");
  assert.equal(tk.companions(hass, "device_tracker.airtag_suitcase").button, "button.airtag_suitcase_play_sound");
});

test("configured trackers keep their order, names and colors", () => {
  const m = tk.resolve(makeHass(), { trackers: ["device_tracker.gps_bike", { entity: "device_tracker.tag_keys", name: "House keys", color: "#ff0000" }, "device_tracker.nope"] });
  same(
    m.items.map((it) => [it.entity, it.name, it.tint]),
    [
      ["device_tracker.gps_bike", "Bike", "#3949ab"],
      ["device_tracker.tag_keys", "House keys", "#ff0000"],
    ],
  );
});

test("full card: header, radar and the items with place, area, last seen, distance and battery", async () => {
  const { html } = await mount();
  assert.match(html(), /Tracked items/);
  assert.match(html(), /3 at home · 3 away/);
  assert.match(html(), /chip warn[^>]*>.*Low battery/s);
  assert.match(html(), /class="radar"/);
  assert.match(html(), /class="sweep"/);
  assert.equal((html().match(/class="blip/g) || []).length, 6);
  assert.match(html(), /<b>3<\/b><span>at home/);
  assert.match(html(), /3 away · farthest Suitcase 229 km/);
  assert.match(html(), /line warn">.*Dog: battery 18 %/s);
  assert.match(html(), /All seen in the last/);
  assert.match(html(), /row-state ok">Home · Hallway</);
  assert.match(html(), /row-state warn">Park · 600 m</);
  assert.match(html(), /tile active tint">.*row-state active">Away · 1\.8 km</s);
  assert.match(html(), /pill idle"[^>]*>.*1 min\. ago/s);
  assert.match(html(), /pill warn"[^>]*>.*18 %/s);
});

test("an item not seen for long: in red, and the header says so", async () => {
  const { html } = await mount({}, "lost");
  assert.match(html(), /chip crit[^>]*>.*Not seen/s);
  assert.match(html(), /Not seen for 2d/);
  assert.match(html(), /blip lost/);
  const never = await mount({ lost_after: 0 }, "lost");
  assert.doesNotMatch(never.html(), /Not seen/);
});

test("ring: presses the device's button and the bell shakes for a while", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "ring", entity: "button.fmd_wallet_play_sound" });
  same(hass.calls.at(-1), ["button", "press", { entity_id: "button.fmd_wallet_play_sound" }]);
  assert.match(html(), /pill accent ringing"[^>]*data-entity="button\.fmd_wallet_play_sound"[^>]*>.*Ringing/s);
  assert.equal((html().match(/data-action="ring"/g) || []).length, 2);
});

test("a tap on an item or a blip opens its more-info", async () => {
  const { card } = await mount();
  click(card, { entity: "device_tracker.collar_dog" });
  assert.equal(card.events.at(-1).type, "hass-more-info");
  assert.equal(card.events.at(-1).detail.entityId, "device_tracker.collar_dog");
});

test("options: radar, distances, batteries and last seen hidden; sections folded", async () => {
  const { html } = await mount({ show_radar: false, show_distance: false, show_battery: false, show_seen: false });
  assert.doesNotMatch(html(), /class="radar"/);
  assert.doesNotMatch(html(), /1\.8 km/);
  assert.doesNotMatch(html(), /class="bat/);
  assert.doesNotMatch(html(), /Seen/);
  assert.doesNotMatch(html(), /Low battery/);
  const folded = await mount({ collapsed: ["items"] });
  assert.doesNotMatch(folded.html(), /class="rows"/);
  assert.match(folded.html(), /aria-expanded="false"/);
});

test("battery threshold and radar range", async () => {
  const { html } = await mount({ battery_threshold: 10, radar_range: 1000 });
  assert.doesNotMatch(html(), /Low battery/);
  const rings = (h) => [...h.matchAll(/class="ringl"[^>]*r="([\d.]+)"/g)].map((m) => m[1]).join();
  const auto = await mount();
  assert.notEqual(rings(html()), rings(auto.html()));
});

test("miles when Home Assistant uses them", async () => {
  const { html } = await mount({}, "default", TrackerCard, { config: { unit_system: { length: "mi" } } });
  assert.match(html(), /1\.1 mi/);
  assert.match(html(), /142 mi/);
});

test("an item without coordinates near home is placed by its zone; one without a home zone: no radar", async () => {
  const data = mockData();
  delete data.states["zone.home"];
  const { html } = await mount({}, "default", TrackerCard, { data });
  assert.doesNotMatch(html(), /class="radar"/);
  assert.match(html(), /Backpack/);
});

test("mini card: a small radar, the items away first; the detail button shows the full card", async () => {
  const { card, html } = await mount({}, "default", TrackerMiniCard);
  assert.match(html(), /content mini/);
  assert.match(html(), /class="radar"/);
  assert.match(html(), /3 away · farthest Suitcase/);
  assert.match(html(), /Dog: battery 18 %/);
  // The ring button of the first item away that can ring.
  assert.match(html(), /btn round"[^>]*data-entity="button\.airtag_suitcase/);
  click(card, { action: "zoom" });
  assert.match(html(), /class="tiles items"/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
});

test("mini card: a lost item comes first", async () => {
  const { html } = await mount({ mini_count: 2 }, "lost", TrackerMiniCard);
  const lines = [...html().matchAll(/class="line[^"]*">/g)];
  assert.equal(lines.length, 2);
  assert.match(html(), /line crit">.*Suitcase: Not seen for/s);
});

test("nothing found: a clear message instead of an empty card", () => {
  const card = new TrackerCard();
  card.setConfig({});
  card.hass = { states: {}, entities: {}, devices: {}, language: "en" };
  assert.match(card.shadowRoot.innerHTML, /no tracked item found/);
});

test("French: texts and numbers in the card's language", async () => {
  const { html } = await mount({ language: "fr" });
  assert.match(html(), /Objets suivis/);
  assert.match(html(), /3 à la maison · 3 dehors/);
  assert.match(html(), /1,8 km/);
  assert.match(html(), /Maison · Hallway/);
});

test("the clock is the mocks' one", () => {
  assert.equal(new tk.window.Date().getTime(), NOW);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = tk.STRINGS.en;
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [l, table] of Object.entries(tk.STRINGS)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.deepEqual(ph(table[k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(tk.LANGUAGES.length, Object.keys(tk.STRINGS).length);
});

test("visual editor: defaults left out of the YAML; the mini editor adds the detail button and its lines", () => {
  const Editor = tk.element("tracker-card-editor");
  const MiniEditor = tk.element("tracker-mini-card-editor");
  const doc = tk.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    let out;
    ed.dispatchEvent = (ev) => {
      out = ev.detail.config;
    };
    ed.setConfig({ type: "custom:tracker-card" });
    ed.hass = makeHass();
    assert.match(form.computeLabel({ name: "trackers" }), /Trackers/);
    assert.match(form.computeLabel({ name: "lost_after" }), /Not seen after/);
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:tracker-card", show_radar: true, battery_threshold: 15, trackers: [] } } });
    same(out, { type: "custom:tracker-card", battery_threshold: 15 });
  } finally {
    doc.createElement = create;
  }
  assert.ok(MiniEditor.toggles.some(([n]) => n === "zoom"));
  assert.ok(new MiniEditor()._fields().some((f) => f.name === "mini_count"));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  const { html } = await mount();
  for (const m of html().matchAll(/<(div|span|g)[^>]*data-(entity|action)=[^>]*>/g)) {
    assert.match(m[0], /role="button"/, m[0]);
    assert.match(m[0], /tabindex="0"/, m[0]);
  }
});
