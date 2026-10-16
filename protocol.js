// Pure helpers of the HotPunch OSC protocol: no Companion, no sockets, so the
// tests can load them. main.js wires them to the UDP port and to Companion.
'use strict'

const { OUT } = require('./osc-addresses')

// /hotpunch/state/... address -> boolean field of the mirrored state
const BOOL_FIELDS = {
	[OUT.StateArmed]: 'armed',
	[OUT.StatePlaying]: 'playing',
	[OUT.StateSync]: 'sync',
	[OUT.StateFollow]: 'follow',
	[OUT.StateDualme]: 'dualme',
	[OUT.StateBreakAll]: 'break_all',
	[OUT.StateBreakMe1]: 'break_me1',
	[OUT.StateBreakMe2]: 'break_me2',
	[OUT.StateAvailBreakAll]: 'avail_break_all',
	[OUT.StateAvailBreakMe1]: 'avail_break_me1',
	[OUT.StateAvailBreakMe2]: 'avail_break_me2',
}

function createState() {
	const state = { mode: 'offline' }
	for (const field of Object.values(BOOL_FIELDS)) state[field] = false
	return state
}

// Apply one feedback message. Returns 'changed' for a state field,
// 'heartbeat' for the heartbeat, null for anything else (ignored).
function applyStateMessage(state, address, arg) {
	if (address === OUT.StateHeartbeat) return 'heartbeat'
	if (address === OUT.StateMode) {
		state.mode = String(arg)
		return 'changed'
	}
	const field = BOOL_FIELDS[address]
	if (!field) return null
	state[field] = arg === 1 || arg === '1' || arg === true
	return 'changed'
}

function variableValues(s) {
	return {
		mode: s.mode,
		armed: s.armed ? 'armed' : '',
		playing: s.playing ? 'playing' : 'stopped',
		sync: s.sync ? 'locked' : 'free',
		follow: s.follow ? 'on' : 'off',
		dual_me: s.dualme ? 'on' : 'off',
		break_all: s.break_all ? 'on' : 'off',
		break_me1: s.break_me1 ? 'on' : 'off',
		break_me2: s.break_me2 ? 'on' : 'off',
	}
}

// HotPunch's OSCReceiver cannot read the UDP sender: subscribe announces the
// return port and IP explicitly.
function subscribeArgs(port, ip) {
	return [
		{ type: 'i', value: port },
		{ type: 's', value: ip },
	]
}

module.exports = { BOOL_FIELDS, createState, applyStateMessage, variableValues, subscribeArgs }
