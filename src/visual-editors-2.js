// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------
import { VERSION } from "./core.js";
import { asList, t } from "./helpers.js";
import { EditorBase } from "./visual-editors.js";
import { register } from "./register.js";
import { TrackerCard, TrackerMiniCard } from "./cards.js";

export class TrackerCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_radar", true],
      ["show_items", true],
      ["show_distance", true],
      ["show_battery", true],
      ["show_seen", true],
    ];
  }

  static get sections() {
    return ["items"];
  }

  // `trackers` written with objects ({ entity, name, icon… }) is YAML-only: the entity picker would show them blank
  // and rewrite them as plain entity ids.
  _yamlTrackers() {
    return asList(this._config?.trackers).some((x) => typeof x !== "string");
  }

  _schemaKey() {
    return this._yamlTrackers() ? "yaml" : "";
  }

  _fields() {
    return [
      ...(this._yamlTrackers() ? [] : [{ name: "trackers", selector: { entity: { multiple: true, domain: "device_tracker" } } }]),
      { name: "battery_threshold", selector: { number: { min: 0, max: 100, step: 5, mode: "box", unit_of_measurement: "%" } } },
      { name: "lost_after", selector: { number: { min: 0, max: 720, mode: "box", unit_of_measurement: "h" } } },
      { name: "radar_range", selector: { number: { min: 0.5, max: 20000, step: 0.5, mode: "box", unit_of_measurement: "km" } } },
      {
        name: "illustration_theme",
        selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: t(this._hass, this._config, `theme_${value}`) })) } },
      },
    ];
  }

  static get defaults() {
    return { illustration_theme: "auto" };
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus its own.
export class TrackerMiniCardEditor extends TrackerCardEditor {
  static get toggles() {
    return [...TrackerCardEditor.toggles, ["zoom", true]];
  }

  _fields() {
    return [...super._fields(), { name: "mini_count", selector: { number: { min: 1, max: 6, mode: "box" } } }];
  }
}

register(
  [
    ["tracker-card", TrackerCard, { name: "Tracker Card", description: "Tags, collars and GPS trackers on a radar around home, with place, last seen, battery, distance and a ring button." }],
    ["tracker-mini-card", TrackerMiniCard, { name: "Tracker Mini Card", description: "Compact tracked items: a small radar and where the first items are." }],
    ["tracker-card-editor", TrackerCardEditor],
    ["tracker-mini-card-editor", TrackerMiniCardEditor],
  ],
  "https://github.com/juju35/ha-tracker-card",
);

console.info(`%c TRACKER-CARD %c v${VERSION} `, "color: white; background: #3949ab; font-weight: 700;", "color: #3949ab; background: white; font-weight: 700;");
