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

## Feedbacks

`armed` (amber until the second GO LIVE press), on-air/LIVE, standby, in-break,
breakaway active per bus, breakaway **unavailable** (dims a button when that
breakaway isn't actionable — HotPunch is the source of truth: Live/Break, and
M/E 2 only when dual M/E is on), sync locked, playing, follow.

## Variables

`mode`, `armed`, `playing`, `sync`, `follow`, `dual_me`, `break_all`,
`break_me1`, `break_me2`.

## OSC reference

Commands (Companion → HotPunch, command port):

```
/hotpunch/subscribe <feedbackPort:int> <feedbackIp:string>
/hotpunch/unsubscribe <feedbackIp:string>
/hotpunch/transport/play | /stop | /toggle
/hotpunch/golive            (arm-to-confirm)
/hotpunch/endlive
/hotpunch/break/all | /me1 | /me2
/hotpunch/sync
/hotpunch/cue/next | /prev
/hotpunch/follow
```

Feedback (HotPunch → feedback port), on change + ~2 s heartbeat:

```
/hotpunch/state/mode (string)   armed playing sync follow dualme  (int 0/1)
/hotpunch/state/break/all|me1|me2            (int 0/1)
/hotpunch/state/avail/break_all|me1|me2      (int 0/1)
/hotpunch/state/heartbeat                    (int)
```

## Status

Built against `@companion-module/base` ~1.8 with the `osc` package. Not yet
verified inside a running Companion instance — see the HotPunch repo
`docs/superpowers/specs/2026-06-19-osc-remote-control-design.md` for the full
design.

## Ports

Defaults follow HotPunch's 468x family ("HOT" on a phone keypad): command
port `4685`, feedback port `4686`. The OSC port belongs to the HotPunch
machine, not to the project: it defaults to `4685` and is set in HotPunch
under Settings > Tally/Web, whichever project is open. If you used `8010`
with an older HotPunch, either type `8010` back into that setting on the
HotPunch machine or point this module's command port at `4685`.
