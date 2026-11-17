/*
 * Tracker Card for Home Assistant
 * https://github.com/juju35/ha-tracker-card
 *
 * Lovelace cards for the things you track: keys, bags, bikes, suitcases and pets with Bluetooth or GPS tags (Tile,
 * Bermuda, iBeacon, Private BLE Device, Google Find My Device, Apple Find My, SmartThings Find, Tractive, PAJ GPS,
 * Traccar…), on a radar around home, with where each one is, when it was last seen, its battery, its distance and a
 * button to ring it. The trackers, their batteries, their Bermuda area and their ring buttons are found through the
 * entity and device registries.
 */

const VERSION = "__VERSION__";

const CARD_ICONS = {
  tracker:
    "M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19C12,19 6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M20,19C20,21.21 16.42,23 12,23C7.58,23 4,21.21 4,19C4,17.71 5.22,16.56 7.11,15.83L7.75,16.74C6.67,17.19 6,17.81 6,18.5C6,19.88 8.69,21 12,21C15.31,21 18,19.88 18,18.5C18,17.81 17.33,17.19 16.25,16.74L16.89,15.83C18.78,16.56 20,17.71 20,19Z",
  tag: "M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.44 21.77,11.94 21.41,11.58Z",
  key: "M7,14A2,2 0 0,1 5,12A2,2 0 0,1 7,10A2,2 0 0,1 9,12A2,2 0 0,1 7,14M12.65,10C11.83,7.67 9.61,6 7,6A6,6 0 0,0 1,12A6,6 0 0,0 7,18C9.61,18 11.83,16.33 12.65,14H17V18H21V14H23V10H12.65Z",
  bag: "M14,6H10V4H14M20,6H16V4L14,2H10L8,4V6H4C2.89,6 2,6.89 2,8V19A2,2 0 0,0 4,21H20A2,2 0 0,0 22,19V8C22,6.89 21.1,6 20,6Z",
  suitcase: "M17,6H16V3A1,1 0 0,0 15,2H9A1,1 0 0,0 8,3V6H7A2,2 0 0,0 5,8V19A2,2 0 0,0 7,21A1,1 0 0,0 8,22A1,1 0 0,0 9,21H15A1,1 0 0,0 16,22A1,1 0 0,0 17,21A2,2 0 0,0 19,19V8A2,2 0 0,0 17,6M9.5,18H8V9H9.5V18M12.75,18H11.25V9H12.75V18M16,18H14.5V9H16V18M14.5,6H9.5V3.5H14.5V6Z",
  bike: "M5,20.5A3.5,3.5 0 0,1 1.5,17A3.5,3.5 0 0,1 5,13.5A3.5,3.5 0 0,1 8.5,17A3.5,3.5 0 0,1 5,20.5M5,12A5,5 0 0,0 0,17A5,5 0 0,0 5,22A5,5 0 0,0 10,17A5,5 0 0,0 5,12M14.8,10H19V8.2H15.8L13.86,4.93C13.57,4.43 13,4.1 12.4,4.1C11.93,4.1 11.5,4.29 11.2,4.6L7.5,8.29C7.19,8.6 7,9 7,9.5C7,10.13 7.33,10.66 7.85,10.97L11.2,13V18H13V11.5L10.75,9.85L13.07,7.5M19,20.5A3.5,3.5 0 0,1 15.5,17A3.5,3.5 0 0,1 19,13.5A3.5,3.5 0 0,1 22.5,17A3.5,3.5 0 0,1 19,20.5M19,12A5,5 0 0,0 14,17A5,5 0 0,0 19,22A5,5 0 0,0 24,17A5,5 0 0,0 19,12M16,4.8C17,4.8 17.8,4 17.8,3C17.8,2 17,1.2 16,1.2C15,1.2 14.2,2 14.2,3C14.2,4 15,4.8 16,4.8Z",
  paw: "M8.35,3C9.53,2.83 10.78,4.12 11.14,5.9C11.5,7.67 10.85,9.25 9.67,9.43C8.5,9.61 7.24,8.32 6.87,6.54C6.5,4.77 7.17,3.19 8.35,3M15.5,3C16.69,3.19 17.35,4.77 17,6.54C16.62,8.32 15.37,9.61 14.19,9.43C13,9.25 12.35,7.67 12.72,5.9C13.08,4.12 14.33,2.83 15.5,3M3,7.6C4.14,7.11 5.69,8 6.5,9.55C7.26,11.13 7,12.79 5.87,13.28C4.74,13.77 3.2,12.89 2.41,11.32C1.62,9.75 1.9,8.08 3,7.6M21,7.6C22.1,8.08 22.38,9.75 21.59,11.32C20.8,12.89 19.26,13.77 18.13,13.28C17,12.79 16.74,11.13 17.5,9.55C18.31,8 19.86,7.11 21,7.6M19.33,18.38C19.37,19.32 18.65,20.36 17.79,20.75C16,21.57 13.88,19.87 11.89,19.87C9.9,19.87 7.76,21.64 6,20.75C5,20.26 4.31,18.96 4.44,17.88C4.62,16.39 6.41,15.59 7.47,14.5C8.88,13.09 9.88,10.44 11.89,10.44C13.89,10.44 14.95,13.05 16.3,14.5C17.41,15.72 19.26,16.75 19.33,18.38Z",
  car: "M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z",
  wallet: "M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H12C10.89,6 10,6.9 10,8V16A2,2 0 0,0 12,18M12,16H22V8H12M16,13.5A1.5,1.5 0 0,1 14.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,12A1.5,1.5 0 0,1 16,13.5Z",
  phone: "M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z",
  headphones: "M12,1C7,1 3,5 3,10V17A3,3 0 0,0 6,20H9V12H5V10A7,7 0 0,1 12,3A7,7 0 0,1 19,10V12H15V20H18A3,3 0 0,0 21,17V10C21,5 16.97,1 12,1Z",
  umbrella: "M12,2A9,9 0 0,1 21,11H13V19A3,3 0 0,1 10,22A3,3 0 0,1 7,19V18H9V19A1,1 0 0,0 10,20A1,1 0 0,0 11,19V11H3A9,9 0 0,1 12,2Z",
  laptop: "M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z",
  home: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
  clock: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
  bell: "M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21",
  battery_low: "M16,20H8V6H16M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4M15,16H9V19H15V16Z",
  battery: "M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.67C6,21.4 6.6,22 7.33,22H16.67A1.33,1.33 0 0,0 18,20.67V5.33C18,4.6 17.4,4 16.67,4Z",
  list: "M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z",
  signal_off: "M2.28,3L1,4.27L4.47,7.74C3.55,9 3,10.45 3,12C3,14.47 4.33,16.66 6.36,18.09L7.8,16.65C6.12,15.55 5,13.92 5,12C5,10.93 5.35,9.93 5.94,9.07L8.09,11.22C8.03,11.47 8,11.73 8,12C8,13.29 8.73,14.42 9.85,15L11.38,13.47C10.57,13.2 10,12.66 10,12L10,11.86L20.73,22.59L22,21.32M18.06,16.86L19.48,18.28C20.43,17.06 21,15.6 21,14C21,10.97 19.21,8.38 16.62,7.18L15.17,8.63C17.4,9.54 19,11.63 19,14C19,15.07 18.65,16.07 18.06,16.86Z",
};

// Integrations whose device trackers are tracked items (tags, pet collars, GPS trackers), found on their own.
const TRACKER_PLATFORMS = [
  "tile",
  "bermuda",
  "private_ble_device",
  "ibeacon",
  "googlefindmy",
  "smartthings_find",
  "findmy",
  "icloud",
  "tractive",
  "fressnapf_tracker",
  "paj_gps",
  "traccar_server",
];

// An icon for an item from its name, in English or French (and a few other languages); the tag otherwise.
const KEYWORDS = [
  [/key|cl[eé]s?\b|cl[eé]|schl[uü]ssel|llave|chiav/i, "key"],
  [/suitcase|valise|luggage|bagage|koffer|maleta/i, "suitcase"],
  [/bag|sac|backpack|cartable|rucksack|mochila|zaino/i, "bag"],
  [/bike|v[eé]lo|bicycle|fahrrad|bici|scooter|trottinette/i, "bike"],
  [/dog|chien|cat\b|chat\b|pet|collar|collier|hund|katze|perro|gato|cane/i, "paw"],
  [/car\b|voiture|auto\b|coche/i, "car"],
  [/wallet|portefeuille|purse|porte-monnaie|geldb[oö]rse|cartera/i, "wallet"],
  [/phone|t[eé]l[eé]phone|iphone|pixel|handy|m[oó]vil/i, "phone"],
  [/airpods|buds|headphone|casque|[eé]couteur|kopfh[oö]rer/i, "headphones"],
  [/umbrella|parapluie|regenschirm|paraguas/i, "umbrella"],
  [/laptop|ordinateur|macbook|computer/i, "laptop"],
];
const iconFor = (name) => (KEYWORDS.find(([re]) => re.test(name || "")) || [null, "tag"])[1];
// The colors of the items on the radar and in the list, in turn.
const TINTS = ["#3949ab", "#00897b", "#f4511e", "#8e24aa", "#c0ca33", "#1e88e5", "#d81b60", "#6d4c41"];
// The radar's size in the full card (viewBox units) and how long its sweep takes to turn.
const RADAR = 200;
const SWEEP_MS = 4000;
// How long the ring button shows that it rings.
const RING_MS = 3000;

const STRINGS = {
  en: {
    tracked: "Tracked items",
    home: "Home",
    away: "Away",
    unknown: "Unknown",
    sum_home: "{n} at home",
    sum_away: "{n} away",
    seen: "Seen {when}",
    lost: "Not seen for {span}",
    not_seen: "Not seen",
    low_battery: "Low battery",
    battery: "Battery",
    ring_it: "Ring",
    ringing: "Ringing",
    radar: "Radar",
    items: "Items",
    no_data: "Nothing to show: no tracked item found.",
    trackers: "Trackers (empty: the tags, collars and GPS trackers found)",
    battery_threshold: "Low battery at or below (%)",
    lost_after: "Not seen after (hours; 0: never)",
    radar_range: "Radar range (km; empty: automatic)",
    show_radar: "Show the radar",
    show_items: "Show the items",
    show_distance: "Show the distances",
    show_battery: "Show the batteries",
    show_seen: "Show when last seen",
    mini_count: "Lines on the mini card",
    at_home: "at home",
    farthest: "farthest {name} {dist}",
    all_seen: "All seen in the last {span}",
    marked_lost: "Marked as lost",
    lost_inline: "not seen for {span}",
    marked_lost_inline: "marked as lost",
    battery_inline: "battery {pct}",
    low_battery_inline: "low battery",
    cancel: "Cancel",
    left: "{time} left",
    today_at: "today {time}",
    tomorrow_at: "tomorrow {time}",
    yesterday_at: "yesterday {time}",
    zoom_in: "Show details",
    zoom_out: "Show less",
    title: "Title (optional)",
    language: "Language",
    lang_auto: "Automatic",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    unavailable: "Unavailable",
    illustration: "Animated illustration",
    illustration_theme: "Illustration theme",
    theme_auto: "Automatic (follows the theme)",
    theme_day: "Day",
    theme_night: "Night",
  },
  fr: {
    tracked: "Objets suivis",
    home: "Maison",
    away: "Absent",
    unknown: "Inconnu",
    sum_home: "{n} à la maison",
    sum_away: "{n} dehors",
    seen: "Vu {when}",
    lost: "Pas vu depuis {span}",
    not_seen: "Pas vu",
    low_battery: "Batterie faible",
    battery: "Batterie",
    ring_it: "Faire sonner",
    ringing: "Sonne",
    radar: "Radar",
    items: "Objets",
    no_data: "Rien à afficher : aucun objet suivi trouvé.",
    trackers: "Traceurs (vide : les balises, colliers et traceurs GPS trouvés)",
    battery_threshold: "Batterie faible à partir de (%)",
    lost_after: "Pas vu après (heures ; 0 : jamais)",
    radar_range: "Portée du radar (km ; vide : automatique)",
    show_radar: "Afficher le radar",
    show_items: "Afficher les objets",
    show_distance: "Afficher les distances",
    show_battery: "Afficher les batteries",
    show_seen: "Afficher la dernière détection",
    mini_count: "Lignes de la mini-carte",
    at_home: "à la maison",
    farthest: "le plus loin : {name} {dist}",
    all_seen: "Tous vus ces dernières {span}",
    marked_lost: "Signalé perdu",
    lost_inline: "pas vu depuis {span}",
    marked_lost_inline: "signalé perdu",
    battery_inline: "batterie {pct}",
    low_battery_inline: "batterie faible",
    cancel: "Annuler",
    left: "{time} restantes",
    today_at: "aujourd'hui {time}",
    tomorrow_at: "demain {time}",
    yesterday_at: "hier {time}",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    language: "Langue",
    lang_auto: "Automatique",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    unavailable: "Indisponible",
    illustration: "Illustration animée",
    illustration_theme: "Thème de l’illustration",
    theme_auto: "Automatique (suit le thème)",
    theme_day: "Jour",
    theme_night: "Nuit",
  },
  de: {
    tracked: "Verfolgte Gegenstände",
    home: "Zuhause",
    away: "Unterwegs",
    unknown: "Unbekannt",
    sum_home: "{n} zuhause",
    sum_away: "{n} unterwegs",
    seen: "Gesehen {when}",
    lost: "Seit {span} nicht gesehen",
    not_seen: "Nicht gesehen",
    low_battery: "Akku schwach",
    battery: "Akku",
    ring_it: "Klingeln",
    ringing: "Klingelt",
    radar: "Radar",
    items: "Gegenstände",
    no_data: "Nichts anzuzeigen: kein verfolgter Gegenstand gefunden.",
    trackers: "Tracker (leer: die gefundenen Tags, Halsbänder und GPS-Tracker)",
    battery_threshold: "Akku schwach ab (%)",
    lost_after: "Nicht gesehen nach (Stunden; 0: nie)",
    radar_range: "Radarreichweite (km; leer: automatisch)",
    show_radar: "Radar anzeigen",
    show_items: "Gegenstände anzeigen",
    show_distance: "Entfernungen anzeigen",
    show_battery: "Akkus anzeigen",
    show_seen: "Zuletzt gesehen anzeigen",
    mini_count: "Zeilen der Mini-Karte",
    at_home: "zuhause",
    farthest: "am weitesten: {name} {dist}",
    all_seen: "Alle in den letzten {span} gesehen",
    marked_lost: "Als verloren markiert",
    lost_inline: "seit {span} nicht gesehen",
    marked_lost_inline: "als verloren markiert",
    battery_inline: "Akku {pct}",
    low_battery_inline: "Akku schwach",
    cancel: "Abbrechen",
    left: "Noch {time}",
    today_at: "heute {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gestern {time}",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    language: "Sprache",
    lang_auto: "Automatisch",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    unavailable: "Nicht verfügbar",
    illustration: "Animierte Illustration",
    illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch (folgt dem Design)",
    theme_day: "Tag",
    theme_night: "Nacht",
  },
  es: {
    tracked: "Objetos rastreados",
    home: "En casa",
    away: "Fuera",
    unknown: "Desconocido",
    sum_home: "{n} en casa",
    sum_away: "{n} fuera",
    seen: "Visto {when}",
    lost: "Sin ver desde hace {span}",
    not_seen: "Sin ver",
    low_battery: "Batería baja",
    battery: "Batería",
    ring_it: "Hacer sonar",
    ringing: "Sonando",
    radar: "Radar",
    items: "Objetos",
    no_data: "Nada que mostrar: no se encontró ningún objeto rastreado.",
    trackers: "Rastreadores (vacío: las etiquetas, collares y rastreadores GPS encontrados)",
    battery_threshold: "Batería baja desde (%)",
    lost_after: "Sin ver después de (horas; 0: nunca)",
    radar_range: "Alcance del radar (km; vacío: automático)",
    show_radar: "Mostrar el radar",
    show_items: "Mostrar los objetos",
    show_distance: "Mostrar las distancias",
    show_battery: "Mostrar las baterías",
    show_seen: "Mostrar la última detección",
    mini_count: "Líneas de la mini tarjeta",
    at_home: "en casa",
    farthest: "el más lejano: {name} {dist}",
    all_seen: "Todos vistos en las últimas {span}",
    marked_lost: "Marcado como perdido",
    lost_inline: "sin ver desde hace {span}",
    marked_lost_inline: "marcado como perdido",
    battery_inline: "batería {pct}",
    low_battery_inline: "batería baja",
    cancel: "Cancelar",
    left: "Quedan {time}",
    today_at: "hoy {time}",
    tomorrow_at: "mañana {time}",
    yesterday_at: "ayer {time}",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    unavailable: "No disponible",
    illustration: "Ilustración animada",
    illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático (sigue el tema)",
    theme_day: "Día",
    theme_night: "Noche",
  },
  it: {
    tracked: "Oggetti tracciati",
    home: "Casa",
    away: "Fuori",
    unknown: "Sconosciuto",
    sum_home: "{n} a casa",
    sum_away: "{n} fuori",
    seen: "Visto {when}",
    lost: "Non visto da {span}",
    not_seen: "Non visto",
    low_battery: "Batteria scarica",
    battery: "Batteria",
    ring_it: "Fai suonare",
    ringing: "Suona",
    radar: "Radar",
    items: "Oggetti",
    no_data: "Niente da mostrare: nessun oggetto tracciato trovato.",
    trackers: "Tracker (vuoto: i tag, i collari e i tracker GPS trovati)",
    battery_threshold: "Batteria scarica da (%)",
    lost_after: "Non visto dopo (ore; 0: mai)",
    radar_range: "Portata del radar (km; vuoto: automatica)",
    show_radar: "Mostra il radar",
    show_items: "Mostra gli oggetti",
    show_distance: "Mostra le distanze",
    show_battery: "Mostra le batterie",
    show_seen: "Mostra l'ultimo rilevamento",
    mini_count: "Righe della mini scheda",
    at_home: "a casa",
    farthest: "il più lontano: {name} {dist}",
    all_seen: "Tutti visti nelle ultime {span}",
    marked_lost: "Segnalato come perso",
    lost_inline: "non visto da {span}",
    marked_lost_inline: "segnalato come perso",
    battery_inline: "batteria {pct}",
    low_battery_inline: "batteria scarica",
    cancel: "Annulla",
    left: "{time} rimanenti",
    today_at: "oggi {time}",
    tomorrow_at: "domani {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    language: "Lingua",
    lang_auto: "Automatica",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    unavailable: "Non disponibile",
    illustration: "Illustrazione animata",
    illustration_theme: "Tema dell’illustrazione",
    theme_auto: "Automatico (segue il tema)",
    theme_day: "Giorno",
    theme_night: "Notte",
  },
  nl: {
    tracked: "Gevolgde voorwerpen",
    home: "Thuis",
    away: "Weg",
    unknown: "Onbekend",
    sum_home: "{n} thuis",
    sum_away: "{n} weg",
    seen: "Gezien {when}",
    lost: "Al {span} niet gezien",
    not_seen: "Niet gezien",
    low_battery: "Batterij bijna leeg",
    battery: "Batterij",
    ring_it: "Laten rinkelen",
    ringing: "Rinkelt",
    radar: "Radar",
    items: "Voorwerpen",
    no_data: "Niets te tonen: geen gevolgd voorwerp gevonden.",
    trackers: "Trackers (leeg: de gevonden tags, halsbanden en gps-trackers)",
    battery_threshold: "Batterij bijna leeg vanaf (%)",
    lost_after: "Niet gezien na (uren; 0: nooit)",
    radar_range: "Bereik van de radar (km; leeg: automatisch)",
    show_radar: "Radar tonen",
    show_items: "Voorwerpen tonen",
    show_distance: "Afstanden tonen",
    show_battery: "Batterijen tonen",
    show_seen: "Laatst gezien tonen",
    mini_count: "Regels van de mini-kaart",
    at_home: "thuis",
    farthest: "verst weg: {name} {dist}",
    all_seen: "Alles gezien in de laatste {span}",
    marked_lost: "Gemeld als verloren",
    lost_inline: "al {span} niet gezien",
    marked_lost_inline: "gemeld als verloren",
    battery_inline: "batterij {pct}",
    low_battery_inline: "batterij bijna leeg",
    cancel: "Annuleren",
    left: "Nog {time}",
    today_at: "vandaag {time}",
    tomorrow_at: "morgen {time}",
    yesterday_at: "gisteren {time}",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    language: "Taal",
    lang_auto: "Automatisch",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    unavailable: "Niet beschikbaar",
    illustration: "Geanimeerde illustratie",
    illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch (volgt het thema)",
    theme_day: "Dag",
    theme_night: "Nacht",
  },
  pt: {
    tracked: "Objetos seguidos",
    home: "Casa",
    away: "Fora",
    unknown: "Desconhecido",
    sum_home: "{n} em casa",
    sum_away: "{n} fora",
    seen: "Visto {when}",
    lost: "Não visto há {span}",
    not_seen: "Não visto",
    low_battery: "Bateria fraca",
    battery: "Bateria",
    ring_it: "Fazer tocar",
    ringing: "A tocar",
    radar: "Radar",
    items: "Objetos",
    no_data: "Nada a mostrar: nenhum objeto seguido encontrado.",
    trackers: "Rastreadores (vazio: as etiquetas, coleiras e rastreadores GPS encontrados)",
    battery_threshold: "Bateria fraca a partir de (%)",
    lost_after: "Não visto após (horas; 0: nunca)",
    radar_range: "Alcance do radar (km; vazio: automático)",
    show_radar: "Mostrar o radar",
    show_items: "Mostrar os objetos",
    show_distance: "Mostrar as distâncias",
    show_battery: "Mostrar as baterias",
    show_seen: "Mostrar a última deteção",
    mini_count: "Linhas do mini cartão",
    at_home: "em casa",
    farthest: "o mais longe: {name} {dist}",
    all_seen: "Todos vistos nas últimas {span}",
    marked_lost: "Marcado como perdido",
    lost_inline: "não visto há {span}",
    marked_lost_inline: "marcado como perdido",
    battery_inline: "bateria {pct}",
    low_battery_inline: "bateria fraca",
    cancel: "Cancelar",
    left: "Faltam {time}",
    today_at: "hoje {time}",
    tomorrow_at: "amanhã {time}",
    yesterday_at: "ontem {time}",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    unavailable: "Indisponível",
    illustration: "Ilustração animada",
    illustration_theme: "Tema da ilustração",
    theme_auto: "Automático (segue o tema)",
    theme_day: "Dia",
    theme_night: "Noite",
  },
  pl: {
    tracked: "Śledzone przedmioty",
    home: "Dom",
    away: "Poza domem",
    unknown: "Nieznane",
    sum_home: "W domu: {n}",
    sum_away: "Poza domem: {n}",
    seen: "Widziany {when}",
    lost: "Niewidziany od {span}",
    not_seen: "Niewidziany",
    low_battery: "Niski poziom baterii",
    battery: "Bateria",
    ring_it: "Zadzwoń",
    ringing: "Dzwoni",
    radar: "Radar",
    items: "Przedmioty",
    no_data: "Brak danych: nie znaleziono śledzonego przedmiotu.",
    trackers: "Lokalizatory (puste: znalezione tagi, obroże i lokalizatory GPS)",
    battery_threshold: "Niski poziom baterii od (%)",
    lost_after: "Niewidziany po (godziny; 0: nigdy)",
    radar_range: "Zasięg radaru (km; puste: automatycznie)",
    show_radar: "Pokaż radar",
    show_items: "Pokaż przedmioty",
    show_distance: "Pokaż odległości",
    show_battery: "Pokaż baterie",
    show_seen: "Pokaż ostatnie wykrycie",
    mini_count: "Wiersze mini karty",
    at_home: "w domu",
    farthest: "najdalej: {name} {dist}",
    all_seen: "Wszystkie widziane w ciągu ostatnich {span}",
    marked_lost: "Oznaczony jako zgubiony",
    lost_inline: "niewidziany od {span}",
    marked_lost_inline: "oznaczony jako zgubiony",
    battery_inline: "bateria {pct}",
    low_battery_inline: "słaba bateria",
    cancel: "Anuluj",
    left: "Pozostało {time}",
    today_at: "dziś {time}",
    tomorrow_at: "jutro {time}",
    yesterday_at: "wczoraj {time}",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    language: "Język",
    lang_auto: "Automatycznie",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    unavailable: "Niedostępne",
    illustration: "Animowana ilustracja",
    illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie (według motywu)",
    theme_day: "Dzień",
    theme_night: "Noc",
  },
  sr: {
    tracked: "Праћени предмети",
    home: "Кућа",
    away: "Ван куће",
    unknown: "Непознато",
    sum_home: "Код куће: {n}",
    sum_away: "Ван куће: {n}",
    seen: "Виђен {when}",
    lost: "Није виђен већ {span}",
    not_seen: "Није виђен",
    low_battery: "Слаба батерија",
    battery: "Батерија",
    ring_it: "Позвони",
    ringing: "Звони",
    radar: "Радар",
    items: "Предмети",
    no_data: "Нема шта да се прикаже: није пронађен ниједан праћени предмет.",
    trackers: "Трекери (празно: пронађене ознаке, огрлице и GPS трекери)",
    battery_threshold: "Слаба батерија од (%)",
    lost_after: "Није виђен после (сати; 0: никад)",
    radar_range: "Домет радара (km; празно: аутоматски)",
    show_radar: "Прикажи радар",
    show_items: "Прикажи предмете",
    show_distance: "Прикажи удаљености",
    show_battery: "Прикажи батерије",
    show_seen: "Прикажи последње виђење",
    mini_count: "Редови мини картице",
    at_home: "код куће",
    farthest: "најдаље: {name} {dist}",
    all_seen: "Сви виђени у последњих {span}",
    marked_lost: "Означен као изгубљен",
    lost_inline: "није виђен {span}",
    marked_lost_inline: "означен као изгубљен",
    battery_inline: "батерија {pct}",
    low_battery_inline: "слаба батерија",
    cancel: "Откажи",
    left: "Преостало {time}",
    today_at: "данас {time}",
    tomorrow_at: "сутра {time}",
    yesterday_at: "јуче {time}",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    language: "Језик",
    lang_auto: "Аутоматски",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    unavailable: "Недоступно",
    illustration: "Анимирана илустрација",
    illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски (прати тему)",
    theme_day: "Дан",
    theme_night: "Ноћ",
  },
  "sr-Latn": {
    tracked: "Praćeni predmeti",
    home: "Kuća",
    away: "Van kuće",
    unknown: "Nepoznato",
    sum_home: "Kod kuće: {n}",
    sum_away: "Van kuće: {n}",
    seen: "Viđen {when}",
    lost: "Nije viđen već {span}",
    not_seen: "Nije viđen",
    low_battery: "Slaba baterija",
    battery: "Baterija",
    ring_it: "Pozvoni",
    ringing: "Zvoni",
    radar: "Radar",
    items: "Predmeti",
    no_data: "Nema šta da se prikaže: nije pronađen nijedan praćeni predmet.",
    trackers: "Trekeri (prazno: pronađene oznake, ogrlice i GPS trekeri)",
    battery_threshold: "Slaba baterija od (%)",
    lost_after: "Nije viđen posle (sati; 0: nikad)",
    radar_range: "Domet radara (km; prazno: automatski)",
    show_radar: "Prikaži radar",
    show_items: "Prikaži predmete",
    show_distance: "Prikaži udaljenosti",
    show_battery: "Prikaži baterije",
    show_seen: "Prikaži poslednje viđenje",
    mini_count: "Redovi mini kartice",
    at_home: "kod kuće",
    farthest: "najdalje: {name} {dist}",
    all_seen: "Svi viđeni u poslednjih {span}",
    marked_lost: "Označen kao izgubljen",
    lost_inline: "nije viđen {span}",
    marked_lost_inline: "označen kao izgubljen",
    battery_inline: "baterija {pct}",
    low_battery_inline: "slaba baterija",
    cancel: "Otkaži",
    left: "Preostalo {time}",
    today_at: "danas {time}",
    tomorrow_at: "sutra {time}",
    yesterday_at: "juče {time}",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    language: "Jezik",
    lang_auto: "Automatski",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    unavailable: "Nedostupno",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski (prati temu)",
    theme_day: "Dan",
    theme_night: "Noć",
  },
  ro: {
    tracked: "Obiecte urmărite",
    home: "Acasă",
    away: "Plecat",
    unknown: "Necunoscut",
    sum_home: "{n} acasă",
    sum_away: "{n} plecate",
    seen: "Văzut {when}",
    lost: "Nevăzut de {span}",
    not_seen: "Nevăzut",
    low_battery: "Baterie descărcată",
    battery: "Baterie",
    ring_it: "Sună",
    ringing: "Sună acum",
    radar: "Radar",
    items: "Obiecte",
    no_data: "Nimic de afișat: nu s-a găsit niciun obiect urmărit.",
    trackers: "Trackere (gol: etichetele, zgărzile și trackerele GPS găsite)",
    battery_threshold: "Baterie descărcată de la (%)",
    lost_after: "Nevăzut după (ore; 0: niciodată)",
    radar_range: "Raza radarului (km; gol: automat)",
    show_radar: "Afișează radarul",
    show_items: "Afișează obiectele",
    show_distance: "Afișează distanțele",
    show_battery: "Afișează bateriile",
    show_seen: "Afișează ultima detectare",
    mini_count: "Rânduri ale mini cardului",
    at_home: "acasă",
    farthest: "cel mai departe: {name} {dist}",
    all_seen: "Toate văzute în ultimele {span}",
    marked_lost: "Marcat ca pierdut",
    lost_inline: "nevăzut de {span}",
    marked_lost_inline: "marcat ca pierdut",
    battery_inline: "baterie {pct}",
    low_battery_inline: "baterie descărcată",
    cancel: "Anulează",
    left: "Mai sunt {time}",
    today_at: "azi {time}",
    tomorrow_at: "mâine {time}",
    yesterday_at: "ieri {time}",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    language: "Limbă",
    lang_auto: "Automat",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    unavailable: "Indisponibil",
    illustration: "Ilustrație animată",
    illustration_theme: "Tema ilustrației",
    theme_auto: "Automat (urmează tema)",
    theme_day: "Zi",
    theme_night: "Noapte",
  },
  da: {
    tracked: "Sporede genstande",
    home: "Hjemme",
    away: "Ude",
    unknown: "Ukendt",
    sum_home: "{n} hjemme",
    sum_away: "{n} ude",
    seen: "Set {when}",
    lost: "Ikke set i {span}",
    not_seen: "Ikke set",
    low_battery: "Lavt batteri",
    battery: "Batteri",
    ring_it: "Få den til at ringe",
    ringing: "Ringer",
    radar: "Radar",
    items: "Genstande",
    no_data: "Intet at vise: ingen sporet genstand fundet.",
    trackers: "Trackere (tom: de fundne tags, halsbånd og GPS-trackere)",
    battery_threshold: "Lavt batteri fra (%)",
    lost_after: "Ikke set efter (timer; 0: aldrig)",
    radar_range: "Radarens rækkevidde (km; tom: automatisk)",
    show_radar: "Vis radaren",
    show_items: "Vis genstandene",
    show_distance: "Vis afstandene",
    show_battery: "Vis batterierne",
    show_seen: "Vis senest set",
    mini_count: "Linjer på minikortet",
    at_home: "hjemme",
    farthest: "længst væk: {name} {dist}",
    all_seen: "Alle set inden for de sidste {span}",
    marked_lost: "Markeret som mistet",
    lost_inline: "ikke set i {span}",
    marked_lost_inline: "markeret som mistet",
    battery_inline: "batteri {pct}",
    low_battery_inline: "lavt batteri",
    cancel: "Annuller",
    left: "{time} tilbage",
    today_at: "i dag {time}",
    tomorrow_at: "i morgen {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    language: "Sprog",
    lang_auto: "Automatisk",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    unavailable: "Utilgængelig",
    illustration: "Animeret illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatisk (følger temaet)",
    theme_day: "Dag",
    theme_night: "Nat",
  },
  sv: {
    tracked: "Spårade föremål",
    home: "Hemma",
    away: "Borta",
    unknown: "Okänt",
    sum_home: "{n} hemma",
    sum_away: "{n} borta",
    seen: "Sedd {when}",
    lost: "Inte sedd på {span}",
    not_seen: "Inte sedd",
    low_battery: "Lågt batteri",
    battery: "Batteri",
    ring_it: "Ring",
    ringing: "Ringer",
    radar: "Radar",
    items: "Föremål",
    no_data: "Inget att visa: inget spårat föremål hittades.",
    trackers: "Spårare (tomt: de hittade taggarna, halsbanden och GPS-spårarna)",
    battery_threshold: "Lågt batteri från (%)",
    lost_after: "Inte sedd efter (timmar; 0: aldrig)",
    radar_range: "Radarns räckvidd (km; tomt: automatiskt)",
    show_radar: "Visa radarn",
    show_items: "Visa föremålen",
    show_distance: "Visa avstånden",
    show_battery: "Visa batterierna",
    show_seen: "Visa senast sedd",
    mini_count: "Rader på minikortet",
    at_home: "hemma",
    farthest: "längst bort: {name} {dist}",
    all_seen: "Alla sedda de senaste {span}",
    marked_lost: "Markerad som förlorad",
    lost_inline: "inte sedd på {span}",
    marked_lost_inline: "markerad som förlorad",
    battery_inline: "batteri {pct}",
    low_battery_inline: "låg batterinivå",
    cancel: "Avbryt",
    left: "{time} kvar",
    today_at: "i dag {time}",
    tomorrow_at: "i morgon {time}",
    yesterday_at: "i går {time}",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    language: "Språk",
    lang_auto: "Automatiskt",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    unavailable: "Otillgänglig",
    illustration: "Animerad illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatiskt (följer temat)",
    theme_day: "Dag",
    theme_night: "Natt",
  },
  bg: {
    tracked: "Проследявани предмети",
    home: "Вкъщи",
    away: "Навън",
    unknown: "Неизвестно",
    sum_home: "Вкъщи: {n}",
    sum_away: "Навън: {n}",
    seen: "Видян {when}",
    lost: "Не е виждан от {span}",
    not_seen: "Не е виждан",
    low_battery: "Слаба батерия",
    battery: "Батерия",
    ring_it: "Позвъни",
    ringing: "Звъни",
    radar: "Радар",
    items: "Предмети",
    no_data: "Няма какво да се покаже: не е намерен проследяван предмет.",
    trackers: "Тракери (празно: намерените етикети, нашийници и GPS тракери)",
    battery_threshold: "Слаба батерия от (%)",
    lost_after: "Не е виждан след (часа; 0: никога)",
    radar_range: "Обхват на радара (km; празно: автоматично)",
    show_radar: "Показване на радара",
    show_items: "Показване на предметите",
    show_distance: "Показване на разстоянията",
    show_battery: "Показване на батериите",
    show_seen: "Показване на последното виждане",
    mini_count: "Редове на мини картата",
    at_home: "у дома",
    farthest: "най-далеч: {name} {dist}",
    all_seen: "Всички видени през последните {span}",
    marked_lost: "Отбелязан като изгубен",
    lost_inline: "не е виждан от {span}",
    marked_lost_inline: "отбелязан като изгубен",
    battery_inline: "батерия {pct}",
    low_battery_inline: "слаба батерия",
    cancel: "Отказ",
    left: "Остават {time}",
    today_at: "днес {time}",
    tomorrow_at: "утре {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    language: "Език",
    lang_auto: "Автоматично",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    unavailable: "Недостъпно",
    illustration: "Анимирана илюстрация",
    illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично (следва темата)",
    theme_day: "Ден",
    theme_night: "Нощ",
  },
  ru: {
    tracked: "Отслеживаемые предметы",
    home: "Дома",
    away: "Не дома",
    unknown: "Неизвестно",
    sum_home: "Дома: {n}",
    sum_away: "Не дома: {n}",
    seen: "Замечен {when}",
    lost: "Не замечен {span}",
    not_seen: "Не замечен",
    low_battery: "Низкий заряд",
    battery: "Батарея",
    ring_it: "Позвонить",
    ringing: "Звонит",
    radar: "Радар",
    items: "Предметы",
    no_data: "Нечего показать: не найдено отслеживаемых предметов.",
    trackers: "Трекеры (пусто: найденные метки, ошейники и GPS-трекеры)",
    battery_threshold: "Низкий заряд от (%)",
    lost_after: "Не замечен после (часов; 0: никогда)",
    radar_range: "Дальность радара (км; пусто: автоматически)",
    show_radar: "Показывать радар",
    show_items: "Показывать предметы",
    show_distance: "Показывать расстояния",
    show_battery: "Показывать батареи",
    show_seen: "Показывать последнее обнаружение",
    mini_count: "Строки мини-карточки",
    at_home: "дома",
    farthest: "дальше всех: {name} {dist}",
    all_seen: "Все замечены за последние {span}",
    marked_lost: "Отмечен как потерянный",
    lost_inline: "не виден {span}",
    marked_lost_inline: "отмечен как потерянный",
    battery_inline: "батарея {pct}",
    low_battery_inline: "низкий заряд",
    cancel: "Отмена",
    left: "Осталось {time}",
    today_at: "сегодня {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "вчера {time}",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    language: "Язык",
    lang_auto: "Автоматически",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    unavailable: "Недоступно",
    illustration: "Анимированная иллюстрация",
    illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически (по теме)",
    theme_day: "День",
    theme_night: "Ночь",
  },
  uk: {
    tracked: "Відстежувані предмети",
    home: "Вдома",
    away: "Не вдома",
    unknown: "Невідомо",
    sum_home: "Вдома: {n}",
    sum_away: "Не вдома: {n}",
    seen: "Помічено {when}",
    lost: "Не помічено {span}",
    not_seen: "Не помічено",
    low_battery: "Низький заряд",
    battery: "Батарея",
    ring_it: "Подзвонити",
    ringing: "Дзвонить",
    radar: "Радар",
    items: "Предмети",
    no_data: "Нічого показати: не знайдено відстежуваних предметів.",
    trackers: "Трекери (порожньо: знайдені мітки, нашийники та GPS-трекери)",
    battery_threshold: "Низький заряд від (%)",
    lost_after: "Не помічено після (годин; 0: ніколи)",
    radar_range: "Дальність радара (км; порожньо: автоматично)",
    show_radar: "Показувати радар",
    show_items: "Показувати предмети",
    show_distance: "Показувати відстані",
    show_battery: "Показувати батареї",
    show_seen: "Показувати останнє виявлення",
    mini_count: "Рядки міні-картки",
    at_home: "вдома",
    farthest: "найдалі: {name} {dist}",
    all_seen: "Усі помічені за останні {span}",
    marked_lost: "Позначено як загублений",
    lost_inline: "не видно {span}",
    marked_lost_inline: "позначено як загублений",
    battery_inline: "батарея {pct}",
    low_battery_inline: "низький заряд",
    cancel: "Скасувати",
    left: "Залишилось {time}",
    today_at: "сьогодні {time}",
    tomorrow_at: "завтра {time}",
    yesterday_at: "учора {time}",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    language: "Мова",
    lang_auto: "Автоматично",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    unavailable: "Недоступно",
    illustration: "Анімована ілюстрація",
    illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично (за темою)",
    theme_day: "День",
    theme_night: "Ніч",
  },
  hu: {
    tracked: "Követett tárgyak",
    home: "Otthon",
    away: "Távol",
    unknown: "Ismeretlen",
    sum_home: "{n} otthon",
    sum_away: "{n} távol",
    seen: "Látva {when}",
    lost: "{span} óta nem látott",
    not_seen: "Nem látott",
    low_battery: "Alacsony töltöttség",
    battery: "Akkumulátor",
    ring_it: "Csengetés",
    ringing: "Csenget",
    radar: "Radar",
    items: "Tárgyak",
    no_data: "Nincs mit megjeleníteni: nem található követett tárgy.",
    trackers: "Nyomkövetők (üres: a talált címkék, nyakörvek és GPS-nyomkövetők)",
    battery_threshold: "Alacsony töltöttség ettől (%)",
    lost_after: "Nem látott ennyi után (óra; 0: soha)",
    radar_range: "Radar hatótávolsága (km; üres: automatikus)",
    show_radar: "Radar megjelenítése",
    show_items: "Tárgyak megjelenítése",
    show_distance: "Távolságok megjelenítése",
    show_battery: "Akkumulátorok megjelenítése",
    show_seen: "Utolsó észlelés megjelenítése",
    mini_count: "A mini kártya sorai",
    at_home: "otthon",
    farthest: "legtávolabb: {name} {dist}",
    all_seen: "Mind látva az elmúlt {span} alatt",
    marked_lost: "Elveszettként megjelölve",
    lost_inline: "{span} óta nem látott",
    marked_lost_inline: "elveszettként megjelölve",
    battery_inline: "akkumulátor {pct}",
    low_battery_inline: "alacsony töltöttség",
    cancel: "Mégse",
    left: "Még {time}",
    today_at: "ma {time}",
    tomorrow_at: "holnap {time}",
    yesterday_at: "tegnap {time}",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    unavailable: "Nem elérhető",
    illustration: "Animált illusztráció",
    illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus (a témát követi)",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
  },
  sk: {
    tracked: "Sledované predmety",
    home: "Doma",
    away: "Preč",
    unknown: "Neznáme",
    sum_home: "Doma: {n}",
    sum_away: "Preč: {n}",
    seen: "Videný {when}",
    lost: "Nevidený {span}",
    not_seen: "Nevidený",
    low_battery: "Slabá batéria",
    battery: "Batéria",
    ring_it: "Zazvoniť",
    ringing: "Zvoní",
    radar: "Radar",
    items: "Predmety",
    no_data: "Nie je čo zobraziť: nenašiel sa žiadny sledovaný predmet.",
    trackers: "Lokalizátory (prázdne: nájdené štítky, obojky a GPS lokalizátory)",
    battery_threshold: "Slabá batéria od (%)",
    lost_after: "Nevidený po (hodiny; 0: nikdy)",
    radar_range: "Dosah radaru (km; prázdne: automaticky)",
    show_radar: "Zobraziť radar",
    show_items: "Zobraziť predmety",
    show_distance: "Zobraziť vzdialenosti",
    show_battery: "Zobraziť batérie",
    show_seen: "Zobraziť posledné videnie",
    mini_count: "Riadky mini karty",
    at_home: "doma",
    farthest: "najďalej: {name} {dist}",
    all_seen: "Všetky videné za posledných {span}",
    marked_lost: "Označený ako stratený",
    lost_inline: "nevidený {span}",
    marked_lost_inline: "označený ako stratený",
    battery_inline: "batéria {pct}",
    low_battery_inline: "slabá batéria",
    cancel: "Zrušiť",
    left: "Zostáva {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zajtra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    unavailable: "Nedostupné",
    illustration: "Animovaná ilustrácia",
    illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky (podľa témy)",
    theme_day: "Deň",
    theme_night: "Noc",
  },
  cs: {
    tracked: "Sledované předměty",
    home: "Doma",
    away: "Pryč",
    unknown: "Neznámé",
    sum_home: "Doma: {n}",
    sum_away: "Pryč: {n}",
    seen: "Viděn {when}",
    lost: "Neviděn {span}",
    not_seen: "Neviděn",
    low_battery: "Slabá baterie",
    battery: "Baterie",
    ring_it: "Prozvonit",
    ringing: "Zvoní",
    radar: "Radar",
    items: "Předměty",
    no_data: "Není co zobrazit: nebyl nalezen žádný sledovaný předmět.",
    trackers: "Lokátory (prázdné: nalezené štítky, obojky a GPS lokátory)",
    battery_threshold: "Slabá baterie od (%)",
    lost_after: "Neviděn po (hodiny; 0: nikdy)",
    radar_range: "Dosah radaru (km; prázdné: automaticky)",
    show_radar: "Zobrazit radar",
    show_items: "Zobrazit předměty",
    show_distance: "Zobrazit vzdálenosti",
    show_battery: "Zobrazit baterie",
    show_seen: "Zobrazit poslední spatření",
    mini_count: "Řádky mini karty",
    at_home: "doma",
    farthest: "nejdál: {name} {dist}",
    all_seen: "Všechny viděny za posledních {span}",
    marked_lost: "Označen jako ztracený",
    lost_inline: "neviděn {span}",
    marked_lost_inline: "označen jako ztracený",
    battery_inline: "baterie {pct}",
    low_battery_inline: "slabá baterie",
    cancel: "Zrušit",
    left: "Zbývá {time}",
    today_at: "dnes {time}",
    tomorrow_at: "zítra {time}",
    yesterday_at: "včera {time}",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    unavailable: "Nedostupné",
    illustration: "Animovaná ilustrace",
    illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky (podle motivu)",
    theme_day: "Den",
    theme_night: "Noc",
  },
  sl: {
    tracked: "Sledeni predmeti",
    home: "Doma",
    away: "Zdoma",
    unknown: "Neznano",
    sum_home: "Doma: {n}",
    sum_away: "Zdoma: {n}",
    seen: "Viden {when}",
    lost: "Neviden že {span}",
    not_seen: "Neviden",
    low_battery: "Prazna baterija",
    battery: "Baterija",
    ring_it: "Pozvoni",
    ringing: "Zvoni",
    radar: "Radar",
    items: "Predmeti",
    no_data: "Ni kaj prikazati: ni najdenega sledenega predmeta.",
    trackers: "Sledilniki (prazno: najdene oznake, ovratnice in GPS sledilniki)",
    battery_threshold: "Prazna baterija od (%)",
    lost_after: "Neviden po (ure; 0: nikoli)",
    radar_range: "Doseg radarja (km; prazno: samodejno)",
    show_radar: "Prikaži radar",
    show_items: "Prikaži predmete",
    show_distance: "Prikaži razdalje",
    show_battery: "Prikaži baterije",
    show_seen: "Prikaži zadnje zaznavanje",
    mini_count: "Vrstice mini kartice",
    at_home: "doma",
    farthest: "najdlje: {name} {dist}",
    all_seen: "Vsi videni v zadnjih {span}",
    marked_lost: "Označen kot izgubljen",
    lost_inline: "ni viden {span}",
    marked_lost_inline: "označen kot izgubljen",
    battery_inline: "baterija {pct}",
    low_battery_inline: "šibka baterija",
    cancel: "Prekliči",
    left: "Še {time}",
    today_at: "danes {time}",
    tomorrow_at: "jutri {time}",
    yesterday_at: "včeraj {time}",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    language: "Jezik",
    lang_auto: "Samodejno",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    unavailable: "Ni na voljo",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno (sledi temi)",
    theme_day: "Dan",
    theme_night: "Noč",
  },
  lv: {
    tracked: "Izsekotie priekšmeti",
    home: "Mājās",
    away: "Prom",
    unknown: "Nezināms",
    sum_home: "Mājās: {n}",
    sum_away: "Prom: {n}",
    seen: "Redzēts {when}",
    lost: "Nav redzēts {span}",
    not_seen: "Nav redzēts",
    low_battery: "Zems akumulators",
    battery: "Akumulators",
    ring_it: "Likt zvanīt",
    ringing: "Zvana",
    radar: "Radars",
    items: "Priekšmeti",
    no_data: "Nav ko rādīt: nav atrasts neviens izsekots priekšmets.",
    trackers: "Izsekotāji (tukšs: atrastās birkas, kakla siksnas un GPS izsekotāji)",
    battery_threshold: "Zems akumulators no (%)",
    lost_after: "Nav redzēts pēc (stundām; 0: nekad)",
    radar_range: "Radara darbības rādiuss (km; tukšs: automātiski)",
    show_radar: "Rādīt radaru",
    show_items: "Rādīt priekšmetus",
    show_distance: "Rādīt attālumus",
    show_battery: "Rādīt akumulatorus",
    show_seen: "Rādīt pēdējo redzēšanu",
    mini_count: "Mini kartītes rindas",
    at_home: "mājās",
    farthest: "vistālāk: {name} {dist}",
    all_seen: "Visi redzēti pēdējo {span} laikā",
    marked_lost: "Atzīmēts kā pazudis",
    lost_inline: "nav redzēts {span}",
    marked_lost_inline: "atzīmēts kā pazudis",
    battery_inline: "akumulators {pct}",
    low_battery_inline: "zems akumulatora līmenis",
    cancel: "Atcelt",
    left: "Atlikušas {time}",
    today_at: "šodien {time}",
    tomorrow_at: "rīt {time}",
    yesterday_at: "vakar {time}",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    language: "Valoda",
    lang_auto: "Automātiski",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    unavailable: "Nav pieejams",
    illustration: "Animēta ilustrācija",
    illustration_theme: "Ilustrācijas motīvs",
    theme_auto: "Automātiski (seko tēmai)",
    theme_day: "Diena",
    theme_night: "Nakts",
  },
  el: {
    tracked: "Παρακολουθούμενα αντικείμενα",
    home: "Σπίτι",
    away: "Εκτός",
    unknown: "Άγνωστο",
    sum_home: "{n} στο σπίτι",
    sum_away: "{n} εκτός",
    seen: "Εντοπίστηκε {when}",
    lost: "Δεν εντοπίστηκε για {span}",
    not_seen: "Δεν εντοπίστηκε",
    low_battery: "Χαμηλή μπαταρία",
    battery: "Μπαταρία",
    ring_it: "Κουδούνισμα",
    ringing: "Χτυπάει",
    radar: "Ραντάρ",
    items: "Αντικείμενα",
    no_data: "Τίποτα για εμφάνιση: δεν βρέθηκε παρακολουθούμενο αντικείμενο.",
    trackers: "Ιχνηλάτες (κενό: οι ετικέτες, τα κολάρα και οι ιχνηλάτες GPS που βρέθηκαν)",
    battery_threshold: "Χαμηλή μπαταρία από (%)",
    lost_after: "Δεν εντοπίστηκε μετά από (ώρες· 0: ποτέ)",
    radar_range: "Εμβέλεια ραντάρ (km· κενό: αυτόματα)",
    show_radar: "Εμφάνιση του ραντάρ",
    show_items: "Εμφάνιση των αντικειμένων",
    show_distance: "Εμφάνιση των αποστάσεων",
    show_battery: "Εμφάνιση των μπαταριών",
    show_seen: "Εμφάνιση του τελευταίου εντοπισμού",
    mini_count: "Γραμμές της μίνι κάρτας",
    at_home: "στο σπίτι",
    farthest: "πιο μακριά: {name} {dist}",
    all_seen: "Όλα εντοπίστηκαν τις τελευταίες {span}",
    marked_lost: "Σημειώθηκε ως χαμένο",
    lost_inline: "δεν εντοπίστηκε για {span}",
    marked_lost_inline: "σημειώθηκε ως χαμένο",
    battery_inline: "μπαταρία {pct}",
    low_battery_inline: "χαμηλή μπαταρία",
    cancel: "Ακύρωση",
    left: "Απομένουν {time}",
    today_at: "σήμερα {time}",
    tomorrow_at: "αύριο {time}",
    yesterday_at: "χθες {time}",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    unavailable: "Μη διαθέσιμο",
    illustration: "Κινούμενη εικονογράφηση",
    illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματο (ακολουθεί το θέμα)",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_ICONS = {
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
const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const valid = (s) => !!s && !["unknown", "unavailable", ""].includes(s.state);

const num = (s) => {
  if (!valid(s)) return null;
  const v = parseFloat(s.state);
  return Number.isFinite(v) ? v : null;
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const DAY_MS = 8.64e7;

const NUM_FMT = {};
const fmtNum = (v, digits, locale) =>
  (NUM_FMT[`${locale}|${digits}`] ||= new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })).format(v);

// "8:12", "1:05:00": a countdown, rounded up to the second.
const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};




// "12 min ago", "in 3 h", "2 days ago": the largest unit that fits, rounded.
const fmtRelative = (hass, config, ms) => {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(hass, config), { numeric: "auto", style: "short" });
  if (abs < 6e4) return rtf.format(0, "minute");
  if (abs < 3.6e6) return rtf.format(Math.round(diff / 6e4), "minute");
  if (abs < DAY_MS) return rtf.format(Math.round(diff / 3.6e6), "hour");
  return rtf.format(Math.round(diff / DAY_MS), "day");
};

// A length of time in its largest unit: "45 min", "7 h", "3 d" (the unit names from Intl).
const fmtSpan = (hass, config, ms) => {
  const locale = intlLocale(hass, config);
  const unit = (n, u) => new Intl.NumberFormat(locale, { style: "unit", unit: u, unitDisplay: "narrow" }).format(n);
  if (ms < 3.6e6) return unit(Math.max(0, Math.round(ms / 6e4)), "minute");
  if (ms < 2 * DAY_MS) return unit(Math.round(ms / 3.6e6), "hour");
  return unit(Math.round(ms / DAY_MS), "day");
};

// Registries: entries by device, names, areas.
const _byDevice = new WeakMap();
const byDevice = (hass) => {
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
const devName = (d) => d?.name_by_user || d?.name || "";
const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;
// What an entity is called, to recognise it: its id, translation key and names (registry and state), as snake_case.
const keyText = (e, hass) =>
  [e.entity_id, e.translation_key, e.name, hass.states[e.entity_id]?.attributes?.friendly_name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
const deviceClass = (hass, id) => hass.states[id]?.attributes?.device_class;
// Name of an entity without its device's name in front ("Kitchen Pasta" on the device "Kitchen" → "Pasta").
const shortName = (hass, id) => {
  const name = nameOf(hass, id);
  const dev = devName(hass.devices?.[hass.entities?.[id]?.device_id]);
  return dev && name.startsWith(`${dev} `) && name.length > dev.length + 1 ? name.slice(dev.length + 1) : name;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --tk-accent: #3949ab; --tk-ok: var(--success-color, #43a047); --tk-warn: var(--warning-color, #ffa600);
          --tk-crit: var(--error-color, #db4437); --tk-idle: var(--disabled-text-color, #9e9e9e); --tk-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --tk-accent-text: color-mix(in srgb, var(--tk-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container: tk-card / inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --tk-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--tk-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--tk-ok); } .warn { --c: var(--tk-warn); } .crit { --c: var(--tk-crit); } .idle { --c: var(--tk-idle); }
  .active { --c: var(--tk-active); } .accent { --c: var(--tk-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--tk-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--tk-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--tk-ok)) 50%, var(--primary-text-color));
          flex: 0 0 auto; min-width: 0; max-width: 51%; line-height: 16px; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  /* The detail button sits on the title's line, whether a subtitle follows or not. */
  .header .zoom { align-self: flex-start; margin-top: 10px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --tk-tint: var(--c, var(--tk-accent)); background: color-mix(in srgb, var(--tk-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--tk-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 0; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles .sub { display: none; }
  .tstack { display: flex; flex-direction: column; gap: 1px; align-items: flex-start; min-width: 0; width: 100%; }
  .tstack > * { max-width: 100%; }
  /* The status pill, in every header: on the title row right after the title only when the whole title and the pill's
     whole label fit there; otherwise on its own line under the subtitle, cut to one line; its dot alone, beside the
     title, when the banner has no room left above its ground strip, or on a card of 200 px or less. Decided by
     measurement (see _fitPill), so that every language and every width gets it right. */
  .titles .trow { display: flex; align-items: center; gap: 8px; min-width: 0; width: 100%; }
  .titles .trow > .name { flex: 0 1 auto; min-width: 0; }
  .titles .trow > .chip { flex: none; max-width: none; margin: 0; align-self: center; }
  .titles.below { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
  .titles.below > * { max-width: 100%; }
  .titles.below .trow { display: contents; }
  .titles.below .trow > .name { max-width: 100%; }
  .titles.below .trow > .chip { order: 9; max-width: 100%; margin-top: 2px; align-self: flex-start; }
  /* In the banner, a pill on its own line may run over the picture, up to the banner's edge. */
  .banner .titles.below .trow > .chip { max-width: none; }
  .titles.below :is(.sub) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.dotonly .trow > .chip { padding: 4px; } .titles.dotonly .trow > .chip .chip-text { display: none; }
  @container tk-card (max-width: 200px) { .titles .trow > .chip { padding: 4px; } .titles .trow > .chip .chip-text { display: none; } }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--tk-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--tk-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--tk-accent); }
  .btn.primary { background: color-mix(in srgb, var(--tk-accent) 16%, transparent); color: var(--tk-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--tk-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--tk-active) 16%, transparent); color: color-mix(in srgb, var(--tk-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--tk-active); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--tk-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.ok, .line.warn, .line.crit, .line.active, .line.accent { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.ok .icon, .line.warn .icon, .line.crit .icon, .line.active .icon, .line.accent .icon { color: var(--c); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .num { font-variant-numeric: tabular-nums; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 2px 0; }
  .ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .ring-svg circle { fill: none; }
  .ring-svg .track { stroke: color-mix(in srgb, var(--c, var(--tk-accent)) 18%, transparent); }
  .ring-svg .prog { stroke: var(--c, var(--tk-accent)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  /* Hero, as on the garden and tempo cards: a flat illustration on the left, a big value and a few colored lines on the right. */
  .hero { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hero-art { flex: none; width: 120px; display: grid; place-items: center; }
  .hero-art svg { width: 100%; height: auto; display: block; }
  .hero-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .hero-kick { font-size: 12px; color: var(--secondary-text-color); }
  .big { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .big .icon { width: 24px; height: 24px; align-self: center; color: var(--c, var(--tk-accent)); }
  .big b { font-size: 30px; font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .big span { font-size: 14px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hero .line { font-size: 12.5px; }
  /* Rows, as the watering zones: a round icon (grey at rest, tinted otherwise, a ring while it runs), name, colored state, a button. */
  .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .row-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
              --t: var(--c, var(--tk-idle)); background: color-mix(in srgb, var(--t) 18%, transparent); color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); }
  .row-icon.idle { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
  .row-icon > .icon, .row-icon > ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
  .row-icon .ring-svg { inset: -2px; width: 44px; height: 44px; }
  .badge { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center;
           background: var(--b, var(--tk-ok)); color: #fff; box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff)); }
  .badge .icon { width: 11px; height: 11px; }
  .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state.ok, .row-state.warn, .row-state.crit, .row-state.active, .row-state.accent { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .rows { display: flex; flex-direction: column; gap: 8px; }
  /* Tiles, as on room overview: grey, tinted with a border when they need a look; small badges below. */
  .tiles { display: grid; gap: 8px; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
  .tile { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
               border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile .row-icon { width: 30px; height: 30px; } .tile .row-icon > .icon { width: 18px; height: 18px; }
  .tile .row-state { font-size: 12px; }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; padding: 1px 7px; border-radius: 10px;
          color: color-mix(in srgb, var(--c, var(--tk-idle)) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--c, var(--tk-idle)) 14%, transparent); }
  .pill .icon { width: 14px; height: 14px; color: var(--c, var(--tk-idle)); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  @container tk-card (max-width: 230px) { .header { gap: 6px; } }
`;

// Popup at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--tk-accent) 60%, transparent); color: var(--tk-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--tk-accent) 10%, transparent); }
  .field { font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; color: var(--primary-text-color);
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  .field:focus { outline: 2px solid var(--primary-color, var(--tk-accent)); outline-offset: -1px; }
`;

// The mini card: header and a compact row; its detail button switches it to the full card's content.
const MINI_STYLE = `
  :host { --tk-natural-width: 300px; }
  .content.mini { flex-direction: row; align-items: center; gap: 12px; }
  .mini .info { gap: 4px; }
  .mini .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  @container tk-card (max-width: 300px) {
    .content.mini { flex-wrap: wrap; row-gap: 8px; }
    .mini .controls { flex-basis: 100%; justify-content: flex-end; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After a popup closes, clicks on the card are ignored this long (the second click of a double click).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-keep]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// ---------------------------------------------------------------------------
// Card base
// ---------------------------------------------------------------------------

// What every card of this file shares: rendering only when something shown changed, no rewrite under a press, focus
// kept for keyboard users, folding sections, a popup at the top of the card, live countdowns, service calls.
// A card defines _build() (its model from the registries and the configuration), _entityIds(m), _render(), and may
// define _action(action, el, ev), _dialogHtml() / _dialogAction(action, el), _extraDeps(), _onConnect() / _onDisconnect().
class CardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._inputs = {};
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Text typed in a field of the card is kept across rewrites (see _update); Enter in it acts as its button.
    this.shadowRoot.addEventListener("input", (ev) => {
      const key = ev.target?.dataset?.keep;
      if (key) this._inputs[key] = ev.target.value;
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const el = ev.target;
      if (ev.key === "Enter" && el?.dataset?.keep && el.dataset.submit) {
        ev.preventDefault();
        this._onClick({ composedPath: () => [{ dataset: { action: el.dataset.submit } }], stopPropagation() {}, detail: 0 });
        return;
      }
      // Enter / Space on an element with the button role acts as a click, as on a <button>.
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._configChanged?.();
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, its own data and the minute (the
  // "12 min ago" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve();
    const ids = m ? this._entityIds(m) : [];
    return [h.entities, h.devices, h.areas, h.language, h.locale, h.themes?.darkMode, Math.floor(Date.now() / 6e4), ...this._extraDeps(), ...ids.map((id) => h.states[id])];
  }

  _extraDeps() {
    return [];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    if (!h?.entities || !h?.devices) return null;
    const key = [h.entities, h.devices, h.areas, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = this._build();
    return this._model;
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._onConnect?.();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    clearInterval(this._countdown);
    this._tick = this._countdown = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._onDisconnect?.();
    this._resize?.disconnect();
    this._fitWidth = null;
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  // The status pill goes right after the title only when the whole title and the pill's whole label fit on that row;
  // otherwise it takes a line of its own under the subtitle (.titles.below, the subtitle cut to one line). In the
  // banner (where that line may run over the picture), when the titles still run below the top of the ground strip or
  // out of the banner, and in the classic header when the label does not fit even alone, the pill keeps its dot alone,
  // beside the title (.titles.dotonly). Measured in fractional pixels.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector(".trow");
      const chips = row ? [...row.querySelectorAll(":scope > .chip")] : [];
      if (!chips.length || !row.getBoundingClientRect) continue;
      t.classList.remove("below", "dotonly");
      const name = row.querySelector(":scope > .name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const widths = chips.map((c) => c.getBoundingClientRect().width);
      let need = -gap;
      if (name && getComputedStyle(name).display !== "none") {
        name.style.flex = "none";
        need = name.getBoundingClientRect().width;
        name.style.flex = "";
      }
      for (const w of widths) need += gap + w;
      const room = row.getBoundingClientRect().width + 0.01;
      if (need <= room) continue;
      t.classList.add("below");
      const banner = t.closest(".banner");
      const cut = !banner && widths.some((w) => w > room);
      let out = false;
      if (banner) {
        const b = banner.getBoundingClientRect();
        const floor = b.bottom - (banner.querySelector(".ground")?.getBoundingClientRect().height ?? 10) + 0.5;
        out = [...t.querySelectorAll(".name, .sub, .chip")].some((e) => {
          const r = e.getBoundingClientRect();
          return r.height && (r.bottom > floor || r.top < b.top - 0.5 || r.right > b.right + 0.5);
        });
      }
      if (cut || out) t.classList.replace("below", "dotonly");
    }
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    const r = this._hass.callService(domain, service, data);
    if (r && typeof r.catch === "function") r.catch(() => {});
    return r;
  }

  // A websocket command, through hass.callWS (or the connection), resolved with null on error.
  async _ws(msg) {
    const h = this._hass;
    try {
      if (h.callWS) return await h.callWS(msg);
      if (h.connection?.sendMessagePromise) return await h.connection.sendMessagePromise(msg);
    } catch {
      return null;
    }
    return null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card(\s[^>]*)?>([\s\S]*)<\/ha-card>\s*$/, (_, attrs = "", inner) => {
        const a = attrs.includes('class="') ? attrs.replace('class="', 'class="dialog-open ') : `${attrs} class="dialog-open"`;
        return `<ha-card${a}>${inner}<style>${DIALOG_STYLE}</style>${this._dialogHtml()}</ha-card>`;
      });
    }
    if (html !== this._html) {
      const active = this.shadowRoot.activeElement;
      const field = active?.dataset?.keep ? { key: active.dataset.keep, start: active.selectionStart, end: active.selectionEnd } : null;
      const focused = this._dialog && active?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      this._html = html;
      this.shadowRoot.innerHTML = html;
      this._fitPill();
      // Fields get back what was typed, and the caret when one had the focus.
      for (const el of this.shadowRoot.querySelectorAll?.("[data-keep]") || []) {
        const v = this._inputs[el.dataset.keep];
        if (v !== undefined) el.value = v;
      }
      if (field) {
        const el = this.shadowRoot.querySelector(`[data-keep="${field.key}"]`);
        el?.focus?.({ preventScroll: true });
        el?.setSelectionRange?.(field.start, field.end);
      } else if (kept) this._restoreFocus(kept);
      if (this._dialog && !field) {
        const sel = focused ? `.modal [data-action="${focused}"]` : ".modal [data-keep], .modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._syncCountdown();
    this._afterUpdate?.();
  }

  // Countdowns move every second in place (no re-render, which would restart the animations): the text of [data-end]
  // elements, and the arc of rings (data-total and data-c). The card is redrawn once a countdown ends.
  _syncCountdown() {
    const els = [...(this.shadowRoot.querySelectorAll?.("[data-end]") || [])];
    if (!els.length) {
      clearInterval(this._countdown);
      this._countdown = null;
      return;
    }
    if (this._countdown) return;
    this._countdown = setInterval(() => {
      const now = Date.now();
      let ended = false;
      for (const el of this.shadowRoot.querySelectorAll("[data-end]")) {
        const left = Number(el.dataset.end) - now;
        if (left <= 0) ended = true;
        if (el.dataset.total) {
          const offset = (Number(el.dataset.c) * (1 - clamp(left / Number(el.dataset.total), 0, 1))).toFixed(2);
          if (el.style.strokeDashoffset !== offset) el.style.strokeDashoffset = offset;
        } else {
          const text = el.dataset.fmt === "left" ? this._t("left", { time: fmtCountdown(left) }) : fmtCountdown(left);
          if (el.textContent !== text) el.textContent = text;
        }
      }
      if (ended) {
        clearInterval(this._countdown);
        this._countdown = null;
        this._lastDeps = null;
        this._update();
      }
    }, 1000);
  }

  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) return this._closeDialog();
      if (action) this._dialogAction(action, el);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && this._action(action, el, ev)) return;
    if (entity) this._moreInfo(entity);
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _action() {
    return false;
  }

  _dialogAction() {}

  _dialogHtml() {
    return "";
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal [data-keep], .modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  // The popup's frame: a message, the content and its buttons (cancel, then the main action).
  _modal(title, body, okLabel, okIcon, okDisabled = false) {
    return `<div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="msg">${esc(title)}</div>
        ${body}
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok"${okDisabled ? " disabled" : ""}>${okIcon ? svgIcon(okIcon) : ""}<span>${esc(okLabel)}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    return asList(this._config.collapsed ?? this.constructor.defaultCollapsed ?? []).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // A folding section: its title, and its body unless folded.
  _section(key, icon, label, count, body) {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  // The model ready to draw, or the error card to draw instead: no registries (Home Assistant too old), or nothing to
  // show (_emptyKey(m) names the message).
  _ready() {
    const m = this._resolve();
    if (!m) return { error: this._errorCard("no_registry") };
    const empty = this._emptyKey(m);
    return empty ? { error: this._errorCard(empty) } : { m };
  }

  _emptyKey() {
    return null;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  _zoomButton() {
    return "";
  }

  _toggleZoom() {}
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
const withMini = (Full) =>
  class extends Full {
    constructor() {
      super();
      this._unzoom = watchOutside(
        (ev) => isOutside(this, ev),
        () => {
          if (this._zoomed && !this._dialog) this._setZoom(false);
        },
      );
    }

    connectedCallback() {
      super.connectedCallback();
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unzoom.off();
      // Back to the compact view once off the screen (see the full card).
      this._zoomed = false;
    }

    getCardSize() {
      return this._zoomed ? super.getCardSize() : 3;
    }

    getGridOptions() {
      return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
    }

    _zoomButton() {
      if (this._config.zoom === false) return "";
      const z = this._zoomed;
      const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
      return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
    }

    _setZoom(on) {
      this._zoomed = on;
      this._update();
      this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
    }

    _toggleZoom(ev) {
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    }

    _render() {
      return this._zoomed ? super._render() : this._renderMini();
    }
  };

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// An editor is a ha-form: `fields` (the card's options), `toggles` ([name, default] booleans), `defaults` (options
// left out of the YAML when at their default), `sections` (the foldable sections, for `collapsed`). Options written
// in YAML that the form does not show are kept.
class EditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static get sections() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _fields() {
    return [];
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = this.constructor.toggles;
    const sections = this.constructor.sections;
    return [
      { name: "title", selector: { text: {} } },
      ...this._fields(),
      ...(toggles.length ? [{ type: "grid", name: "", schema: toggles.map(([name]) => ({ name, selector: { boolean: {} } })) }] : []),
      ...(sections.length ? [{ name: "collapsed", selector: { select: { multiple: true, mode: "list", options: sections.map((value) => ({ value, label: tr(value) })) } } }] : []),
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // A field's label is its `<name>_field` text when the card also uses `<name>` for something else (a section).
      this._form.computeLabel = (s) => t(this._hass, this._config, STRINGS.en[`${s.name}_field`] ? `${s.name}_field` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = { ...defaults, ...this._config };
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};

const register = (cards, url) => {
  for (const [name, cls] of cards) define(name, cls);
  window.customCards = window.customCards || [];
  for (const [type, , card] of cards) {
    if (card && !window.customCards.some((c) => c.type === type)) window.customCards.push({ type, ...card, preview: true, documentationURL: url });
  }
};

// ---------------------------------------------------------------------------
// Discovery, places and distances
// ---------------------------------------------------------------------------

// Shown unless hidden in Home Assistant or a configuration / diagnostic entity.
const visible = (hass, id) => {
  const e = hass.entities?.[id];
  return !e || (!e.hidden && !e.hidden_by && !e.entity_category);
};

// The buttons that make an item ring: a sound first (play sound, ring, beep, buzz), locating it otherwise; never one that stops a sound. Matched as
// whole words of the button's own name (translation key, entity id and name without the device's name): a device called "Keyring" rings nothing.
const RING_FIRST = /(^|_)(play_sound|ring|sound|beep|buzz)(_|$)/;
const RING_ELSE = /(^|_)(alarm|find|identify|locate)(_|$)/;
const STOP = /(^|_)stop(_|$)/;
const snake = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
// The words of an entity's own name, without its device's name.
const ownKeys = (hass, x) => {
  const dev = snake(devName(hass.devices?.[x.device_id]));
  let id = x.entity_id.split(".")[1] || "";
  if (dev && id.startsWith(`${dev}_`)) id = id.slice(dev.length + 1);
  return [snake(x.translation_key), id, snake(shortName(hass, x.entity_id))].filter(Boolean);
};
const ownMatch = (hass, x, re) => ownKeys(hass, x).some((k) => re.test(k));
// A binary sensor saying the item is lost; not a lost connection or signal.
const isLostFlag = (x) => {
  const id = x.entity_id.split(".")[1] || "";
  return x.translation_key === "lost" || (/_lost$/.test(id) && !/(connection|signal|link)_lost$/.test(id));
};

// The entities of an item's device that the card reads: its battery, its Bermuda area, its "last seen" time, its estimated distance (Private BLE
// Device, iBeacon), its lost flag and the button (or the Tractive buzzer switch) that makes it ring.
const companions = (hass, id) => {
  const e = hass.entities?.[id];
  const list = (e?.device_id && byDevice(hass).get(e.device_id)) || [];
  const of = (domain) => list.filter((x) => x.entity_id !== id && domainOf(x.entity_id) === domain && hass.states[x.entity_id]);
  const battery =
    of("sensor").find((x) => deviceClass(hass, x.entity_id) === "battery")?.entity_id ||
    of("binary_sensor").find((x) => deviceClass(hass, x.entity_id) === "battery")?.entity_id ||
    null;
  const area = of("sensor").find((x) => x.translation_key === "area" || /_area$/.test(x.entity_id))?.entity_id || null;
  const seen =
    of("sensor").find((x) => deviceClass(hass, x.entity_id) === "timestamp" && /last_seen|last_located|last_update|seen|located/.test(keyText(x, hass)))?.entity_id || null;
  const estimate = of("sensor").find((x) => x.translation_key === "estimated_distance" || /estimated_distance$/.test(x.entity_id))?.entity_id || null;
  const lostFlag = of("binary_sensor").find(isLostFlag)?.entity_id || null;
  const buttons = of("button").filter((x) => !ownMatch(hass, x, STOP));
  const button = (buttons.find((x) => ownMatch(hass, x, RING_FIRST)) || buttons.find((x) => ownMatch(hass, x, RING_ELSE)))?.entity_id || null;
  const buzzer = of("switch").find((x) => x.translation_key === "tracker_buzzer" || /buzzer/.test(keyText(x, hass)))?.entity_id || null;
  return { battery, area, seen, estimate, lost: lostFlag, button, buzzer };
};

// What rings an item: its button, else its buzzer switch (Tractive).
const ringer = (it) => it.button || it.buzzer || null;

const _cache = new WeakMap();

// The trackers of the configuration (entity ids, or { entity, name, icon, color, battery, area, button }), else every
// visible device tracker of a tag, collar or GPS tracker integration; each one with its companions.
const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify(config.trackers ?? null)}|${Object.keys(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const listed = config.trackers !== undefined;
  const src = listed
    ? asList(config.trackers).map((x) => (typeof x === "string" ? { entity: x } : x))
    : Object.values(hass.entities || {})
        .filter((e) => domainOf(e.entity_id) === "device_tracker" && TRACKER_PLATFORMS.includes(e.platform) && visible(hass, e.entity_id))
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
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const a = Math.sin(((lat2 - lat1) * rad) / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, a)));
};

// The direction from the first point to the second, in radians clockwise from north.
const bearing = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const y = Math.sin((lon2 - lon1) * rad) * Math.cos(lat2 * rad);
  const x = Math.cos(lat1 * rad) * Math.sin(lat2 * rad) - Math.sin(lat1 * rad) * Math.cos(lat2 * rad) * Math.cos((lon2 - lon1) * rad);
  return Math.atan2(y, x);
};

// The radar's range: the first round distance (km) at least the farthest item's.
const RANGES = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 20000];
const niceRange = (km) => RANGES.find((r) => r >= km) ?? RANGES[RANGES.length - 1];

// Where an item is: home, a zone (named), away or unknown.
const placeOf = (s) => {
  if (!s || !valid(s)) return "unknown";
  if (s.state === "home") return "home";
  if (s.state === "not_home") return "away";
  return "zone";
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TRACKER_STYLE = `
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

// ---------------------------------------------------------------------------
// Illustrated header: a street map at the right of the banner, home in the middle of a radar, a pin per item
// ---------------------------------------------------------------------------

// The night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the
// day picture after sunset).
const isNight = (hass, config) => {
  if (config?.illustration_theme === "night") return true;
  if (config?.illustration_theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// Home on the map (drawn on 0 0 200 80, shown from x 30): the radar's centre.
const MAP_HOME = [128, 46];
const PIN = "M0 0C-5.6 -6.6 -5.6 -13.2 0 -13.2C5.6 -13.2 5.6 -6.6 0 0Z";
let trackerUid = 0;

// A pin hanging at (x, y): its colour, the item's state (away pins bob, a low battery blinks, a lost one fades and
// pulses red).
const mapPin = ({ x, y, tint, away, low, lost }, i) => {
  const cls = ["tk-pin", away ? "away" : "", lost ? "lost" : ""].filter(Boolean).join(" ");
  const pulse = lost ? `<circle class="tk-pulse" r="6"/>` : "";
  const batt = low && !lost ? `<g class="tk-batt" transform="translate(5 -18)"><rect x="0" y="0" width="9" height="5" rx="1"/><rect x="9" y="1.5" width="1.2" height="2"/><rect class="lvl" x="1" y="1" width="2" height="3"/></g>` : "";
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${pulse}<g class="${cls}" style="--c: ${esc(tint)}; animation-delay: ${(-i * 0.37).toFixed(2)}s"><path d="${PIN}"/><circle cy="-8.6" r="2.2"/></g>${batt}</g>`;
};

// The map: streets, a park, a pond, the radar round home and its sweep (the state's colour), a route to the farthest
// item away, home's pin and the items' pins. `uid` keeps each card's ids apart on a page with several cards.
const trackerScene = ({ uid, state, pins, far }) => {
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

const BANNER_STYLE = `
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

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class TrackerCard extends CardBase {
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
    const u = (v, unit, digits = 0) => new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: digits }).format(v);
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

class TrackerMiniCard extends withMini(TrackerCard) {
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

// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------

class TrackerCardEditor extends EditorBase {
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

  _fields() {
    return [
      { name: "trackers", selector: { entity: { multiple: true, domain: "device_tracker" } } },
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
class TrackerMiniCardEditor extends TrackerCardEditor {
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
