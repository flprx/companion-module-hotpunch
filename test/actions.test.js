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
