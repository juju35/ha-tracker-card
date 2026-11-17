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
      ["Keys", "private_ble_device"],
      ["Suitcase", "findmy"],
      ["Wallet", "googlefindmy"],
    ],
  );
});

test("their devices give the battery, the Bermuda area and the ring button", () => {
  const hass = makeHass();
  const none = { battery: null, area: null, seen: null, estimate: null, lost: null, button: null, buzzer: null };
  same(tk.companions(hass, "device_tracker.gps_bike"), { ...none, battery: "sensor.gps_bike_battery" });
  same(tk.companions(hass, "device_tracker.ble_backpack"), { ...none, area: "sensor.ble_backpack_area" });
  // Play sound, not the stop sound or locate buttons listed before it.
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
  // The banner: a low battery (amber icon), the item named in the subtitle, a pin per item on the map.
  assert.match(html(), /class="banner st-warn"/);
  assert.match(html(), /type-icon warn/);
  assert.match(html(), /class="sub">Dog · 18 %</);
  assert.match(html(), /ground g-map/);
  assert.equal((html().match(/class="tk-pin/g) || []).length, 6);
  assert.match(html(), /class="tk-batt"/);
  assert.match(html(), /class="tk-route"/);
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
  assert.match(html(), /class="banner st-crit"/);
  assert.match(html(), /class="sub">Suitcase · not seen for 2d</);
  assert.match(html(), /tk-pin away lost/);
  assert.match(html(), /class="tk-pulse"/);
  const classic = await mount({ illustration: false }, "lost");
  assert.match(classic.html(), /chip crit[^>]*>.*Not seen/s);
  assert.match(html(), /Suitcase: not seen for 2d/);
  assert.match(html(), /blip lost/);
  const never = await mount({ lost_after: 0 }, "lost");
  assert.doesNotMatch(never.html(), /Not seen/);
});

test("ring: presses the device's button and the bell shakes for a while", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "ring", entity: "button.fmd_wallet_play_sound" });
  same(hass.calls.at(-1), ["button", "press", { entity_id: "button.fmd_wallet_play_sound" }]);
  assert.match(html(), /pill accent ringing"[^>]*data-entity="button\.fmd_wallet_play_sound"[^>]*>.*Ringing/s);
  assert.equal((html().match(/data-action="ring"/g) || []).length, 3);
});

test("ring button: a sound first, locate only as a fallback, never a stop button", () => {
  const hass = makeHass();
  delete hass.states["button.fmd_wallet_play_sound"];
  assert.equal(tk.companions(hass, "device_tracker.fmd_wallet").button, "button.fmd_wallet_locate_device");
  delete hass.states["button.fmd_wallet_locate_device"];
  assert.equal(tk.companions(hass, "device_tracker.fmd_wallet").button, null);
});

test("Tractive: the buzzer switch rings the collar", async () => {
  assert.equal(tk.companions(makeHass(), "device_tracker.collar_dog").buzzer, "switch.collar_dog_buzzer");
  const { card, hass, html } = await mount();
  assert.match(html(), /data-action="ring" data-entity="switch\.collar_dog_buzzer"/);
  click(card, { action: "ring", entity: "switch.collar_dog_buzzer" });
  same(hass.calls.at(-1), ["switch", "turn_on", { entity_id: "switch.collar_dog_buzzer" }]);
  assert.match(html(), /pill accent ringing"[^>]*data-entity="switch\.collar_dog_buzzer"/);
  clearTimeout(card._ringTimer);
});

test("lost: an is_lost attribute or a lost binary sensor marks an item lost, seen or not", async () => {
  const { card, hass, html } = await mount();
  hass.states["device_tracker.airtag_suitcase"] = { ...hass.states["device_tracker.airtag_suitcase"], attributes: { ...hass.states["device_tracker.airtag_suitcase"].attributes, is_lost: true } };
  card.hass = { ...hass };
  assert.match(html(), /class="sub">Suitcase · marked as lost</);
  assert.match(html(), /Suitcase: marked as lost/);
  assert.match(html(), /tile crit tint/);
  const h2 = makeHass();
  h2.states["binary_sensor.collar_dog_lost"] = { entity_id: "binary_sensor.collar_dog_lost", state: "on", attributes: {}, last_changed: "", last_updated: "" };
  h2.entities["binary_sensor.collar_dog_lost"] = { entity_id: "binary_sensor.collar_dog_lost", device_id: "dev_collar_dog", platform: "tractive", translation_key: "lost" };
  assert.equal(tk.companions(h2, "device_tracker.collar_dog").lost, "binary_sensor.collar_dog_lost");
});

test("Private BLE Device and iBeacon: the estimated distance next to the place", async () => {
  assert.equal(tk.companions(makeHass(), "device_tracker.tag_keys").estimate, "sensor.tag_keys_estimated_distance");
  const { html } = await mount();
  assert.match(html(), /row-state ok">Home · ≈ 3\.2 m</);
  const off = await mount({ show_distance: false });
  assert.doesNotMatch(off.html(), /≈ 3\.2 m/);
});

test("Bermuda: the tracker's area attribute when there is no area sensor", async () => {
  const { card, hass, html } = await mount();
  delete hass.states["sensor.ble_backpack_area"];
  hass.states["device_tracker.ble_backpack"] = { ...hass.states["device_tracker.ble_backpack"], attributes: { ...hass.states["device_tracker.ble_backpack"].attributes, area: "Office" } };
  card.hass = { ...hass };
  assert.match(html(), /row-state ok">Home · Office</);
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
  // The ring button of the first item away that can ring (the dog's buzzer).
  assert.match(html(), /btn round ring"[^>]*data-entity="switch\.collar_dog_buzzer/);
  click(card, { action: "zoom" });
  assert.match(html(), /class="tiles items"/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
});

test("banner: all at home in green, away in blue; night by the sun, the theme or the option; classic header", async () => {
  const home = await mount({}, "home");
  assert.match(home.html(), /class="banner st-ok"/);
  assert.match(home.html(), /type-icon ok/);
  assert.match(home.html(), /class="sub">6 at home</);
  assert.doesNotMatch(home.html(), /class="tk-pin away|class="tk-route"/);
  const away = await mount({ show_battery: false });
  assert.match(away.html(), /class="banner st-active"/);
  assert.match(away.html(), /class="sub">3 at home · 3 away</);
  assert.doesNotMatch(away.html(), /class="tk-batt"/);
  assert.doesNotMatch((await mount()).html(), /class="banner[^"]*night/);
  const sun = makeHass();
  sun.states["sun.sun"] = { entity_id: "sun.sun", state: "below_horizon", attributes: {} };
  assert.match((await mount({}, "default", TrackerCard, { data: sun })).html(), /banner st-warn night/);
  assert.doesNotMatch((await mount({ illustration_theme: "day" }, "default", TrackerCard, { data: sun })).html(), /class="banner[^"]*night/);
  assert.match((await mount({ illustration_theme: "night" })).html(), /banner st-warn night/);
  // Each card has its own ids.
  const a = (await mount()).html().match(/id="(tk-glow-\d+)"/)[1];
  const b = (await mount()).html().match(/id="(tk-glow-\d+)"/)[1];
  assert.notEqual(a, b);
  const classic = await mount({ illustration: false });
  assert.doesNotMatch(classic.html(), /class="banner|tk-scene/);
  assert.match(classic.html(), /class="header"/);
  assert.match(classic.html(), /type-icon warn/);
  const mini = await mount({}, "default", TrackerMiniCard);
  assert.match(mini.html(), /class="banner st-warn"[\s\S]*class="zoom"/);
});

test("mini card: a lost item comes first", async () => {
  const { html } = await mount({ mini_count: 2 }, "lost", TrackerMiniCard);
  const lines = [...html().matchAll(/class="line[^"]*">/g)];
  assert.equal(lines.length, 2);
  assert.match(html(), /line crit">.*Suitcase: not seen for/s);
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
  assert.match(html(), /class="sub">Dog · 18 %</);
  const classic = await mount({ language: "fr", illustration: false });
  assert.match(classic.html(), /3 à la maison · 3 dehors/);
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
    assert.match(form.computeLabel({ name: "illustration_theme" }), /Illustration theme/);
    assert.ok(ed._fields().some((f) => f.name === "illustration_theme"));
    assert.ok(Editor.toggles.some(([n]) => n === "illustration"));
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:tracker-card", show_radar: true, illustration: true, illustration_theme: "auto", battery_threshold: 15, trackers: [] } } });
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

// A device with its entities, for the companions: [entity_id, translation_key, friendly_name, state].
const deviceHass = (devName, list) => {
  const states = {};
  const entities = { "device_tracker.tag": { entity_id: "device_tracker.tag", device_id: "d1", platform: "googlefindmy" } };
  states["device_tracker.tag"] = { entity_id: "device_tracker.tag", state: "home", attributes: {} };
  for (const [id, key, name, state = "unknown"] of list) {
    entities[id] = { entity_id: id, device_id: "d1", translation_key: key, platform: "googlefindmy" };
    states[id] = { entity_id: id, state, attributes: { friendly_name: name } };
  }
  return { states, entities, devices: { d1: { id: "d1", name: devName } } };
};

test("ring button: a word of the button's own name, never the device's name; locate as a fallback, never stop", () => {
  const keyring = deviceHass("Keyring", [
    ["button.keyring_restart", null, "Keyring Restart"],
    ["button.keyring_locate", null, "Keyring Locate"],
  ]);
  assert.equal(tk.companions(keyring, "device_tracker.tag").button, "button.keyring_locate");
  const pairing = deviceHass("Tag", [
    ["button.tag_start_pairing", null, "Tag Start pairing"],
    ["button.tag_locate", null, "Tag Locate"],
  ]);
  assert.equal(tk.companions(pairing, "device_tracker.tag").button, "button.tag_locate");
  const gfm = deviceHass("Wallet", [
    ["button.wallet_stop_sound", "stop_sound", "Wallet Stop sound"],
    ["button.wallet_locate_device", "locate_device", "Wallet Locate device"],
    ["button.wallet_play_sound", "play_sound", "Wallet Play sound"],
  ]);
  assert.equal(tk.companions(gfm, "device_tracker.tag").button, "button.wallet_play_sound");
});

test("lost flag: a lost binary sensor, not a lost connection or signal", () => {
  const conn = deviceHass("Tag", [["binary_sensor.tag_connection_lost", null, "Tag Connection lost", "on"]]);
  assert.equal(tk.companions(conn, "device_tracker.tag").lost, null);
  const lost = deviceHass("Tag", [["binary_sensor.tag_lost", "lost", "Tag Lost", "on"]]);
  assert.equal(tk.companions(lost, "device_tracker.tag").lost, "binary_sensor.tag_lost");
});

test("Tractive buzzer: turned on to ring, turned off when it is already on; the mini bell names its item", async () => {
  const { card, hass, html } = await mount({}, "default", TrackerMiniCard);
  assert.match(html(), /btn round ring"[^>]*title="Ring · Dog"/);
  card._onClick({ composedPath: () => [{ dataset: { action: "ring", entity: "switch.collar_dog_buzzer" } }], stopPropagation() {}, detail: 1 });
  same(hass.calls.at(-1), ["switch", "turn_on", { entity_id: "switch.collar_dog_buzzer" }]);
  clearTimeout(card._ringTimer);
  card._dialogClosedAt = 0;
  hass.states["switch.collar_dog_buzzer"] = { ...hass.states["switch.collar_dog_buzzer"], state: "on" };
  card._onClick({ composedPath: () => [{ dataset: { action: "ring", entity: "switch.collar_dog_buzzer" } }], stopPropagation() {}, detail: 1 });
  same(hass.calls.at(-1), ["switch", "turn_off", { entity_id: "switch.collar_dog_buzzer" }]);
  assert.equal(card._rang, null);
});

test("Tractive: a buzzer already on reads as ringing, and a click stops it", async () => {
  const { card, hass, html } = await mount();
  hass.states["switch.collar_dog_buzzer"] = { ...hass.states["switch.collar_dog_buzzer"], state: "on" };
  card.hass = { ...hass };
  assert.match(html(), /aria-label="Ringing · Dog"/);
  click(card, { action: "ring", entity: "switch.collar_dog_buzzer" });
  same(hass.calls.at(-1), ["switch", "turn_off", { entity_id: "switch.collar_dog_buzzer" }]);
  clearTimeout(card._ringTimer);
});
