# Changelog

## [Unreleased]

## 1.2.0 - 2026-10-17

On/Off are always sent when HotPunch announces protocol level 2 (`/hotpunch/state/proto`, HotPunch with F5e): the mirror-state guard now applies only to older HotPunch. The announced level counts only while it keeps being heard (within 5 s), so an older HotPunch replacing a newer one on the same host gets the guard back.

## 1.1.0 - 2026-10-17

The On/Off modes and the per-port unsubscribe need a HotPunch newer than 0.5.0. With HotPunch 0.5.0 and earlier, On/Off rely on the live feedback (they are skipped when the state already is the requested one); see "Compatibility" in the README.

- **Mode On/Off** on Breakaway ALL / M/E 1 / M/E 2, Sync and Follow: On and Off set the state (sending it twice changes nothing), Toggle (the default, and what existing buttons keep doing) flips it.
- **Unsubscribe by port**: disabling one of two module instances on the same machine no longer stops the other's feedback. Changing the connection settings now unsubscribes the old port and IP, and the unsubscribe is really delivered before the socket closes (it used to be lost).
- **Colours** from HotPunch's palette: break is red (was orange), standby amber (was blue), playing / sync / follow green with dark text, as in the app.
- **README**: the OSC tables are generated from HotPunch's OSC schema.
- **Development**: lockfile, lint, tests, CI (policy documented in the README).

## 1.0.0

- First version: OSC remote control of HotPunch (transport, GO LIVE, END LIVE, breakaway, sync, cue next/previous, follow), boolean feedbacks, variables and presets.
