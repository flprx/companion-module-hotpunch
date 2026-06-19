const { combineRgb } = require('@companion-module/base')

// Boolean feedbacks: each returns true/false from the mirrored state and applies
// defaultStyle when true. Colours follow broadcast convention (red on-air,
// amber armed, orange break, green locked).

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)

function getFeedbacks(self) {
	const s = () => self.state

	return {
		armed: {
			type: 'boolean',
			name: 'GO LIVE armed (awaiting confirm)',
			defaultStyle: { bgcolor: combineRgb(245, 158, 11), color: BLACK },
			options: [],
			callback: () => s().armed,
		},
		on_air: {
			type: 'boolean',
			name: 'On air (LIVE)',
			defaultStyle: { bgcolor: combineRgb(220, 38, 38), color: WHITE },
			options: [],
			callback: () => s().mode === 'live',
		},
		in_break: {
			type: 'boolean',
			name: 'In BREAK (any)',
			defaultStyle: { bgcolor: combineRgb(234, 88, 12), color: WHITE },
			options: [],
			callback: () => s().mode === 'break',
		},
		standby: {
			type: 'boolean',
			name: 'Standby',
			defaultStyle: { bgcolor: combineRgb(30, 64, 175), color: WHITE },
			options: [],
			callback: () => s().mode === 'standby',
		},

		break_all_active: {
			type: 'boolean',
			name: 'Breakaway ALL active',
			defaultStyle: { bgcolor: combineRgb(234, 88, 12), color: WHITE },
			options: [],
			callback: () => s().break_all,
		},
		break_me1_active: {
			type: 'boolean',
			name: 'Breakaway M/E 1 active',
			defaultStyle: { bgcolor: combineRgb(234, 88, 12), color: WHITE },
			options: [],
			callback: () => s().break_me1,
		},
		break_me2_active: {
			type: 'boolean',
			name: 'Breakaway M/E 2 active',
			defaultStyle: { bgcolor: combineRgb(234, 88, 12), color: WHITE },
			options: [],
			callback: () => s().break_me2,
		},

		// "Unavailable" feedbacks let a button dim/grey itself when the breakaway
		// isn't actionable in the current state (HotPunch is the source of truth
		// for availability: Live/Break, and M/E 2 only when dual M/E is on).
		break_all_unavailable: {
			type: 'boolean',
			name: 'Breakaway ALL unavailable (dim)',
			defaultStyle: { bgcolor: combineRgb(40, 40, 40), color: combineRgb(120, 120, 120) },
			options: [],
			callback: () => !s().avail_break_all,
		},
		break_me1_unavailable: {
			type: 'boolean',
			name: 'Breakaway M/E 1 unavailable (dim)',
			defaultStyle: { bgcolor: combineRgb(40, 40, 40), color: combineRgb(120, 120, 120) },
			options: [],
			callback: () => !s().avail_break_me1,
		},
		break_me2_unavailable: {
			type: 'boolean',
			name: 'Breakaway M/E 2 unavailable (dim)',
			defaultStyle: { bgcolor: combineRgb(40, 40, 40), color: combineRgb(120, 120, 120) },
			options: [],
			callback: () => !s().avail_break_me2,
		},

		sync_locked: {
			type: 'boolean',
			name: 'Sync (TC) locked',
			defaultStyle: { bgcolor: combineRgb(22, 163, 74), color: WHITE },
			options: [],
			callback: () => s().sync,
		},
		playing: {
			type: 'boolean',
			name: 'Playing',
			defaultStyle: { bgcolor: combineRgb(13, 148, 136), color: WHITE },
			options: [],
			callback: () => s().playing,
		},
		follow: {
			type: 'boolean',
			name: 'Follow playhead on',
			defaultStyle: { bgcolor: combineRgb(2, 132, 199), color: WHITE },
			options: [],
			callback: () => s().follow,
		},
	}
}

module.exports = { getFeedbacks }
