'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const Module = require('node:module')

// main.js starts the Companion entrypoint on load: load it against a stub of
// @companion-module/base so the instance class can be tested on its own.
const realLoad = Module._load
Module._load = function (request, ...rest) {
	if (request === '@companion-module/base') {
		return {
			InstanceBase: class {},
			InstanceStatus: {},
			Regex: {},
			runEntrypoint: () => {},
		}
	}
	return realLoad.call(this, request, ...rest)
}
const HotPunchInstance = require('../main')
Module._load = realLoad

test('teardownOsc forgets the mirrored state and the heartbeat time', async () => {
	const inst = new HotPunchInstance({})
	inst.state.mode = 'live'
	inst.state.break_all = true
	inst.lastHeartbeatTs = Date.now()
	await inst.teardownOsc(true)
	assert.equal(inst.state.mode, 'offline')
	assert.equal(inst.state.break_all, false)
	assert.equal(inst.lastHeartbeatTs, 0)
})
