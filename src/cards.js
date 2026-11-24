// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { RADAR, RING_MS, iconFor } from "./core.js";
import { ICONS, clamp, domainOf, esc, fmtNum, fmtRelative, fmtSpan, intlFmt, moreInfo, num, parseTime, svgIcon, valid } from "./helpers.js";
import { BASE_STYLE, MINI_STYLE } from "./styles.js";
import { CardBase, withMini } from "./card-base.js";
import { bearing, distanceKm, niceRange, placeOf, resolve, ringer } from "./discovery.js";
import { TRACKER_STYLE } from "./styles-2.js";
import { BANNER_STYLE, MAP_HOME, isNight, trackerScene } from "./illustrated-header.js";

export let trackerUid = 0;

export class TrackerCard extends CardBase {
  constructor() {
    super();
    this._uid = ++trackerUid;
  }

  static getConfigElement() {
    return document.createElement("tracker-card-editor");
  }

  getCardSize() {
    return 7;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return ["zone.home", ...m.items.flatMap((it) => [it.entity, it.battery, it.area, it.seen, it.estimate, it.lost, it.button, it.buzzer].filter(Boolean))];
  }

  _extraDeps() {
    return [this._rang?.at, this._hass?.config?.unit_system?.length];
  }

  _emptyKey(m) {
    return m.items.length ? null : "no_data";
  }

  _home() {
    const a = this._s("zone.home")?.attributes || {};
    const lat = Number(a.latitude ?? this._hass.config?.latitude);
    const lon = Number(a.longitude ?? this._hass.config?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, radius: Number(a.radius) || 100 } : null;
  }

  // What the card shows of an item: { place, zone, area, km, angle, seen, lost, battery, low }.
  _info(it, home) {
    const s = this._s(it.entity);
    const a = s?.attributes || {};
    let place = placeOf(s);
    const lat = Number(a.latitude);
    const lon = Number(a.longitude);
    const has = a.latitude !== undefined && a.longitude !== undefined && Number.isFinite(lat) && Number.isFinite(lon);
    let km = null;
    let angle = null;
    if (has && home) {
      km = distanceKm(home.lat, home.lon, lat, lon);
      angle = bearing(home.lat, home.lon, lat, lon);
      if (place === "unknown" && km * 1000 <= home.radius) place = "home";
    }
    if (place === "home") km = has && home ? km : 0;
    const areaState = it.area ? this._s(it.area) : null;
    const rawArea = areaState && valid(areaState) ? areaState.state : typeof a.area === "string" ? a.area : null;
    const area = rawArea && !["not_home", "away", "unknown", ""].includes(String(rawArea).toLowerCase()) ? rawArea : null;
    const seenState = it.seen ? this._s(it.seen) : null;
    const seen = parseTime(seenState?.state) ?? parseTime(a.last_seen) ?? parseTime(a.last_timestamp) ?? parseTime(a.last_update) ?? parseTime(s?.last_updated);
    const lostAfter = Number(this._config.lost_after ?? 24) * 3.6e6;
    const unseen = lostAfter > 0 && seen !== null && Date.now() - seen > lostAfter;
    // Marked as lost by the integration: an `is_lost` attribute or a "lost" binary sensor of the device.
    const flagged = a.is_lost === true || (it.lost ? this._s(it.lost)?.state === "on" : false);
    const lost = unseen || flagged;
    const es = it.estimate ? this._s(it.estimate) : null;
    const estimate = es && Number.isFinite(num(es)) ? { v: num(es), unit: es.attributes?.unit_of_measurement || "m" } : null;
    const bs = it.battery ? this._s(it.battery) : null;
    let battery = null;
    let low = false;
    if (bs && domainOf(it.battery) === "binary_sensor") low = bs.state === "on";
    else {
      battery = bs ? num(bs) : Number.isFinite(Number(a.battery_level ?? a.battery)) ? Number(a.battery_level ?? a.battery) : null;
      low = battery !== null && battery <= Number(this._config.battery_threshold ?? 20);
    }
    return { place, zone: place === "zone" ? s.state : null, area, km, angle, seen, lost, flagged: flagged && !unseen, estimate, battery, low };
  }

  _summary(m) {
    const home = this._home();
    const rows = m.items.map((it) => ({ it, ...this._info(it, home) }));
    const athome = rows.filter((r) => r.place === "home");
    const away = rows.filter((r) => r.place === "away" || r.place === "zone");
    const lost = rows.filter((r) => r.lost);
    const low = rows.filter((r) => r.low);
    const parts = [];
    if (athome.length) parts.push(this._t("sum_home", { n: athome.length }));
    if (away.length) parts.push(this._t("sum_away", { n: away.length }));
    let chip = null;
    if (lost.length) chip = { cls: "crit", text: this._t("not_seen"), entity: lost[0].it.entity };
    else if (low.length && this._config.show_battery !== false) chip = { cls: "warn", text: this._t("low_battery"), entity: low[0].it.battery || low[0].it.entity };
    return { home, rows, lost, low, chip, sub: parts.join(" · ") };
  }

  // "350 m", "1.8 km", "230 km" (miles and feet when Home Assistant uses them).
  _dist(km) {
    const locale = this._locale();
    const imperial = this._hass.config?.unit_system?.length === "mi";
    const u = (v, unit, digits = 0) => intlFmt(Intl.NumberFormat, locale, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: digits }).format(v);
    if (imperial) {
      const mi = km / 1.609344;
      return mi < 0.1 ? u(Math.round((mi * 5280) / 10) * 10, "foot") : u(mi, "mile", mi < 10 ? 1 : 0);
    }
    if (km < 1) return u(Math.round((km * 1000) / 10) * 10, "meter");
    return u(km, "kilometer", km < 10 ? 1 : 0);
  }

  _placeText(r) {
    const where = r.place === "home" ? this._t("home") : r.place === "zone" ? r.zone : r.place === "away" ? this._t("away") : this._t("unknown");
    return r.area && r.area !== where ? `${where} · ${r.area}` : where;
  }

  _icon(it) {
    const icon = it.icon || this._s(it.entity)?.attributes?.icon;
    if (icon && !/^mdi:(map-marker|account|cellphone-marker|tag)/.test(icon)) return `<ha-icon icon="${esc(icon)}"></ha-icon>`;
    return svgIcon(ICONS[iconFor(it.name)]);
  }

  // The radar: home in the middle, each item at its bearing and at a distance on a log scale (near items apart, far ones still in), the items at home round
  // the house. Small, as the card's illustration: the icons of the items in the full card, plain dots on the mini card.
  _radar(sum, mini = false) {
    const c = RADAR / 2;
    const R = c - 10;
    const R0 = R * 0.36;
    const far = sum.rows.filter((r) => r.place !== "home" && r.km !== null && r.angle !== null);
    const max = Number(this._config.radar_range) || niceRange(Math.max(0.5, ...far.map((r) => r.km)));
    const unit = 0.05;
    const scale = (km) => R0 + (R - R0) * clamp(Math.log1p(km / unit) / Math.log1p(max / unit), 0, 1);
    const parts = [`<circle class="disc" cx="${c}" cy="${c}" r="${R}"/>`];
    for (const d of [max / 100, max / 10]) {
      const r = scale(d);
      if (d >= 0.1 && r < R - 0.5) parts.push(`<circle class="ringl" cx="${c}" cy="${c}" r="${r.toFixed(1)}"/>`);
    }
    parts.push(`<circle class="homezone" cx="${c}" cy="${c}" r="${R0}"/><circle class="homedot" cx="${c}" cy="${c}" r="12"/>`);
    parts.push(`<path class="homeicon" transform="translate(${c - 8} ${c - 8}) scale(.667)" d="${ICONS.home}"/>`);
    const homes = sum.rows.filter((r) => r.place === "home");
    const blips = [];
    // Round the house, evenly spread (one alone on its right).
    homes.forEach((r, i) => {
      const a = (i / homes.length) * 2 * Math.PI + Math.PI / 2;
      blips.push({ r, x: c + R0 * 0.98 * Math.sin(a), y: c - R0 * 0.98 * Math.cos(a) });
    });
    for (const r of far) {
      const d = scale(r.km);
      blips.push({ r, x: c + d * Math.sin(r.angle), y: c - d * Math.cos(r.angle) });
    }
    // Smaller dots on the mini radar; a dot that would cover another one is moved out along its bearing, and every dot stays inside the disc.
    const br = mini ? 11 : 14;
    const placed = [];
    for (const b of blips) {
      const dx = b.x - c;
      const dy = b.y - c;
      let d = Math.hypot(dx, dy);
      const ux = d ? dx / d : 1;
      const uy = d ? dy / d : 0;
      for (let k = 0; k < 8 && placed.some((p) => Math.hypot(p.x - b.x, p.y - b.y) < br * 2); k++) {
        d += br;
        b.x = c + ux * d;
        b.y = c + uy * d;
      }
      const lim = R - br;
      if (d > lim) {
        b.x = c + ux * lim;
        b.y = c + uy * lim;
      }
      placed.push(b);
    }
    for (const { r, x, y } of blips) {
      const label = `${r.it.name} · ${this._placeText(r)}${r.km ? ` · ${this._dist(r.km)}` : ""}`;
      const s = 20 / 24;
      parts.push(`<g class="blip${r.lost ? " lost" : ""}" style="--c: ${esc(r.it.tint)}" role="button" tabindex="0" data-entity="${esc(r.it.entity)}" aria-label="${esc(label)}">
        <title>${esc(label)}</title><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${br}"/>${
          mini ? "" : `<path transform="translate(${(x - 10).toFixed(2)} ${(y - 10).toFixed(2)}) scale(${s.toFixed(3)})" d="${ICONS[iconFor(r.it.name)]}"/>`
        }</g>`);
    }
    return `<div class="radar"><svg viewBox="0 0 ${RADAR} ${RADAR}" role="img" aria-label="${esc(this._t("radar"))}">${parts.join("")}</svg><div class="sweep" aria-hidden="true"></div></div>`;
  }

  _ringing(it) {
    return this._rang?.id === ringer(it) && Date.now() - this._rang.at < RING_MS;
  }

  // The state of an item: lost (not seen) first, then a low battery, away, at home.
  _state(r) {
    if (r.lost) return "crit";
    if (r.low && this._config.show_battery !== false) return "warn";
    return r.place === "home" ? "ok" : "active";
  }

  _ringBtn(it, round = false) {
    const id = ringer(it);
    if (!id) return "";
    // A buzzer already on (from the app, or left on) is ringing: a click stops it.
    const ringing = this._ringing(it) || (id === it.buzzer && this._s(id)?.state === "on");
    const label = `${this._t(ringing ? "ringing" : "ring_it")} · ${it.name}`;
    const off = this._s(id)?.state === "unavailable" ? " disabled" : "";
    return round
      ? `<button class="btn round ring${ringing ? " ringing active" : ""}" data-action="ring" data-entity="${esc(id)}" title="${esc(label)}" aria-label="${esc(label)}"${off}>${svgIcon(ICONS.bell)}</button>`
      : `<button class="pill accent${ringing ? " ringing" : ""}" data-action="ring" data-entity="${esc(id)}" aria-label="${esc(label)}"${off}>${svgIcon(ICONS.bell)}${esc(this._t(ringing ? "ringing" : "ring_it"))}</button>`;
  }

  // An item as a tile: grey at home, tinted when away (blue), with a low battery (amber) or not seen (red); its last seen, battery and ring button below.
  _tile(r) {
    const c = this._config;
    const it = r.it;
    const st = this._state(r);
    const where = [this._placeText(r)];
    if (c.show_distance !== false && r.km !== null && r.place !== "home") where.push(this._dist(r.km));
    else if (c.show_distance !== false && r.estimate) where.push(`≈ ${fmtNum(r.estimate.v, r.estimate.v < 10 ? 1 : 0, this._locale())} ${r.estimate.unit}`);
    const pills = [];
    if (c.show_seen !== false && (r.seen !== null || r.flagged)) {
      pills.push(
        r.lost
          ? `<span class="pill crit">${svgIcon(ICONS.signal_off)}${esc(r.flagged ? this._t("marked_lost") : fmtSpan(this._hass, c, Date.now() - r.seen))}</span>`
          : `<span class="pill idle" title="${esc(this._t("seen", { when: fmtRelative(this._hass, c, r.seen) }))}">${svgIcon(ICONS.clock)}${esc(fmtRelative(this._hass, c, r.seen))}</span>`,
      );
    }
    if (c.show_battery !== false && (r.battery !== null || r.low)) {
      pills.push(
        `<span class="pill ${r.low ? "warn" : "ok"}" title="${esc(this._t("battery"))}">${svgIcon(r.low ? ICONS.battery_low : ICONS.battery)}${r.battery !== null ? `<span class="num">${esc(fmtNum(r.battery, 0, this._locale()))} %</span>` : ""}</span>`,
      );
    }
    const bell = this._ringBtn(it);
    if (bell) pills.push(bell);
    const tint = st !== "ok";
    return `<div class="tile ${st}${tint ? " tint" : ""}">
      <div class="tile-head" role="button" tabindex="0" data-entity="${esc(it.entity)}">
        <div class="row-icon${r.lost ? " idle" : ""}" style="--c: ${esc(it.tint)}">${this._icon(it)}${r.place === "home" ? `<span class="badge ok" style="--b: var(--tk-ok)">${svgIcon(ICONS.home)}</span>` : ""}</div>
        <div class="row-text"><div class="row-name">${esc(it.name)}</div><div class="row-state ${st}">${esc(where.join(" · "))}</div></div>
      </div>
      ${pills.length ? `<div class="badges">${pills.join("")}</div>` : ""}
    </div>`;
  }

  // The lines next to the radar: those away (and the farthest), the items not seen or with a low battery, when they were all last seen.
  _lines(sum, max = 3) {
    const c = this._config;
    const out = [];
    const away = sum.rows.filter((r) => r.place !== "home");
    const far = away.filter((r) => r.km !== null).sort((a, b) => b.km - a.km)[0];
    if (away.length) {
      const text = far && c.show_distance !== false ? `${this._t("sum_away", { n: away.length })} · ${this._t("farthest", { name: far.it.name, dist: this._dist(far.km) })}` : this._t("sum_away", { n: away.length });
      out.push(`<div class="line active">${svgIcon(ICONS.tracker)}<span>${esc(text)}</span></div>`);
    }
    for (const r of sum.lost) {
      const why = r.flagged ? this._t("marked_lost_inline") : this._t("lost_inline", { span: fmtSpan(this._hass, c, Date.now() - r.seen) });
      out.push(`<div class="line crit">${svgIcon(ICONS.signal_off)}<span>${esc(`${r.it.name}: ${why}`)}</span></div>`);
    }
    if (c.show_battery !== false) {
      for (const r of sum.low.filter((x) => !x.lost))
        out.push(`<div class="line warn">${svgIcon(ICONS.battery_low)}<span>${esc(`${r.it.name}: ${r.battery !== null ? this._t("battery_inline", { pct: `${fmtNum(r.battery, 0, this._locale())} %` }) : this._t("low_battery_inline")}`)}</span></div>`);
    }
    const seen = sum.rows.map((r) => r.seen).filter((x) => x !== null);
    if (!sum.lost.length && seen.length && c.show_seen !== false) {
      out.push(`<div class="line">${svgIcon(ICONS.clock)}<span>${esc(this._t("all_seen", { span: fmtSpan(this._hass, c, Date.now() - Math.min(...seen)) }))}</span></div>`);
    }
    return out.slice(0, max).join("");
  }

  _hero(sum, mini = false) {
    const home = sum.rows.filter((r) => r.place === "home").length;
    const art = this._config.show_radar !== false && sum.home ? `<div class="hero-art">${this._radar(sum, mini)}</div>` : "";
    const big = `<div class="big ok">${svgIcon(ICONS.home)}<b>${home}</b><span>${esc(this._t("at_home"))}</span></div>`;
    return `<div class="hero">${art}<div class="hero-body">${big}${this._lines(sum, mini ? clamp(Number(this._config.mini_count ?? 3), 1, 6) : 3)}</div>${mini ? this._miniRing(sum) : ""}</div>`;
  }

  // The state of the whole: an item not seen (red), a low battery (amber), items away (blue), all at home (green).
  _overall(sum) {
    if (sum.lost.length) return "crit";
    if (sum.low.length && this._config.show_battery !== false) return "warn";
    return sum.rows.some((r) => r.place !== "home") ? "active" : "ok";
  }

  // The header: the illustrated banner, or the classic header (`illustration: false`). Both have the same status pill
  // on the title row, in the icon's colour.
  _head(sum, sub) {
    const c = this._config;
    const st = this._overall(sum);
    const title = c.title || this._t("tracked");
    const titles = (icon, text) =>
      `<div class="type-icon ${st}">${svgIcon(icon)}</div><div class="titles"><div class="tstack"><div class="trow"><div class="name">${esc(title)}</div>${this._pill(sum, st)}</div>${
        text ? `<div class="sub" title="${esc(text)}">${esc(text)}</div>` : ""
      }</div></div>`;
    // The classic subtitle: where the items are, without the count of those away when the pill says it.
    if (c.illustration === false) return `<div class="header">${titles(ICONS.tracker, sub && st === "active" ? this._bannerSub(sum, st) : sub)}${this._zoomButton()}</div>`;
    const night = isNight(this._hass, c);
    return `<div class="banner st-${st}${night ? " night" : ""}">${this._scene(sum, st)}<div class="ground g-map"></div>
      <div class="htext">${titles(ICONS.home, sub !== false && this._bannerSub(sum, st))}</div>${this._zoomButton()}</div>`;
  }

  // The status pill, in the icon's colour: not seen, low battery, how many are away, or all at home.
  _pill(sum, st) {
    const away = sum.rows.filter((r) => r.place !== "home").length;
    const label = sum.chip?.text || (st === "active" ? this._t("sum_away", { n: away }) : this._t("home"));
    const entity = sum.chip?.entity;
    return `<span class="chip ${st}${entity ? " clickable" : ""}"${moreInfo(entity)} title="${esc(label)}" aria-label="${esc(label)}"><span class="dot"></span><span class="chip-text">${esc(label)}</span></span>`;
  }

  // The banner's subtitle: the item that needs a look (not seen, low battery), else where the items are.
  _bannerSub(sum, st) {
    const c = this._config;
    if (st === "crit") {
      const r = sum.lost[0];
      return `${r.it.name} · ${r.flagged ? this._t("marked_lost_inline") : fmtSpan(this._hass, c, Date.now() - r.seen)}`;
    }
    if (st === "warn") {
      const r = sum.low[0];
      return `${r.it.name} · ${r.battery !== null ? `${fmtNum(r.battery, 0, this._locale())} %` : this._t("low_battery_inline")}`;
    }
    // Items away: the pill counts them, the subtitle those at home.
    const home = sum.rows.filter((r) => r.place === "home").length;
    return st === "active" ? (home ? this._t("sum_home", { n: home }) : "") : sum.sub;
  }

  // The map of the banner: home at the radar's centre, the items at home round it, those away at their bearing and
  // at a distance on a log scale, kept on the map.
  _scene(sum, st) {
    const [hx, hy] = MAP_HOME;
    const homes = sum.rows.filter((r) => r.place === "home");
    const far = sum.rows.filter((r) => r.place !== "home");
    const max = Number(this._config.radar_range) || niceRange(Math.max(0.5, ...far.map((r) => r.km ?? 0)));
    const lowOn = this._config.show_battery !== false;
    const pins = [];
    homes.forEach((r, i) => {
      const a = (i / homes.length) * 2 * Math.PI + Math.PI / 2;
      pins.push({ r, x: hx + 19 * Math.sin(a), y: hy + 5 - 11 * Math.cos(a) });
    });
    far.forEach((r, i) => {
      // Without a position: spread round home on the radar's outer ring.
      const angle = r.angle ?? (i / Math.max(1, far.length)) * 2 * Math.PI + 0.6;
      const k = r.km !== null ? clamp(Math.log1p(r.km / 0.05) / Math.log1p(max / 0.05), 0, 1) : 0.6;
      const d = 22 + 40 * k;
      pins.push({ r, x: clamp(hx + d * 1.4 * Math.sin(angle), 46, 172), y: clamp(hy - d * 0.7 * Math.cos(angle), 20, 74) });
    });
    const list = pins.map(({ r, x, y }) => ({ x, y, tint: r.it.tint, away: r.place !== "home", low: lowOn && r.low, lost: r.lost }));
    // Drawn back to front: those lower on the map over those above.
    list.sort((a, b) => a.y - b.y);
    const farthest = pins.filter((p) => p.r.place !== "home" && p.r.km !== null).sort((a, b) => b.r.km - a.r.km)[0];
    return trackerScene({ uid: this._uid, state: st, pins: list, far: farthest });
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const parts = [this._hero(sum)];
    if (this._config.show_items !== false) parts.push(this._section("items", ICONS.list, this._t("items"), sum.rows.length, `<div class="tiles items">${sum.rows.map((r) => this._tile(r)).join("")}</div>`));
    return `<style>${BASE_STYLE}${TRACKER_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, sum.sub)}
        <div class="content">${parts.join("")}</div>
      </ha-card>`;
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  _onDisconnect() {
    clearTimeout(this._ringTimer);
  }

  _action(action, el) {
    if (action !== "ring") return false;
    const id = el.dataset.entity;
    // A button is pressed (play sound…), a buzzer switch turned on (Tractive).
    const domain = domainOf(id);
    // A buzzer already on is turned off (stopped), without the ringing bell.
    if (domain === "switch" && this._s(id)?.state === "on") {
      this._call("switch", "turn_off", { entity_id: id });
      this._rang = null;
      this._update();
      return true;
    }
    if (domain === "switch") this._call("switch", "turn_on", { entity_id: id });
    else this._call(domain === "input_button" ? "input_button" : "button", "press", { entity_id: id });
    this._rang = { id, at: Date.now() };
    // Drawn again once the bell stops.
    clearTimeout(this._ringTimer);
    this._ringTimer = setTimeout(() => {
      this._lastDeps = null;
      this._update();
    }, RING_MS + 50);
    this._update();
    return true;
  }
}

export class TrackerMiniCard extends withMini(TrackerCard) {
  static getConfigElement() {
    return document.createElement("tracker-mini-card-editor");
  }

  // The mini card's round ring button: the first item not seen, else away, else at home, that can ring.
  _miniRing(sum) {
    const rank = (r) => (r.lost ? 0 : r.place === "home" ? 2 : 1);
    const r = [...sum.rows].filter((x) => ringer(x.it)).sort((a, b) => rank(a) - rank(b))[0];
    return r ? this._ringBtn(r.it, true) : "";
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    return `<style>${BASE_STYLE}${TRACKER_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(sum, this._config.illustration === false ? "" : undefined)}
        <div class="content mini">${this._hero(sum, true)}</div>
      </ha-card>`;
  }
}
