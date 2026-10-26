/* eslint-disable n/no-unpublished-require */
// Lint config of @companion-module/tools 1.5 (eslint 8 + prettier), JS only.
const config = require('@companion-module/tools/eslint/index.cjs')({ enableTypescript: false })

// Generated from the HotPunch repo (scripts/gen-contracts.py): not linted here.
// pkg/ is the bundle written by `npm run build`.
config.ignorePatterns = [...(config.ignorePatterns || []), 'osc-addresses.js', 'colors.js', 'pkg/']

module.exports = config
