// Action definitions: each sends one OSC command to HotPunch. Break, sync and
// follow have a Mode option: Toggle (no argument, the default), On (1), Off (0).

const { IN } = require('./osc-addresses')
const { MODE_CHOICES, argsForMode } = require('./protocol')

const MODE_OPTION = {
	type: 'dropdown',
	id: 'mode',
	label: 'Mode',
	default: 'toggle',
	choices: MODE_CHOICES,
	tooltip: 'On/Off set the state (sending it twice changes nothing). HotPunch versions before F5d always toggle.',
}

function getActions(self) {
	const cmd = (address) => ({
		options: [],
		callback: () => self.send(address),
	})
	const settable = (address) => ({
		options: [MODE_OPTION],
		callback: (action) => self.send(address, argsForMode(action.options.mode)),
	})

	return {
		play: { name: 'Transport: Play', ...cmd(IN.Play) },
		stop: { name: 'Transport: Stop', ...cmd(IN.Stop) },
		transport_toggle: { name: 'Transport: Play/Stop toggle', ...cmd(IN.TransportToggle) },

		golive: {
			name: 'GO LIVE (arm-to-confirm)',
			description: 'First press arms (button shows armed), second press within the window confirms.',
			...cmd(IN.GoLive),
		},
		endlive: { name: 'END LIVE (to Standby)', ...cmd(IN.EndLive) },

		break_all: { name: 'Breakaway: ALL', ...settable(IN.BreakAll) },
		break_me1: { name: 'Breakaway: M/E 1', ...settable(IN.BreakMe1) },
		break_me2: { name: 'Breakaway: M/E 2', ...settable(IN.BreakMe2) },

		sync: { name: 'Sync (TC lock)', ...settable(IN.Sync) },

		cue_next: { name: 'Cue: Next', ...cmd(IN.CueNext) },
		cue_prev: { name: 'Cue: Previous', ...cmd(IN.CuePrev) },

		follow: { name: 'Follow playhead', ...settable(IN.Follow) },
	}
}

module.exports = { getActions }
