'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8')

test('README has the generated switcher pages block', () => {
	const begin = readme.indexOf('<!-- BEGIN GENERATED companion-pages-readme')
	const end = readme.indexOf('<!-- END GENERATED companion-pages-readme -->')
	assert.ok(begin >= 0 && end > begin)
	const block = readme.slice(begin, end)
	for (const word of ['CAM 17-20', 'WHITE', 'MP 1-2', 'BLACK']) assert.ok(block.includes(word), word)
})

test('README says the placeholders have no actions', () => {
	assert.match(readme, /no actions/i)
})
