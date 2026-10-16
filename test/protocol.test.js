'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { OUT } = require('../osc-addresses')
const {
	BOOL_FIELDS,
	createState,
	applyStateMessage,
	variableValues,
	subscribeArgs,
	argsForMode,
	unsubscribeArgs,
	MODE_CHOICES,
} = require('../protocol')

test('default state: offline, every flag false', () => {
	const s = createState()
	assert.equal(s.mode, 'offline')
	for (const f of Object.values(BOOL_FIELDS)) assert.equal(s[f], false, f)
})

test('every OUT address is handled', () => {
	const s = createState()
	for (const [name, address] of Object.entries(OUT)) {
		const r = applyStateMessage(s, address, 1)
		assert.equal(r, address === OUT.StateHeartbeat ? 'heartbeat' : 'changed', name)
	}
})

test('one flag at a time', () => {
	for (const [address, field] of Object.entries(BOOL_FIELDS)) {
		const s = createState()
		assert.equal(applyStateMessage(s, address, 1), 'changed')
		for (const other of Object.values(BOOL_FIELDS)) assert.equal(s[other], other === field, `${address} -> ${other}`)
		applyStateMessage(s, address, 0)
		assert.equal(s[field], false)
	}
})

test('mode, heartbeat and unknown addresses', () => {
	const s = createState()
	assert.equal(applyStateMessage(s, OUT.StateMode, 'live'), 'changed')
	assert.equal(s.mode, 'live')
	assert.equal(applyStateMessage(s, OUT.StateHeartbeat, 7), 'heartbeat')
	assert.equal(applyStateMessage(s, '/hotpunch/state/unknown', 1), null)
	assert.equal(applyStateMessage(s, '/other', 1), null)
})

test('variables', () => {
	const s = createState()
	applyStateMessage(s, OUT.StateSync, 1)
	assert.deepEqual(variableValues(s), {
		mode: 'offline',
		armed: '',
		playing: 'stopped',
		sync: 'locked',
		follow: 'off',
		dual_me: 'off',
		break_all: 'off',
		break_me1: 'off',
		break_me2: 'off',
	})
})

test('subscribe args: (i port, s ip)', () => {
	assert.deepEqual(subscribeArgs(4686, '10.0.0.5'), [
		{ type: 'i', value: 4686 },
		{ type: 's', value: '10.0.0.5' },
	])
})

test('argsForMode: toggle sends nothing, on/off send i 1 / i 0', () => {
	assert.deepEqual(argsForMode('toggle'), [])
	assert.deepEqual(argsForMode(undefined), []) // buttons created before 1.1.0
	assert.deepEqual(argsForMode('on'), [{ type: 'i', value: 1 }])
	assert.deepEqual(argsForMode('off'), [{ type: 'i', value: 0 }])
	assert.deepEqual(argsForMode('bogus'), [])
	assert.deepEqual(
		MODE_CHOICES.map((c) => c.id),
		['toggle', 'on', 'off']
	)
})

test('unsubscribe args: (i port, s ip), the order of subscribe', () => {
	assert.deepEqual(unsubscribeArgs(4687, '10.0.0.5'), [
		{ type: 'i', value: 4687 },
		{ type: 's', value: '10.0.0.5' },
	])
})

test('modeArgs: fresh and equal = nothing, fresh and different = send, stale = send', () => {
	const { modeArgs, FRESH_MS } = require('../protocol')
	const now = 100000
	const fresh = now - 1000
	assert.equal(modeArgs('on', true, fresh, now), null)
	assert.equal(modeArgs('off', false, fresh, now), null)
	assert.deepEqual(modeArgs('on', false, fresh, now), [{ type: 'i', value: 1 }])
	assert.deepEqual(modeArgs('off', true, fresh, now), [{ type: 'i', value: 0 }])
	// stale or never received: send even if the mirror says equal
	assert.deepEqual(modeArgs('on', true, now - FRESH_MS - 1, now), [{ type: 'i', value: 1 }])
	assert.deepEqual(modeArgs('off', false, 0, now), [{ type: 'i', value: 0 }])
	assert.equal(modeArgs('on', true, now - FRESH_MS, now), null) // boundary: still fresh
	// toggle is never skipped
	assert.deepEqual(modeArgs('toggle', true, fresh, now), [])
	assert.deepEqual(modeArgs(undefined, false, fresh, now), [])
})
