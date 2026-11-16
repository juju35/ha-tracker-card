# Changelog

## 1.1.0 - 2026-11-16

### Features
- New look, common to the other cards: the radar as the card's illustration next to how many items are home, with lines for those away (and the farthest), the items not seen or with a low battery and when they were all last seen.
- Items as tiles: grey at home, tinted blue when away, amber with a low battery, red when not seen; pills for the last seen time and the battery, and a *Ring* pill whose bell shakes while it rings.
- Mini card: the small radar, the same lines and a round button to ring the first item away.

### Fixes
- Ring button: the button that plays a sound is chosen first, a locate button only when there is none, and never one that stops the sound (Google Find My Device has play sound, stop sound and locate).
- Tractive: the collar's buzzer switch rings it (`switch.turn_on`) when there is no button.
- Not seen: an item marked as lost by its integration (an `is_lost` attribute or a *lost* binary sensor) counts as not seen, whenever it was last seen.
- Private BLE Device and iBeacon: the estimated distance is shown next to the place.
- Bermuda: the tracker's `area` attribute gives the room when there is no area sensor.

## 1.0.0 - 2026-11-16

First release.

### Features
- **Tracker Card** (`custom:tracker-card`): a radar around home with each tracked item at its direction and distance, and the items with their place (home and room, zone, away), last seen time, distance, battery and a ring button.
- **Tracker Mini Card** (`custom:tracker-mini-card`): a small radar and where the first items are, the items not seen first; the detail button switches to the full card.
- Tile, Bermuda, Private BLE Device, iBeacon, Google Find My Device, SmartThings Find, Apple Find My, iCloud, Tractive, Fressnapf, PAJ GPS and Traccar trackers found on their own, with the battery, Bermuda area, last-seen sensor and ring button of their devices.
- Items not seen for a day in red, low batteries in orange, with a chip in the header.
- Animations of the radar's sweep and of an item ringing.
- Visual editor for both cards; light and dark themes; kilometres or miles; 22 languages, English in the bundle and every other language in its own file loaded on demand.
