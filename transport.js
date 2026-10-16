// UDP helpers that need a real socket, kept out of protocol.js (pure) and
// main.js (needs Companion) so the tests can load them.
'use strict'

const osc = require('osc')

// Safety net: dgram.send resolves the address asynchronously, so closing the
// socket right after send() cancels the datagram. We close from the send
// callback; if it never fires, after this long.
const CLOSE_TIMEOUT_MS = 200

// Send one last OSC message on an open osc.UDPPort, then close the port once
// the datagram has left (or after timeoutMs). Resolves when the port is closed.
function sendThenClose(udp, address, args, timeoutMs = CLOSE_TIMEOUT_MS) {
	return new Promise((resolve) => {
		let done = false
		let timer
		const finish = () => {
			if (done) return
			done = true
			clearTimeout(timer)
			try {
				udp.close()
			} catch (e) {
				// ignore
			}
			resolve()
		}
		try {
			if (!udp.socket) return finish()
			const buf = Buffer.from(osc.writePacket({ address, args }, { metadata: true }))
			timer = setTimeout(finish, timeoutMs)
			udp.socket.send(buf, 0, buf.length, udp.options.remotePort, udp.options.remoteAddress, finish)
		} catch (e) {
			finish()
		}
	})
}

module.exports = { sendThenClose, CLOSE_TIMEOUT_MS }
