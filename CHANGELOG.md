# Changelog

## [Unreleased]

## 1.1.0 - 2026-10-17

Needs HotPunch with the F5d changes (the release after 0.5.0) for the On/Off modes and the per-port unsubscribe; with older HotPunch versions see "Compatibility" in the README.

- **Mode On/Off** on Breakaway ALL / M/E 1 / M/E 2, Sync and Follow: On and Off set the state (sending it twice changes nothing), Toggle (the default, and what existing buttons keep doing) flips it.
- **Unsubscribe by port**: disabling one of two module instances on the same machine no longer stops the other's feedback. Changing the connection settings now unsubscribes the old port and IP.
- **Colours** from HotPunch's palette: break is red (was orange), standby amber (was blue), playing / sync / follow green with dark text, as in the app.
- **README**: the OSC tables are generated from HotPunch's OSC schema.
- **Development**: lockfile, lint, tests, CI (policy documented in the README).

## 1.0.0

- First version: OSC remote control of HotPunch (transport, GO LIVE, END LIVE, breakaway, sync, cue next/previous, follow), boolean feedbacks, variables and presets.
