# Changelog

## 1.2.0 - 2026-11-17

### Features
- Illustrated header, 90 px on the full and the mini card: a street map with home in the middle of a radar whose beam sweeps and a pin per item in its own colour (round home, or at its direction and distance when away, with a dashed route to the farthest one), over a 10 px map strip.
- The header follows the state: all home in green, items away in blue (their pins bob), a low battery in amber (a battery blinks by the pin, the item and its level in the subtitle), an item not seen in red (its pin fades and pulses); the round icon takes the same colour.
- Day and night pictures: night when `sun.sun` is below the horizon, else with the dark theme; `illustration_theme: day | night` forces one. `illustration: false` keeps the classic header with its status chip. Both options are in the visual editors.
- The status pill is back in the illustrated header, on the title row right after the title, in the icon's colour (Home, N away, Low battery, Not seen); the subtitle no longer repeats it. It drops under the subtitle when room runs short and keeps only its dot on a very narrow card. The mini card's detail button sits in the banner's top-right corner, in the frosted style of the other cards, the map stepping aside for it.
- The classic header (`illustration: false`) has the same status pill on the title row, right after the title (under the subtitle when narrow, dot only at 200 px or less); its subtitle no longer counts the items away.

## 1.1.0 - 2026-11-16

### Features
- New look, common to the other cards: the radar as the card's illustration next to how many items are home, with lines for those away (and the farthest), the items not seen or with a low battery and when they were all last seen.
- Items as tiles: grey at home, tinted blue when away, amber with a low battery, red when not seen; pills for the last seen time and the battery, and a *Ring* pill whose bell shakes while it rings.
- Mini card: the small radar, the same lines and a round button to ring an item: the first one not seen, else away, else at home (its name in the button's tooltip).

### Fixes
- Ring button: the button that plays a sound is chosen first, a locate button only when there is none, and never one that stops the sound (Google Find My Device has play sound, stop sound and locate).
- Tractive: the collar's buzzer switch rings it (`switch.turn_on`) when there is no button.
- Not seen: an item marked as lost by its integration (an `is_lost` attribute or a *lost* binary sensor) counts as not seen, whenever it was last seen.
- Private BLE Device and iBeacon: the estimated distance is shown next to the place.
- Bermuda: the tracker's `area` attribute gives the room when there is no area sensor.
- Ring button: matched on the button's own name, so a device called *Keyring* no longer rings with its *Restart* button; a lost connection or signal no longer counts as lost.
- Tractive: a click on a buzzer already on turns it off.
- Dark theme: the *Ring* pill and the bell read better; the radar's dots no longer cover each other and stay inside the disc.

## 1.0.0 - 2026-11-16

First release.

### Features
- **Tracker Card** (`custom:tracker-card`): a radar around home with each tracked item at its direction and distance, and the items with their place (home and room, zone, away), last seen time, distance, battery and a ring button.
- **Tracker Mini Card** (`custom:tracker-mini-card`): a small radar and where the first items are, the items not seen first; the detail button switches to the full card.
- Tile, Bermuda, Private BLE Device, iBeacon, Google Find My Device, SmartThings Find, Apple Find My, iCloud, Tractive, Fressnapf, PAJ GPS and Traccar trackers found on their own, with the battery, Bermuda area, last-seen sensor and ring button of their devices.
- Items not seen for a day in red, low batteries in orange, with a chip in the header.
- Animations of the radar's sweep and of an item ringing.
- Visual editor for both cards; light and dark themes; kilometres or miles; 22 languages, English in the bundle and every other language in its own file loaded on demand.
