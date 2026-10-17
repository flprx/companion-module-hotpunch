# companion-module-hotpunch

Bitfocus Companion module for **HotPunch** — the live-show video-switcher cue
manager. Drives HotPunch's basic transport/state actions over OSC and reflects
HotPunch's live state back onto the Stream Deck / Companion buttons.

## Setup

1. In HotPunch: **Settings > Tally/Web > Enable OSC remote control** and set a
   command port (default `4685`).
2. In Companion, add a **HotPunch** connection and configure:
   - **HotPunch IP** — the machine running HotPunch.
   - **Command port** — must match HotPunch (default `4685`).
   - **Feedback port** — the local UDP port this machine listens on for state
     (default `4686`).
   - **Feedback IP** — usually leave blank to auto-detect; set it if this
     machine has multiple interfaces and HotPunch is on a specific one.

The module subscribes for feedback automatically (and re-subscribes every 5 s,
since HotPunch prunes silent subscribers after ~10 s). The HotPunch
`OSCReceiver` can't read the UDP sender, so the subscription announces this
machine's feedback IP + port explicitly.

## Actions

Transport (play / stop / toggle), **GO LIVE** (arm-to-confirm: first press arms,
second confirms), END LIVE, breakaway ALL / M/E 1 / M/E 2, sync (TC lock),
next / previous cue, follow-playhead.

Breakaway (ALL, M/E 1, M/E 2), Sync and Follow have a **Mode** option: Toggle (default), On, Off. On/Off set the state and are safe to press twice.

## Feedbacks

`armed` (amber until the second GO LIVE press), on-air/LIVE (red), standby (amber), in-break (red),
breakaway active per bus, breakaway **unavailable** (dims a button when that
breakaway isn't actionable — HotPunch is the source of truth: Live/Break, and
M/E 2 only when dual M/E is on), sync locked, playing, follow.

## Variables

`mode`, `armed`, `playing`, `sync`, `follow`, `dual_me`, `break_all`,
`break_me1`, `break_me2`.

## OSC reference

<!-- BEGIN GENERATED osc-readme (scripts/gen-contracts.py from docs/contracts/osc-schema.json) - do not edit -->
Commands (Companion -> HotPunch, command port):

| Address | Arguments | What it does |
| --- | --- | --- |
| `/hotpunch/subscribe` | `port` (int), `ip` (string) | Register for state feedback: HotPunch sends to this port and IP (it cannot see the UDP sender). Repeat every 5 s; silent subscribers are dropped after about 10 s. |
| `/hotpunch/unsubscribe` | `port` (int), `ip` (string) | Stop the feedback to this port and IP. The IP alone (modules up to 1.0.x) stops every port on that IP. |
| `/hotpunch/transport/play` | - | Play / pause toggle (the same as /hotpunch/transport/toggle). |
| `/hotpunch/transport/stop` | - | Stop the active timeline. |
| `/hotpunch/transport/toggle` | - | Play / pause toggle. |
| `/hotpunch/golive` | - | GO LIVE with arm-to-confirm, as the on-screen button: the first message arms for three seconds, the second confirms. |
| `/hotpunch/endlive` | - | End the show now (back to Standby), without confirmation. |
| `/hotpunch/break/all` | `value` (int, optional) | Global Break. No argument: toggle. 1 = on, 0 = off (sending it twice changes nothing); any other value is ignored. |
| `/hotpunch/break/me1` | `value` (int, optional) | Break on M/E 1. Same argument rules as /hotpunch/break/all. |
| `/hotpunch/break/me2` | `value` (int, optional) | Break on M/E 2 (dual M/E only). Same argument rules as /hotpunch/break/all. |
| `/hotpunch/sync` | `value` (int, optional) | Timecode lock. Same argument rules as /hotpunch/break/all. |
| `/hotpunch/cue/next` | - | Next cue. In Maestro mode this is the GO; otherwise it moves the playhead and is refused while Live. |
| `/hotpunch/cue/prev` | - | Previous cue. Refused while Live, except in Maestro mode. |
| `/hotpunch/follow` | `value` (int, optional) | Follow playhead. Same argument rules as /hotpunch/break/all. |

Feedback (HotPunch -> feedback port), on every change and with the heartbeat (about every 2 s):

| Address | Type | Values | Meaning |
| --- | --- | --- | --- |
| `/hotpunch/state/mode` | string | `offline`, `standby`, `live`, `break` | Operating state of HotPunch. |
| `/hotpunch/state/armed` | int | `0`, `1` | 1 while GO LIVE is armed, waiting for the confirming press. |
| `/hotpunch/state/playing` | int | `0`, `1` | 1 while the active timeline is playing. |
| `/hotpunch/state/sync` | int | `0`, `1` | 1 while the timecode lock is on. |
| `/hotpunch/state/follow` | int | `0`, `1` | 1 while Follow playhead is on. |
| `/hotpunch/state/dualme` | int | `0`, `1` | 1 when the project uses dual M/E. |
| `/hotpunch/state/break/all` | int | `0`, `1` | 1 while the whole show is in Break. |
| `/hotpunch/state/break/me1` | int | `0`, `1` | 1 while M/E 1 is in Break. |
| `/hotpunch/state/break/me2` | int | `0`, `1` | 1 while M/E 2 is in Break. |
| `/hotpunch/state/avail/break_all` | int | `0`, `1` | 1 when the global Break toggle is available (enter from Live, exit from Break). |
| `/hotpunch/state/avail/break_me1` | int | `0`, `1` | 1 when M/E 1 can go to Break (Live or Break). |
| `/hotpunch/state/avail/break_me2` | int | `0`, `1` | 1 when M/E 2 can go to Break (Live or Break, dual M/E on). |
| `/hotpunch/state/heartbeat` | int | counter | Counter that grows with every heartbeat, about every 2 s. |
| `/hotpunch/state/proto` | int | `2` | OSC protocol level of this HotPunch; absent means level 1. |
<!-- END GENERATED osc-readme -->

## Status

Built against `@companion-module/base` ~1.8 with the `osc` package. Not yet
verified inside a running Companion instance.

## Development

```
npm ci          # exact dependencies from package-lock.json
npm run lint    # eslint + prettier (config from @companion-module/tools)
npm test        # node:test, no Companion needed
npm run build   # companion-module-build: the package for Companion
```

`osc-addresses.js` (and, from 1.1.0, `colors.js` and the OSC tables in "OSC reference") are
**generated** from the HotPunch repository (`scripts/gen-contracts.py`): never
edit them here, change the source in HotPunch and regenerate.

## Versions

- `package.json` and `companion/manifest.json` carry the same version (a test
  checks it).
- **minor**: new actions, feedbacks or options, or a change in what the module
  sends to HotPunch; **patch**: fixes; **major**: renaming or removing an
  action, feedback or variable id (it breaks buttons users already saved).
- The version is bumped by hand at release time, together with its
  `CHANGELOG.md` section.
- Every version gets its section in `CHANGELOG.md`, in the same commit.
- Dependencies are locked in `package-lock.json`; they are updated in a
  dedicated commit (`npm update`, then lint and tests), never as a side effect.

## Compatibility

| Module | HotPunch 0.5.0 and earlier | Newer HotPunch |
| --- | --- | --- |
| 1.0.x | everything works (toggles only) | everything works (toggles only); unsubscribe by IP alone stops every instance on that IP |
| 1.1.0 | On / Off rely on the live feedback (see below); unsubscribe is ignored, the subscription expires after ~10 s | On / Off set the state; unsubscribe removes only this instance |
| 1.2.0 | same as 1.1.0 | On / Off are always sent when HotPunch announces protocol level 2 (`/hotpunch/state/proto`, HotPunch with F5e); older HotPunch keeps the guard |

HotPunch 0.5.0 and earlier ignore the On / Off argument and always toggle. To
keep On / Off correct, the module (without a protocol level 2 announcement from HotPunch) does not send them when the feedback is alive
(state received within the last 5 s) and the state already is the requested
one. Without live feedback it sends the command anyway, so with those versions
use **Toggle** on buttons that may be pressed while the link is down.

## Ports

Defaults follow HotPunch's 468x family ("HOT" on a phone keypad): command
port `4685`, feedback port `4686`. The OSC port belongs to the HotPunch
machine, not to the project: it defaults to `4685` and is set in HotPunch
under Settings > Tally/Web, whichever project is open. If you used `8010`
with an older HotPunch, either type `8010` back into that setting on the
HotPunch machine or point this module's command port at `4685`.
