// Variables expose HotPunch's state so users can build custom button text.

function getVariables() {
	return [
		{ variableId: 'mode', name: 'Operational mode (offline/standby/live/break)' },
		{ variableId: 'armed', name: 'GO LIVE armed (armed/empty)' },
		{ variableId: 'playing', name: 'Transport (playing/stopped)' },
		{ variableId: 'sync', name: 'Sync TC (locked/free)' },
		{ variableId: 'follow', name: 'Follow playhead (on/off)' },
		{ variableId: 'dual_me', name: 'Dual M/E enabled (on/off)' },
		{ variableId: 'break_all', name: 'Breakaway ALL (on/off)' },
		{ variableId: 'break_me1', name: 'Breakaway M/E 1 (on/off)' },
		{ variableId: 'break_me2', name: 'Breakaway M/E 2 (on/off)' },
	]
}

module.exports = { getVariables }
