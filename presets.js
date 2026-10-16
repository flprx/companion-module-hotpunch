const C = require('./colors')

// Ready-made buttons. Feedbacks colour them live from HotPunch state.

function btn(category, name, text, actionId, feedbacks = [], bgcolor = C.BASE) {
	return {
		type: 'button',
		category,
		name,
		style: { text, size: '14', color: C.TEXT_PRIMARY, bgcolor },
		steps: [{ down: [{ actionId, options: {} }], up: [] }],
		feedbacks,
	}
}

function getPresets() {
	const fb = (feedbackId) => ({ feedbackId, options: {} })

	return {
		go_live: btn('Transport', 'GO LIVE', 'GO\\nLIVE', 'golive', [fb('armed'), fb('on_air')]),
		end_live: btn('Transport', 'END LIVE', 'END\\nLIVE', 'endlive', [fb('standby')]),
		play: btn('Transport', 'Play', 'PLAY', 'play', [fb('playing')]),
		stop: btn('Transport', 'Stop', 'STOP', 'stop'),
		cue_next: btn('Transport', 'Next cue', 'CUE +', 'cue_next'),
		cue_prev: btn('Transport', 'Previous cue', 'CUE -', 'cue_prev'),

		break_all: btn('Breakaway', 'Breakaway ALL', 'BRK\\nALL', 'break_all', [
			fb('break_all_active'),
			fb('break_all_unavailable'),
		]),
		break_me1: btn('Breakaway', 'Breakaway M/E 1', 'BRK 1', 'break_me1', [
			fb('break_me1_active'),
			fb('break_me1_unavailable'),
		]),
		break_me2: btn('Breakaway', 'Breakaway M/E 2', 'BRK 2', 'break_me2', [
			fb('break_me2_active'),
			fb('break_me2_unavailable'),
		]),

		sync: btn('Sync & View', 'Sync TC lock', 'SYNC', 'sync', [fb('sync_locked')]),
		follow: btn('Sync & View', 'Follow playhead', 'FOLLOW', 'follow', [fb('follow')]),
	}
}

module.exports = { getPresets }
