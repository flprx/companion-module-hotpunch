'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { IN } = require('../osc-addresses')
const { getActions } = require('../actions')

const SETTABLE = {
	break_all: IN.BreakAll,
	break_me1: IN.BreakMe1,
	break_me2: IN.BreakMe2,
	sync: IN.Sync,
	follow: IN.Follow,
}

test('settable actions: Mode option, default Toggle', () => {
	const actions = getActions({ send() {} })
	for (const id of Object.keys(SETTABLE)) {
		const opt = actions[id].options.find((o) => o.id === 'mode')
		assert.ok(opt, id)
		assert.equal(opt.type, 'dropdown')
		assert.equal(opt.default, 'toggle')
	}
})

test('settable actions send the argument of their mode', () => {
	for (const [id, address] of Object.entries(SETTABLE)) {
		for (const [mode, args] of [
			['toggle', []],
			['on', [{ type: 'i', value: 1 }]],
			['off', [{ type: 'i', value: 0 }]],
			[undefined, []],
		]) {
			const sent = []
			const actions = getActions({ send: (a, x = []) => sent.push({ a, x }) })
			actions[id].callback({ options: mode === undefined ? {} : { mode } })
			assert.deepEqual(sent, [{ a: address, x: args }], `${id} ${mode}`)
		}
	}
})

test('On/Off are skipped when the fresh mirrored state already matches', () => {
	for (const [id, field] of [
		['break_all', 'break_all'],
		['sync', 'sync'],
		['follow', 'follow'],
	]) {
		const sent = []
		const self = { state: { [field]: true }, lastHeartbeatTs: Date.now(), send: (a, x) => sent.push({ a, x }) }
		const actions = getActions(self)
		actions[id].callback({ options: { mode: 'on' } })
		assert.deepEqual(sent, [], `${id} on, already on`)
		actions[id].callback({ options: { mode: 'off' } })
		assert.equal(sent.length, 1, `${id} off, currently on`)
		self.lastHeartbeatTs = Date.now() - 60000
		actions[id].callback({ options: { mode: 'on' } })
		assert.equal(sent.length, 2, `${id} on, stale state`)
	}
})

test('On/Off are always sent when HotPunch announces protocol level 2', () => {
	const sent = []
	const self = {
		state: { break_all: true, proto: 2, protoTs: Date.now() },
		lastHeartbeatTs: Date.now(),
		send: (a, x) => sent.push({ a, x }),
	}
	getActions(self).break_all.callback({ options: { mode: 'on' } })
	assert.equal(sent.length, 1, 'on, already on, proto 2')
})
