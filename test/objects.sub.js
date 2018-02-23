"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];

// jshint mocha:true
// jshint expr:true

module.exports = () => {

	let objects = null;
	let accounts = require('../')(root, login, pass).accounts;
	const tac = 'random-test-'+(new Date()).getTime();
	let tpc;

	let account = {
		accountName: tac,
		alias: 'test',
		timeZone: 'America/Denver',
		enabled: true
	};

	before(async () => {
		account = await accounts.save(account);
		let nodes = account.nodes;
		let node = await nodes.get('default');
		objects = node.objects;

		let object = await objects.save({
			profile: {
				firstName: 'Test',
				lastName: 'User'
			}
		});
		tpc = object.purlCode;
	});

	after(async () => {
		try {
			await account.remove();
		} catch (ignore) { /* intentionally ignored */ }
	});

	it('exposes core methods', () => {
		expect(objects.get)
			.to.be.a('function');

		expect(objects.list)
			.to.be.a('function');

		expect(objects.save)
			.to.be.a('function');

		expect(objects.remove)
			.to.be.a('function');
	});

	describe('get method', () => {

		it('throws if a purlCode is not provided', async () => {
			try {
				let object = await objects.get();
				expect( object )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('purlCode is required');
			}
		});

		it('get method throws if the object does not exist', async () => {
			try {
				let object = await objects.get('TestUser123');
				expect( object )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Not Found');
			}
		});

		it('get method does not throw if an purlCode is provided and it exists', async () => {
			let object = await objects.get(tpc);

			expect( object )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

		});

	});

	describe('list method', () => {

		it('lists objects', async () => {
			let list = await objects.list();

			expect( list )
				.to.exist.and
				.to.be.an('array').and
				.to.have.length.above(0);

			expect( list[0] )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");
		});

	});

	describe('save method', () => {
		let object = {
			profile: {
				firstName: 'Sam',
				lastName: 'Somebody',
				email: 'sams@test.com'
			}
		};

		it('throws if some object data is not provided', async () => {
			try {
				let object = await objects.save(null);
				expect( object )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Some data (obj) is required');
			}
		});

		it('can save a new object with profile data', async () => {
			object = await objects.save(object);

			expect( object )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

			expect(object.profile)
				.to.be.a('object').and
				.to.contain.all.keys("firstName", "lastName", "email");

			expect(object.purlCode)
				.to.be.a('string').and
				.to.have.length.above(1);
		});

		it('can save an object with properties data', async () => {
			object.properties.purlParent = 'test';
			object.properties.purlReferrer = 'test';
			object = await objects.save(object);

			expect( object )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

			expect(object.profile)
				.to.be.a('object').and
				.to.contain.all.keys("firstName", "lastName", "email");

			expect(object.purlCode)
				.to.be.a('string').and
				.to.have.length.above(1);

			expect(object.properties)
				.to.be.a('object').and
				.to.contain.all.keys("purlParent", "purlReferrer");

			expect(object.properties.purlParent)
				.to.be.a('string').and
				.to.equal("test");

			expect(object.properties.purlReferrer)
				.to.be.a('string').and
				.to.equal("test");
		});

		it('can save an object with attributes data', async () => {
			object.attributes.visited = 'yes';
			object.attributes.liked = 'no';
			object = await objects.save(object);

			expect( object )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

			expect(object.profile)
				.to.be.a('object').and
				.to.contain.all.keys("firstName", "lastName", "email");

			expect(object.purlCode)
				.to.be.a('string').and
				.to.have.length.above(1);

			expect(object.properties)
				.to.be.a('object').and
				.to.contain.all.keys("purlParent");

			expect(object.properties.purlParent)
				.to.be.a('string').and
				.to.equal("test");

			expect(object.attributes)
				.to.be.a('object').and
				.to.contain.all.keys("visited", "liked");

			expect(object.attributes.visited)
				.to.be.a('string').and
				.to.equal("yes");

			expect(object.attributes.liked)
				.to.be.a('string').and
				.to.equal("no");
		});

		it('can save an object with records data', async () => {
			object.records.survey = {
				'Your Name' : 'Test',
				'Your Email' : 'test@test.com',
				'What is your favorite color' : 'blue no green'
			};

			object = await objects.save(object);

			expect( object )
				.to.exist.and
				.to.be.a('object').and
				.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

			expect(object.records)
				.to.be.a('object').and
				.to.contain.all.keys("survey");

			expect(object.records.survey)
				.to.be.a('object').and
				.to.contain.all.keys("YourName", "YourEmail", "Whatisyourfavoritecolor", "created", "updated");
		});

	});

	describe('remove method', () => {

		it('throws if an purlCode is not provided', async () => {
			try {
				let object = await objects.remove();
				expect( object )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('purlCode is required');
			}
		});

		it('can remove an object', async () => {
			let object = await objects.remove(tpc);

			expect( object )
				.to.exist.and
				.to.be.a('object');

		});

	});

	describe('instance', () => {

		let object = null;

		before(async () => {
			let data = {
				profile: {
					firstName: 'Sam',
					lastName: 'Instance',
					email: 'sami@test.com'
				}
			};
			object = await objects.save(data);
		});

		after(async () => {
			try {
				await objects.remove(object.purlCode);
			} catch (ignore) { /* intentionally ignored */ }
		});

		it('provides a save method', () => {
			expect(object.save)
				.to.be.a('function');
		});

		it('provides a remove method', () => {
			expect(object.remove)
				.to.be.a('function');
		});

		describe('save', () => {
			it('saves itself', async () => {
				object.profile.firstName += '.is';
				object.profile.firstName +=  '.modified';
				object.profile.description = 'something nice';

				object.properties = {
					foo: 1,
					bar: 2
				};

				object.attributes = {
					baz: 3
				};

				object.records = {
					test: {
						approved: true
					}
				};

				object = await object.save();

				expect( object )
					.to.exist.and
					.to.be.a('object').and
					.to.contain.all.keys("purlCode", "profile", "properties", "attributes", "records");

				expect(object.profile)
					.to.be.a('object').and
					.to.contain.all.keys("firstName", "lastName", "email", "description");

				expect(object.properties)
					.to.be.a('object').and
					.to.contain.all.keys("foo", "bar");

				expect(object.attributes)
					.to.be.a('object').and
					.to.contain.all.keys("baz");

				expect(object.records)
					.to.be.a('object').and
					.to.contain.all.keys("test");

			});
		});

		describe('remove', () => {
			it('removes itself', async () => {
				await object.remove();
				try {
					object = await objects.get(object.purlCode);
					expect( object )
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
