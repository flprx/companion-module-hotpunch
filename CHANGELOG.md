# Changelog

## [Unreleased]

- Tooling: `package-lock.json`, ESLint + Prettier (config from `@companion-module/tools`), `node:test` tests and a GitHub Actions workflow (lint + tests).
- The OSC feedback logic (state mirror, variables, subscribe arguments) moved from `main.js` to the pure module `protocol.js`; behaviour unchanged.
- Version policy documented in the README.

## 1.0.0

- First version: OSC remote control of HotPunch (transport, GO LIVE, END LIVE, breakaway, sync, cue next/previous, follow), boolean feedbacks, variables and presets.
