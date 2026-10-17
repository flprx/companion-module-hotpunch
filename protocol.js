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
	state.proto = 0 // protocol level announced by HotPunch (0 = not announced)
	return state
}

// Apply one feedback message. Returns 'changed' for a state field,
// 'heartbeat' for the heartbeat, 'proto' for the protocol level, null for anything else (ignored).
function applyStateMessage(state, address, arg) {
	if (address === OUT.StateHeartbeat) return 'heartbeat'
	if (address === OUT.StateProto) {
		const n = typeof arg === 'number' ? arg : Number.NaN
		state.proto = Number.isInteger(n) && n > 0 ? n : 0
		return 'proto'
	}
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

// (i port, s ip): newer HotPunch removes only this subscriber. HotPunch 0.5.0 and earlier ignore unsubscribe altogether: the
// subscription then expires by itself after ~10 s.
function unsubscribeArgs(port, ip) {
	return subscribeArgs(port, ip)
}

// Mode of the settable commands (break/*, sync, follow). Toggle = no argument (also for buttons made before 1.1.0, which
// have no mode option); On/Off = i 1 / i 0, an idempotent set. HotPunch 0.5.0
// and earlier ignore the argument and toggle, hence modeArgs() below.
const MODE_CHOICES = [
	{ id: 'toggle', label: 'Toggle' },
	{ id: 'on', label: 'On' },
	{ id: 'off', label: 'Off' },
]

function argsForMode(mode) {
	if (mode === 'on') return [{ type: 'i', value: 1 }]
	if (mode === 'off') return [{ type: 'i', value: 0 }]
	return []
}

// The mirrored state counts as fresh if the last state message or heartbeat
// is at most this old. HotPunch heartbeats every ~2 s, so this tolerates two
// missed ones (main.js flags the link stale at 7 s).
const FRESH_MS = 5000

// From this protocol level (/hotpunch/state/proto) HotPunch sets On/Off
// explicitly and idempotently (F5e).
const EXPLICIT_SET_PROTO = 2

// What to send for a settable command, or null to send nothing. The guard only
// serves HotPunch that does not announce level 2 (0.5.0 and earlier, which
// toggle whatever the argument): there an On/Off whose target the fresh
// mirrored state already has is skipped, which is what makes On/Off correct
// while the feedback is alive. From level 2 the set is idempotent in HotPunch,
// so it is always sent (a fresh but wrong mirror cannot swallow an Off).
// Stale or unknown state: send, whatever the level.
function modeArgs(mode, current, lastStateTs, { now = Date.now(), proto = 0 } = {}) {
	const target = mode === 'on' ? true : mode === 'off' ? false : undefined
	if (target === undefined) return argsForMode(mode)
	const fresh = lastStateTs > 0 && now - lastStateTs <= FRESH_MS
	if (fresh && proto < EXPLICIT_SET_PROTO && typeof current === 'boolean' && current === target) return null
	return argsForMode(mode)
}

module.exports = {
	FRESH_MS,
	EXPLICIT_SET_PROTO,
	modeArgs,
	BOOL_FIELDS,
	MODE_CHOICES,
	createState,
	applyStateMessage,
	variableValues,
	subscribeArgs,
	unsubscribeArgs,
	argsForMode,
}
