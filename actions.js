// Action definitions: each sends one OSC command to HotPunch. Toggle-style
// commands send no argument (HotPunch treats a bare message as a toggle).

const { IN } = require('./osc-addresses')

function getActions(self) {
	const cmd = (address) => ({
		callback: () => self.send(address),
	})

	return {
		play: { name: 'Transport: Play', options: [], ...cmd(IN.Play) },
		stop: { name: 'Transport: Stop', options: [], ...cmd(IN.Stop) },
		transport_toggle: {
			name: 'Transport: Play/Stop toggle',
			options: [],
			...cmd(IN.TransportToggle),
		},

		golive: {
			name: 'GO LIVE (arm-to-confirm)',
			description: 'First press arms (button shows armed), second press within the window confirms.',
			options: [],
			...cmd(IN.GoLive),
		},
		endlive: { name: 'END LIVE (to Standby)', options: [], ...cmd(IN.EndLive) },

		break_all: { name: 'Breakaway: ALL (toggle)', options: [], ...cmd(IN.BreakAll) },
		break_me1: { name: 'Breakaway: M/E 1 (toggle)', options: [], ...cmd(IN.BreakMe1) },
		break_me2: { name: 'Breakaway: M/E 2 (toggle)', options: [], ...cmd(IN.BreakMe2) },

		sync: { name: 'Sync (TC lock) toggle', options: [], ...cmd(IN.Sync) },

		cue_next: { name: 'Cue: Next', options: [], ...cmd(IN.CueNext) },
		cue_prev: { name: 'Cue: Previous', options: [], ...cmd(IN.CuePrev) },

		follow: { name: 'Follow playhead toggle', options: [], ...cmd(IN.Follow) },
	}
}

module.exports = { getActions }
