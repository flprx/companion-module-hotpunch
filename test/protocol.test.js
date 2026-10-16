'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { OUT } = require('../osc-addresses')
const { BOOL_FIELDS, createState, applyStateMessage, variableValues, subscribeArgs } = require('../protocol')

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
