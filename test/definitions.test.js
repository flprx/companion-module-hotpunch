'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { IN } = require('../osc-addresses')
const { getActions } = require('../actions')
const { getFeedbacks } = require('../feedbacks')
const { getPresets } = require('../presets')
const { createState } = require('../protocol')

function fakeSelf() {
	const sent = []
	return { sent, state: createState(), send: (address, args = []) => sent.push({ address, args }) }
}

test('osc-addresses.js is the generated file', () => {
	const first = fs.readFileSync(path.join(__dirname, '..', 'osc-addresses.js'), 'utf8').split('\n')[0]
	assert.match(first, /GENERATED - do not edit/)
	for (const a of [...Object.values(IN)]) assert.match(a, /^\/hotpunch\//)
})

test('every command except subscribe/unsubscribe has an action that sends it', () => {
	const self = fakeSelf()
	for (const action of Object.values(getActions(self))) action.callback({ options: {} })
	const sent = new Set(self.sent.map((m) => m.address))
	for (const [name, address] of Object.entries(IN)) {
		if (name === 'Subscribe' || name === 'Unsubscribe') continue
		assert.ok(sent.has(address), `${name} (${address}) is never sent`)
	}
})

test('presets reference existing actions and feedbacks', () => {
	const actions = getActions(fakeSelf())
	const feedbacks = getFeedbacks(fakeSelf())
	for (const [id, p] of Object.entries(getPresets())) {
		for (const step of p.steps) for (const a of step.down) assert.ok(actions[a.actionId], `${id}: ${a.actionId}`)
		for (const f of p.feedbacks) assert.ok(feedbacks[f.feedbackId], `${id}: ${f.feedbackId}`)
	}
})

test('every feedback answers a boolean on the default state', () => {
	for (const [id, f] of Object.entries(getFeedbacks(fakeSelf()))) {
		assert.equal(f.type, 'boolean', id)
		assert.equal(typeof f.callback({ options: {} }), 'boolean', id)
	}
})
