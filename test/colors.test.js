'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { combineRgb } = require('@companion-module/base')
const colors = require('../colors')
const { getFeedbacks } = require('../feedbacks')
const { getPresets } = require('../presets')

test('colors.js is generated and in combineRgb format', () => {
	const first = fs.readFileSync(path.join(__dirname, '..', 'colors.js'), 'utf8').split('\n')[0]
	assert.match(first, /GENERATED - do not edit/)
	assert.equal(colors.LIVE, combineRgb(0x22, 0xc5, 0x5e))
	assert.equal(colors.ON_AIR, combineRgb(0xdc, 0x26, 0x26))
})

test('feedbacks and presets use only palette colours', () => {
	const palette = new Set(Object.values(colors))
	for (const [id, f] of Object.entries(getFeedbacks({ state: {} }))) {
		assert.ok(palette.has(f.defaultStyle.bgcolor), `${id} bgcolor`)
		assert.ok(palette.has(f.defaultStyle.color), `${id} color`)
	}
	for (const [id, p] of Object.entries(getPresets())) {
		assert.ok(palette.has(p.style.bgcolor), `${id} bgcolor`)
		assert.ok(palette.has(p.style.color), `${id} color`)
	}
})

test('no colour is written by hand', () => {
	for (const f of ['feedbacks.js', 'presets.js']) {
		const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8')
		assert.doesNotMatch(src, /combineRgb\(/, f)
	}
})
