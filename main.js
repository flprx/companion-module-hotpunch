const { InstanceBase, InstanceStatus, runEntrypoint, Regex } = require('@companion-module/base')
const osc = require('osc')
const os = require('os')

const { getActions } = require('./actions')
const { getFeedbacks } = require('./feedbacks')
const { getVariables } = require('./variables')
const { getPresets } = require('./presets')
const { IN, OUT, STATE_PREFIX } = require('./osc-addresses')

// HotPunch prunes a subscriber it hasn't heard from in ~10s, so we re-announce
// our subscription well inside that window.
const RESUBSCRIBE_INTERVAL_MS = 5000
// HotPunch heartbeats every ~2s; if we miss several we consider the link stale.
const STALE_AFTER_MS = 7000

class HotPunchInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Mirror of HotPunch's published state (drives feedbacks + variables).
		this.state = {
			mode: 'offline',
			armed: false,
			playing: false,
			sync: false,
			follow: false,
			dualme: false,
			break_all: false,
			break_me1: false,
			break_me2: false,
			avail_break_all: false,
			avail_break_me1: false,
			avail_break_me2: false,
		}
		this.lastHeartbeatTs = 0
	}

	async init(config) {
		this.config = config
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updatePresets()
		this.setupOsc()
	}

	async destroy() {
		this.teardownOsc(true)
	}

	async configUpdated(config) {
		this.config = config
		this.teardownOsc(true)
		this.setupOsc()
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'HotPunch OSC remote control',
				value:
					'Enable "OSC remote control" in HotPunch Settings > Tally/Web and set the same command port here. ' +
					'Feedback (button colours) is sent back to this machine; leave Feedback IP blank to auto-detect.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'HotPunch IP',
				width: 6,
				default: '127.0.0.1',
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'cmdPort',
				label: 'Command port (matches HotPunch)',
				width: 6,
				default: 4685,
				min: 1,
				max: 65535,
			},
			{
				type: 'number',
				id: 'feedbackPort',
				label: 'Feedback port (this machine listens here)',
				width: 6,
				default: 4686,
				min: 1,
				max: 65535,
			},
			{
				type: 'textinput',
				id: 'feedbackIp',
				label: 'Feedback IP (blank = auto-detect this machine)',
				width: 6,
				default: '',
			},
		]
	}

	// --- OSC transport -------------------------------------------------------

	localFeedbackIp() {
		if (this.config.feedbackIp && this.config.feedbackIp.trim() !== '') {
			return this.config.feedbackIp.trim()
		}
		// Auto-detect: first non-internal IPv4 (best-effort; override in config
		// if the machine has several interfaces and HotPunch is on another one).
		const ifaces = os.networkInterfaces()
		for (const name of Object.keys(ifaces)) {
			for (const ni of ifaces[name] || []) {
				if (ni.family === 'IPv4' && !ni.internal) return ni.address
			}
		}
		return '127.0.0.1'
	}

	setupOsc() {
		this.updateStatus(InstanceStatus.Connecting, 'Subscribing...')

		this.udp = new osc.UDPPort({
			localAddress: '0.0.0.0',
			localPort: this.config.feedbackPort,
			remoteAddress: this.config.host,
			remotePort: this.config.cmdPort,
			metadata: true,
		})

		this.udp.on('ready', () => {
			this.subscribe()
			this.resubTimer = setInterval(() => this.subscribe(), RESUBSCRIBE_INTERVAL_MS)
			// Watchdog: flag the link stale if HotPunch's heartbeat stops.
			this.staleTimer = setInterval(() => this.checkStale(), 2000)
		})

		this.udp.on('message', (msg) => this.onOscMessage(msg))

		this.udp.on('error', (err) => {
			this.log('error', 'OSC error: ' + err.message)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})

		this.udp.open()
	}

	teardownOsc(unsubscribe) {
		if (this.resubTimer) {
			clearInterval(this.resubTimer)
			this.resubTimer = undefined
		}
		if (this.staleTimer) {
			clearInterval(this.staleTimer)
			this.staleTimer = undefined
		}
		if (this.udp) {
			try {
				if (unsubscribe) this.send(IN.Unsubscribe, [{ type: 's', value: this.localFeedbackIp() }])
			} catch (e) {
				// ignore
			}
			try {
				this.udp.close()
			} catch (e) {
				// ignore
			}
			this.udp = undefined
		}
	}

	subscribe() {
		// HotPunch's OSCReceiver cannot read the sender, so we announce both our
		// return port and IP.
		this.send(IN.Subscribe, [
			{ type: 'i', value: this.config.feedbackPort },
			{ type: 's', value: this.localFeedbackIp() },
		])
	}

	// Public helper used by actions.js.
	send(address, args = []) {
		if (!this.udp) return
		try {
			this.udp.send({ address, args })
		} catch (e) {
			this.log('error', 'OSC send failed: ' + e.message)
		}
	}

	checkStale() {
		if (this.lastHeartbeatTs === 0) return
		if (Date.now() - this.lastHeartbeatTs > STALE_AFTER_MS) {
			this.updateStatus(InstanceStatus.Disconnected, 'No heartbeat from HotPunch')
		}
	}

	onOscMessage(msg) {
		const a = msg.address
		if (!a || a.indexOf(STATE_PREFIX) !== 0) return

		const arg = msg.args && msg.args.length > 0 ? msg.args[0].value : undefined
		const asBool = (v) => v === 1 || v === '1' || v === true

		switch (a) {
			case OUT.StateMode:
				this.state.mode = String(arg)
				break
			case OUT.StateArmed:
				this.state.armed = asBool(arg)
				break
			case OUT.StatePlaying:
				this.state.playing = asBool(arg)
				break
			case OUT.StateSync:
				this.state.sync = asBool(arg)
				break
			case OUT.StateFollow:
				this.state.follow = asBool(arg)
				break
			case OUT.StateDualme:
				this.state.dualme = asBool(arg)
				break
			case OUT.StateBreakAll:
				this.state.break_all = asBool(arg)
				break
			case OUT.StateBreakMe1:
				this.state.break_me1 = asBool(arg)
				break
			case OUT.StateBreakMe2:
				this.state.break_me2 = asBool(arg)
				break
			case OUT.StateAvailBreakAll:
				this.state.avail_break_all = asBool(arg)
				break
			case OUT.StateAvailBreakMe1:
				this.state.avail_break_me1 = asBool(arg)
				break
			case OUT.StateAvailBreakMe2:
				this.state.avail_break_me2 = asBool(arg)
				break
			case OUT.StateHeartbeat:
				this.lastHeartbeatTs = Date.now()
				this.updateStatus(InstanceStatus.Ok)
				break
			default:
				return
		}

		// A state field changed: refresh feedbacks + variables.
		this.lastHeartbeatTs = Date.now()
		this.updateStatus(InstanceStatus.Ok)
		this.checkFeedbacks()
		this.pushVariables()
	}

	pushVariables() {
		const s = this.state
		this.setVariableValues({
			mode: s.mode,
			armed: s.armed ? 'armed' : '',
			playing: s.playing ? 'playing' : 'stopped',
			sync: s.sync ? 'locked' : 'free',
			follow: s.follow ? 'on' : 'off',
			dual_me: s.dualme ? 'on' : 'off',
			break_all: s.break_all ? 'on' : 'off',
			break_me1: s.break_me1 ? 'on' : 'off',
			break_me2: s.break_me2 ? 'on' : 'off',
		})
	}

	// --- registration wrappers ----------------------------------------------

	updateActions() {
		this.setActionDefinitions(getActions(this))
	}
	updateFeedbacks() {
		this.setFeedbackDefinitions(getFeedbacks(this))
	}
	updateVariableDefinitions() {
		this.setVariableDefinitions(getVariables())
		this.pushVariables()
	}
	updatePresets() {
		this.setPresetDefinitions(getPresets())
	}
}

runEntrypoint(HotPunchInstance, [])
