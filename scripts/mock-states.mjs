// Mock Home Assistant registries and states for the screenshots and the tests: six tracked items around a home —
// keys with a Tile, a backpack seen by Bermuda in the hallway, a wallet with a Google Find My Device tag (and its play
// sound button), a bike with a PAJ GPS tracker, a dog with a Tractive collar in the park (battery low) and a suitcase
// with an Apple Find My tag far away. Entity ids are neutral on purpose (the cards never rely on them). Every time is
// relative to NOW, a fixed instant, so that the captures never change. `mockData(variant)` returns everything a card
// needs for one capture.
export const NOW = Date.parse("2026-11-16T10:00:00Z");
const iso = (ms) => new Date(ms).toISOString();
const MIN = 6e4;

export const HOME = { latitude: 48.1, longitude: -1.6 };
// A point `km` away from home towards `deg` (clockwise from north).
const at = (km, deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    latitude: +(HOME.latitude + (km * Math.cos(rad)) / 110.57).toFixed(6),
    longitude: +(HOME.longitude + (km * Math.sin(rad)) / (111.32 * Math.cos((HOME.latitude * Math.PI) / 180))).toFixed(6),
  };
};

const base = () => {
  const states = {};
  const entities = {};
  const devices = {};
  const put = (entity_id, state, attributes = {}, reg = {}, updated = NOW - MIN) => {
    states[entity_id] = { entity_id, state, attributes, last_changed: iso(updated), last_updated: iso(updated) };
    entities[entity_id] = { entity_id, device_id: null, platform: null, translation_key: null, ...reg };
  };
  states["zone.home"] = { entity_id: "zone.home", state: "0", attributes: { friendly_name: "Home", ...HOME, radius: 100 }, last_changed: iso(NOW), last_updated: iso(NOW) };
  const item = (key, name, platform, state, attrs, updated) => {
    devices[`dev_${key}`] = { id: `dev_${key}`, name, name_by_user: null, area_id: null };
    put(`device_tracker.${key}`, state, { friendly_name: name, source_type: attrs.latitude ? "gps" : "bluetooth_le", ...attrs }, { platform, device_id: `dev_${key}` }, updated);
  };
  const companion = (id, state, attributes, key, platform, translation_key = null) =>
    put(id, state, attributes, { platform, device_id: `dev_${key}`, translation_key });

  item("tag_keys", "Keys", "tile", "home", { ...at(0.01, 80), gps_accuracy: 12, last_timestamp: iso(NOW - 12 * MIN) }, NOW - 12 * MIN);
  item("ble_backpack", "Backpack", "bermuda", "home", {}, NOW - MIN);
  companion("sensor.ble_backpack_area", "Hallway", { friendly_name: "Backpack Area" }, "ble_backpack", "bermuda", "area");
  item("fmd_wallet", "Wallet", "googlefindmy", "home", { ...at(0.02, 200), gps_accuracy: 20 }, NOW - 20 * MIN);
  companion("button.fmd_wallet_play_sound", "unknown", { friendly_name: "Wallet Play sound" }, "fmd_wallet", "googlefindmy", "play_sound");
  item("gps_bike", "Bike", "paj_gps", "not_home", { ...at(1.8, 40), gps_accuracy: 8 }, NOW - 4 * MIN);
  companion("sensor.gps_bike_battery", "64", { friendly_name: "Bike Battery", device_class: "battery", unit_of_measurement: "%" }, "gps_bike", "paj_gps");
  item("collar_dog", "Dog", "tractive", "Park", { ...at(0.6, 225), gps_accuracy: 5 }, NOW - 2 * MIN);
  companion("sensor.collar_dog_battery", "18", { friendly_name: "Dog Battery", device_class: "battery", unit_of_measurement: "%" }, "collar_dog", "tractive");
  item("airtag_suitcase", "Suitcase", "findmy", "not_home", { ...at(230, 70), gps_accuracy: 30 }, NOW - 180 * MIN);
  companion("button.airtag_suitcase_play_sound", "unknown", { friendly_name: "Suitcase Play sound" }, "airtag_suitcase", "findmy", "play_sound");
  // Not a tracked item: a phone of the Mobile App.
  put("device_tracker.phone", "home", { friendly_name: "Phone", ...HOME }, { platform: "mobile_app" });
  return { states, entities, devices, areas: {}, api: {}, ws: {}, subs: {} };
};

// The variants of the captures:
//   default — as above
//   lost    — the suitcase has not been seen for two days
export const mockData = (variant = "default") => {
  const d = base();
  if (variant === "lost") {
    const s = d.states["device_tracker.airtag_suitcase"];
    s.last_updated = s.last_changed = iso(NOW - 2 * 24 * 60 * MIN);
  }
  return d;
};
