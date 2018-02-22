"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];

// jshint mocha:true
// jshint expr:true

module.exports = () => {

	let nodes = null;
	let accounts = require('../')(root, login, pass).accounts;
	const tac = 'random-test-'+(new Date()).getTime();

	let account = {
		alias: 'test',
		timeZone: 'America/Denver',
		enabled: true
	};

	before(async () => {
		account = await accounts.save(tac, account);
		nodes = account.nodes;
	});

	after(async () => {
		try {
			await accounts.remove(tac);
		} catch (ignore) { /* intentionally ignored */ }
	});

	it('exposes core methods', () => {
		expect(nodes.get)
			.to.be.a('function');

		expect(nodes.list)
			.to.be.a('function');

		expect(nodes.save)
			.to.be.a('function');

		expect(nodes.remove)
			.to.be.a('function');
	});

	describe('get method', () => {

		it('throws if an node name is not provided', async () => {
			try {
				let node = await nodes.get();
				expect( node )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('node path is required');
			}
		});

		it('get method throws if the node does not exist', async () => {
			try {
				let node = await nodes.get('none');
				expect( node )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Not Found');
			}
		});

		it('get method does not throw if an node name is provided', async () => {
			// this is an node that does, in fact, exist
			let node = await nodes.get('default');

			expect( node )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("nodeName", "nodePath", "nodeClass", "status", "description", "quota30", "purls", "records", "attributes", "created", "updated");

		});

	});

	describe('list method', () => {

		it('lists nodes', async () => {
			let list = await nodes.list();

			expect( list )
				.to.exist.and
				.to.be.an('array').and
				.to.have.length.above(0);

			expect( list[0] )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("nodeName", "nodePath", "nodeClass", "status", "description", "quota30", "purls", "records", "attributes", "created", "updated");
		});

	});

	describe('save method', () => {

		it('throws if an node path is not provided', async () => {
			try {
				let node = await nodes.save();
				expect( node )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('node path is required');
			}
		});

		it('throws if some node data is not provided', async () => {
			try {
				let node = await nodes.save('test-path');
				expect( node )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Some data (obj) is required');
			}
		});

		it('can save an node', async () => {
			let node = {
				status: 'draft',
				description: 'A test node',
				classification: 'test'
			};
			node = await nodes.save('test-path', node);
			expect( node )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("nodeName", "nodePath", "nodeClass", "status", "description", "quota30", "purls", "records", "attributes", "created", "updated");

			expect(node.nodeName)
				.to.equal('test-path');
		});

	});

	describe('remove method', () => {

		it('throws if an node path is not provided', async () => {
			try {
				let node = await nodes.remove();
				expect( node )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('node path is required');
			}
		});

		it('can remove an node', async () => {
			let node = await nodes.remove('test-path');
			expect( node )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("nodeName", "nodePath", "nodeClass", "status", "description", "quota30", "purls", "records", "attributes", "created", "updated");

			expect(node.nodeName)
				.to.equal('test-path');
		});

	});

	describe('instance', () => {

		let node = {
			status: 'draft',
			description: 'A test node',
			classification: 'test'
		};

		before(async () => {
			node = await nodes.save('test-path-instance', node);
		});

		after(async () => {
			try {
				await nodes.remove('test-path-instance');
			} catch (ignore) { /* intentionally ignored */ }
		});

		it('provides a save method', () => {
			expect(node.save)
				.to.be.a('function');
		});

		it('provides a remove method', () => {
			expect(node.remove)
				.to.be.a('function');
		});

		describe('save', () => {
			it('saves itself', async () => {
				node.nodeName += '-modified';
				node.description += ' modified';
				node = await node.save();

				expect(node.description)
					.to.include('modified');

				expect(node.nodeName)
					.to.include('modified');
			});
		});

		describe('remove', () => {
			it('removes itself', async () => {
				await node.remove();
				try {
					let node = await nodes.get('test-path-instance-modified');
					expect( node )
						.to.not.exist;
				} catch (e) {
					expect(e.status)
						.to.equal(404);

					expect(e.message)
						.to.include('Not Found');
				}
			});
		});

	});

	/* Objects */
	describe('Objects', require('./objects.sub.js'));
};
