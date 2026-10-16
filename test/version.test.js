'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const pkg = require('../package.json')
const manifest = require('../companion/manifest.json')

test('package.json and companion/manifest.json carry the same version', () => {
	assert.equal(manifest.version, pkg.version)
	assert.match(pkg.version, /^\d+\.\d+\.\d+$/)
})

test('manifest entrypoint and runtime', () => {
	assert.equal(manifest.id, 'hotpunch')
	assert.equal(manifest.runtime.entrypoint, '../main.js')
	assert.equal(manifest.runtime.type, 'node22')
})
