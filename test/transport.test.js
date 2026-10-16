'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const dgram = require('node:dgram')
const osc = require('osc')
const { IN } = require('../osc-addresses')
const { unsubscribeArgs } = require('../protocol')
const { sendThenClose } = require('../transport')

test('sendThenClose: the unsubscribe packet really reaches the server, then the port closes', async () => {
	const server = dgram.createSocket('udp4')
	const received = new Promise((resolve) =>
		server.on('message', (buf) => resolve(osc.readPacket(buf, { metadata: true })))
	)
	await new Promise((r) => server.bind(0, '127.0.0.1', r))

	const udp = new osc.UDPPort({
		localAddress: '127.0.0.1',
		localPort: 0,
		remoteAddress: '127.0.0.1',
		remotePort: server.address().port,
		metadata: true,
	})
	await new Promise((r) => {
		udp.on('ready', r)
		udp.open()
	})

	await sendThenClose(udp, IN.Unsubscribe, unsubscribeArgs(4687, '10.0.0.5'))
	const pkt = await Promise.race([
		received,
		new Promise((_, rej) => setTimeout(() => rej(new Error('no packet received')), 1000)),
	]).finally(() => server.close())

	assert.equal(pkt.address, IN.Unsubscribe)
	assert.deepEqual(
		pkt.args.map((a) => [a.type, a.value]),
		[
			['i', 4687],
			['s', '10.0.0.5'],
		]
	)
	assert.throws(() => udp.socket.address()) // closed
})
