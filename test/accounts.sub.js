"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];

// jshint mocha:true
// jshint expr:true

module.exports = () => {

	let accounts = require('../')(root, login, pass).accounts;
	const tac = 'random-test-'+(new Date()).getTime();

	it('exposes core methods', () => {
		expect(accounts.get)
			.to.be.a('function');

		expect(accounts.list)
			.to.be.a('function');

		expect(accounts.save)
			.to.be.a('function');

		expect(accounts.remove)
			.to.be.a('function');
	});

	describe('get method', () => {

		it('throws if an account name is not provided', async () => {
			try {
				let account = await accounts.get();
				expect( account )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('account name is required');
			}
		});

		it('get method throws if the account does not exist', async () => {
			try {
				let account = await accounts.get(tac);
				expect( account )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Not Found');
			}
		});

		it('get method does not throw if an account name is provided', async () => {
			// this is an account that does, in fact, exist
			let account = await accounts.get('test-co');

			expect( account )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("accountName");
		});

	});

	describe('list method', () => {

		it('throws an error when attempting to lists accounts', async () => {
			try {
				let list = await accounts.list();
				expect( list )
					.to.not.exist;
			} catch (e) {
				expect(e.status)
					.to.equal(403);

				expect(e.message)
					.to.include('Forbidden');
			}
		});

	});

	describe('save method', () => {

		it('throws if an account name is not provided', async () => {
			try {
				let account = await accounts.save();
				expect( account )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('account name is required');
			}
		});

		it('throws if some account data is not provided', async () => {
			try {
				let account = await accounts.save(tac);
				expect( account )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Some data (obj) is required');
			}
		});

		it('can save an account', async () => {
			let account = {
				alias: 'test',
				timeZone: 'America/Denver',
				enabled: true
			};
			account = await accounts.save(tac, account);
			expect( account )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("accountName");

			expect(account.accountName)
				.to.equal(tac);
		});

	});

	describe('remove method', () => {

		it('throws if an account name is not provided', async () => {
			try {
				let account = await accounts.remove();
				expect( account )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('account name is required');
			}
		});

		it('can remove an account', async () => {
			let account = {
				alias: 'test',
				timeZone: 'America/Denver',
				enabled: true
			};
			account = await accounts.save(tac, account);
			expect( account )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("accountName");

			expect(account.accountName)
				.to.equal(tac);
		});

	});

	describe('instance', () => {

		const itac = 'random-test-'+(new Date()).getTime();

		let account = {
			alias: 'test',
			timeZone: 'America/Denver',
			enabled: true
		};

		before(async () => {
			account = await accounts.save(itac, account);
		});

		after(async () => {
			try {
				await accounts.remove(itac);
			} catch (ignore) { /* intentionally ignored */ }
		});

		it('provides a save method', () => {
			expect(account.save)
				.to.be.a('function');
		});

		it('provides a remove method', () => {
			expect(account.remove)
				.to.be.a('function');
		});

		describe('save', () => {
			it('saves itself', async () => {
				account.alias = 'modified';
				account = await account.save();
				expect(account.alias)
					.to.equal('modified');
			});
		});

		describe('remove', () => {
			it('removes itself', async () => {
				await account.remove();
				try {
					let account = await accounts.get(itac);
					expect( account )
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

	/* Users */
	describe('Users', require('./users.sub.js'));

	/* Nodes */
	describe('Nodes', require('./users.sub.js'));

	/* Library */
	describe('Library', require('./users.sub.js'));
};
