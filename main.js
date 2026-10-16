const { InstanceBase, InstanceStatus, runEntrypoint, Regex } = require('@companion-module/base')
const osc = require('osc')
const os = require('os')

const { sendThenClose } = require('./transport')
const { getActions } = require('./actions')
const { getFeedbacks } = require('./feedbacks')
const { getVariables } = require('./variables')
const { getPresets } = require('./presets')
const { IN, STATE_PREFIX } = require('./osc-addresses')
const { createState, applyStateMessage, variableValues, subscribeArgs, unsubscribeArgs } = require('./protocol')

// HotPunch prunes a subscriber it hasn't heard from in ~10s, so we re-announce
// our subscription well inside that window.
const RESUBSCRIBE_INTERVAL_MS = 5000
// HotPunch heartbeats every ~2s; if we miss several we consider the link stale.
const STALE_AFTER_MS = 7000

class HotPunchInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Mirror of HotPunch's published state (drives feedbacks + variables).
		this.state = createState()
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
		await this.teardownOsc(true)
	}

	async configUpdated(config) {
		// Unsubscribe with the OLD port and IP, then take the new config.
		await this.teardownOsc(true)
		this.config = config
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

	// Async: the socket is closed only after the unsubscribe has left, so the
	// caller can reopen the same feedback port afterwards.
	async teardownOsc(unsubscribe) {
		if (this.resubTimer) {
			clearInterval(this.resubTimer)
			this.resubTimer = undefined
		}
		if (this.staleTimer) {
			clearInterval(this.staleTimer)
			this.staleTimer = undefined
		}
		// Forget the mirrored state: after a config change the next HotPunch may be
		// another machine, and the On/Off guard must not decide on the old one.
		this.state = createState()
		this.lastHeartbeatTs = 0
		const udp = this.udp
		const sent = this.subscribedAs
		this.udp = undefined
		this.subscribedAs = undefined
		if (!udp) return
		// Unsubscribe with the (port, ip) pair that subscribe() really sent: the
		// config may have changed and the auto-detected IP may differ by now.
		if (unsubscribe && sent) {
			await sendThenClose(udp, IN.Unsubscribe, unsubscribeArgs(sent.port, sent.ip))
		} else {
			try {
				udp.close()
			} catch (e) {
				// ignore
			}
		}
	}

	subscribe() {
		// HotPunch's OSCReceiver cannot read the sender, so we announce both our
		// return port and IP.
		const port = this.config.feedbackPort
		const ip = this.localFeedbackIp()
		this.subscribedAs = { port, ip }
		this.send(IN.Subscribe, subscribeArgs(port, ip))
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
		if (applyStateMessage(this.state, a, arg) === null) return

		// A state field or the heartbeat: the link is alive, refresh feedbacks + variables.
		this.lastHeartbeatTs = Date.now()
		this.updateStatus(InstanceStatus.Ok)
		this.checkFeedbacks()
		this.pushVariables()
	}

	pushVariables() {
		this.setVariableValues(variableValues(this.state))
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

// Exported for the tests only; Companion loads the module through runEntrypoint.
module.exports = HotPunchInstance
