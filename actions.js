// Action definitions: each sends one OSC command to HotPunch. Toggle-style
// commands send no argument (HotPunch treats a bare message as a toggle).

function getActions(self) {
	const cmd = (address) => ({
		callback: () => self.send(address),
	})

	return {
		play: { name: 'Transport: Play', options: [], ...cmd('/hotpunch/transport/play') },
		stop: { name: 'Transport: Stop', options: [], ...cmd('/hotpunch/transport/stop') },
		transport_toggle: {
			name: 'Transport: Play/Stop toggle',
			options: [],
			...cmd('/hotpunch/transport/toggle'),
		},

		golive: {
			name: 'GO LIVE (arm-to-confirm)',
			description: 'First press arms (button shows armed), second press within the window confirms.',
			options: [],
			...cmd('/hotpunch/golive'),
		},
		endlive: { name: 'END LIVE (to Standby)', options: [], ...cmd('/hotpunch/endlive') },

		break_all: { name: 'Breakaway: ALL (toggle)', options: [], ...cmd('/hotpunch/break/all') },
		break_me1: { name: 'Breakaway: M/E 1 (toggle)', options: [], ...cmd('/hotpunch/break/me1') },
		break_me2: { name: 'Breakaway: M/E 2 (toggle)', options: [], ...cmd('/hotpunch/break/me2') },

		sync: { name: 'Sync (TC lock) toggle', options: [], ...cmd('/hotpunch/sync') },

		cue_next: { name: 'Cue: Next', options: [], ...cmd('/hotpunch/cue/next') },
		cue_prev: { name: 'Cue: Previous', options: [], ...cmd('/hotpunch/cue/prev') },

		follow: { name: 'Follow playhead toggle', options: [], ...cmd('/hotpunch/follow') },
	}
}

module.exports = { getActions }
