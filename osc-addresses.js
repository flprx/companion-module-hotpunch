// GENERATED - do not edit
// Source: docs/contracts/osc-schema.json (hotpunch repo) - regenerate with scripts/gen-contracts.py
'use strict'

module.exports = {
	IN: {
		Subscribe: '/hotpunch/subscribe',
		Unsubscribe: '/hotpunch/unsubscribe',
		Play: '/hotpunch/transport/play',
		Stop: '/hotpunch/transport/stop',
		TransportToggle: '/hotpunch/transport/toggle',
		GoLive: '/hotpunch/golive',
		EndLive: '/hotpunch/endlive',
		BreakAll: '/hotpunch/break/all',
		BreakMe1: '/hotpunch/break/me1',
		BreakMe2: '/hotpunch/break/me2',
		Sync: '/hotpunch/sync',
		CueNext: '/hotpunch/cue/next',
		CuePrev: '/hotpunch/cue/prev',
		Follow: '/hotpunch/follow',
	},
	OUT: {
		StateMode: '/hotpunch/state/mode',
		StateArmed: '/hotpunch/state/armed',
		StatePlaying: '/hotpunch/state/playing',
		StateSync: '/hotpunch/state/sync',
		StateFollow: '/hotpunch/state/follow',
		StateDualme: '/hotpunch/state/dualme',
		StateBreakAll: '/hotpunch/state/break/all',
		StateBreakMe1: '/hotpunch/state/break/me1',
		StateBreakMe2: '/hotpunch/state/break/me2',
		StateAvailBreakAll: '/hotpunch/state/avail/break_all',
		StateAvailBreakMe1: '/hotpunch/state/avail/break_me1',
		StateAvailBreakMe2: '/hotpunch/state/avail/break_me2',
		StateHeartbeat: '/hotpunch/state/heartbeat',
		StateProto: '/hotpunch/state/proto',
	},
	STATE_PREFIX: '/hotpunch/state',
}
