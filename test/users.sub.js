"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];

// jshint mocha:true
// jshint expr:true

module.exports = () => {

	let users = null;
	let accounts = require('../')(root, login, pass).accounts;
	const utac = 'random-test-'+(new Date()).getTime();

	let account = {
		alias: 'test',
		timeZone: 'America/Denver',
		enabled: true
	};

	before(async () => {
		account = await accounts.save(utac, account);
		users = account.users;
		await users.save({login: 'test@test.com', password: '12345678', screenName: 'TEST'});
	});

	after(async () => {
		try {
			await account.remove();
		} catch (ignore) { /* intentionally ignored */ }
	});

	it('exposes core methods', () => {
		expect(users.get)
			.to.be.a('function');

		expect(users.list)
			.to.be.a('function');

		expect(users.save)
			.to.be.a('function');

		expect(users.remove)
			.to.be.a('function');
	});

	describe('get method', () => {

		it('throws if a user name is not provided', async () => {
			try {
				let user = await users.get();
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('user name is required');
			}
		});

		it('get method throws if the user does not exist', async () => {
			try {
				let user = await users.get('none@test.com');
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Not Found');
			}
		});

		it('get method does not throw if an user name is provided and it exists', async () => {
			let user = await users.get('test@test.com');

			expect( user )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("login", "roles", "enabled", "locked", "timeZone", "screenName", "accountName");

		});

	});

	describe('list method', () => {

		it('lists users', async () => {
			let list = await users.list();

			expect( list )
				.to.exist.and
				.to.be.an('array').and
				.to.have.length.above(0);

			expect( list[0] )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("login", "roles", "enabled", "locked", "timeZone", "screenName", "accountName");
		});

	});

	describe('save method', () => {

		it('throws if some user data is not provided', async () => {
			try {
				let user = await users.save();
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Some data (obj) is required');
			}
		});

		it('throws if a password is not provided', async () => {
			let data = {
				login: 'new@test.com',
				screenName: 'TEST',
				timeZone: 'America/Denver',
				enabled: true
			};
			try {
				let user = await users.save(data);
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.status)
					.to.equal(400);

				expect(e.message)
					.to.include('Bad Request');
			}
		});

		it('throws if a password is not long enough', async () => {
			let data = {
				login: 'new@test.com',
				password: '1234567',
				enabled: true,
				screenName: 'TEST',
				timeZone: 'America/Denver'
			};
			try {
				let user = await users.save(data);
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.status)
					.to.equal(400);

				expect(e.message)
					.to.include('Bad Request');
			}
		});

		it('can save an user', async () => {
			let user = {
				login: 'new@test.com',
				screenName: 'TEST',
				timeZone: 'America/Denver',
				password: '12345678',
				enabled: true
			};
			user = await users.save(user);

			expect( user )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("login", "roles", "enabled", "locked", "timeZone", "screenName", "accountName");

			expect(user.login)
				.to.equal('new@test.com');
		});

	});

	describe('remove method', () => {

		it('throws if an user name is not provided', async () => {
			try {
				let user = await users.remove();
				expect( user )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('user name is required');
			}
		});

		it('can remove an user', async () => {
			let user = await users.remove('new@test.com');

			expect( user )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("login", "roles", "enabled", "locked", "timeZone", "screenName", "accountName");

		});

	});

	describe('instance', () => {

		let user = null;

		before(async () => {
			let data = {
				login: 'new@test.org',
				screenName: 'TEST',
				timeZone: 'America/Denver',
				password: '12345678',
				enabled: true
			};
			user = await users.save(data);
		});

		after(async () => {
			try {
				await users.remove('new@test.org');
			} catch (ignore) { /* intentionally ignored */ }
		});

		it('provides a save method', () => {
			expect(user.save)
				.to.be.a('function');
		});

		it('provides a remove method', () => {
			expect(user.remove)
				.to.be.a('function');
		});

		describe('save', () => {
			it('saves itself', async () => {
				user.login = 'mod-'+user.login;
				user.screenName += '.modified';
				user = await user.save();

				expect(user.login)
					.to.include('mod-');

				expect(user.screenName)
					.to.include('modified');
			});
		});

		describe('remove', () => {
			it('removes itself', async () => {
				await user.remove();
				try {
					user = await users.get(user.login);
					expect( user )
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

};
