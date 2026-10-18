const C = require('./colors')
const { PVW_PAGE_FOR_ME, PLACEHOLDERS } = require('./switcher-pages')

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

const PLACEHOLDER_CATEGORY = 'Switcher pages (placeholders)'

// No actions: the user adds the one of their own switcher module.
function placeholder(me, p) {
	const page = PVW_PAGE_FOR_ME[me]
	return {
		type: 'button',
		category: PLACEHOLDER_CATEGORY,
		name: `${p.label} - M/E ${me} (page ${page}, row ${p.row}, col ${p.col})`,
		style: { text: p.label.replace(/^PVW /, 'PVW\\n'), size: '14', color: C.TEXT_PRIMARY, bgcolor: C.BASE },
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}
}

function placeholderPresets() {
	const out = {}
	for (const me of [1, 2]) for (const p of PLACEHOLDERS) out[`pvw_me${me}_${p.id}`] = placeholder(me, p)
	out.switcher_pages_about = {
		type: 'text',
		category: PLACEHOLDER_CATEGORY,
		name: 'About these buttons',
		text: "These buttons have no actions. Drag each one to the page, row and column in its name, then add the matching action of your switcher's own Companion module.",
	}
	return out
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

		...placeholderPresets(),
	}
}

module.exports = { getPresets }
