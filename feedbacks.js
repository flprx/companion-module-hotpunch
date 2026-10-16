const C = require('./colors')

// Boolean feedbacks: each returns true/false from the mirrored state and applies
// defaultStyle when true. Colours come from colors.js, generated from HotPunch's
// palette (tokens.json): the same state has the same colour in the app and on
// the buttons.

function getFeedbacks(self) {
	const s = () => self.state

	return {
		armed: {
			type: 'boolean',
			name: 'GO LIVE armed (awaiting confirm)',
			defaultStyle: { bgcolor: C.STANDBY, color: C.TEXT_ON_STANDBY },
			options: [],
			callback: () => s().armed,
		},
		on_air: {
			type: 'boolean',
			name: 'On air (LIVE)',
			defaultStyle: { bgcolor: C.ON_AIR, color: C.TEXT_PRIMARY },
			options: [],
			callback: () => s().mode === 'live',
		},
		in_break: {
			type: 'boolean',
			name: 'In BREAK (any)',
			defaultStyle: { bgcolor: C.BREAK, color: C.TEXT_PRIMARY },
			options: [],
			callback: () => s().mode === 'break',
		},
		standby: {
			type: 'boolean',
			name: 'Standby',
			defaultStyle: { bgcolor: C.STANDBY, color: C.TEXT_ON_STANDBY },
			options: [],
			callback: () => s().mode === 'standby',
		},

		break_all_active: {
			type: 'boolean',
			name: 'Breakaway ALL active',
			defaultStyle: { bgcolor: C.BREAK, color: C.TEXT_PRIMARY },
			options: [],
			callback: () => s().break_all,
		},
		break_me1_active: {
			type: 'boolean',
			name: 'Breakaway M/E 1 active',
			defaultStyle: { bgcolor: C.BREAK, color: C.TEXT_PRIMARY },
			options: [],
			callback: () => s().break_me1,
		},
		break_me2_active: {
			type: 'boolean',
			name: 'Breakaway M/E 2 active',
			defaultStyle: { bgcolor: C.BREAK, color: C.TEXT_PRIMARY },
			options: [],
			callback: () => s().break_me2,
		},

		// "Unavailable" feedbacks let a button dim/grey itself when the breakaway
		// isn't actionable in the current state (HotPunch is the source of truth
		// for availability: Live/Break, and M/E 2 only when dual M/E is on).
		break_all_unavailable: {
			type: 'boolean',
			name: 'Breakaway ALL unavailable (dim)',
			defaultStyle: { bgcolor: C.SURFACE3, color: C.OFFLINE },
			options: [],
			callback: () => !s().avail_break_all,
		},
		break_me1_unavailable: {
			type: 'boolean',
			name: 'Breakaway M/E 1 unavailable (dim)',
			defaultStyle: { bgcolor: C.SURFACE3, color: C.OFFLINE },
			options: [],
			callback: () => !s().avail_break_me1,
		},
		break_me2_unavailable: {
			type: 'boolean',
			name: 'Breakaway M/E 2 unavailable (dim)',
			defaultStyle: { bgcolor: C.SURFACE3, color: C.OFFLINE },
			options: [],
			callback: () => !s().avail_break_me2,
		},

		sync_locked: {
			type: 'boolean',
			name: 'Sync (TC) locked',
			defaultStyle: { bgcolor: C.LIVE, color: C.TEXT_ON_LIVE },
			options: [],
			callback: () => s().sync,
		},
		playing: {
			type: 'boolean',
			name: 'Playing',
			defaultStyle: { bgcolor: C.LIVE, color: C.TEXT_ON_LIVE },
			options: [],
			callback: () => s().playing,
		},
		follow: {
			type: 'boolean',
			name: 'Follow playhead on',
			defaultStyle: { bgcolor: C.LIVE, color: C.TEXT_ON_LIVE },
			options: [],
			callback: () => s().follow,
		},
	}
}

module.exports = { getFeedbacks }
