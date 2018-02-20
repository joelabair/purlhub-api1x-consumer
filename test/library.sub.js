"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];

// jshint mocha:true
// jshint expr:true

module.exports = () => {

	let library = null;
	let accounts = require('../')(root, login, pass).accounts;
	const tac = 'random-test-'+(new Date()).getTime();

	before(async () => {
		let account = {
			alias: 'test',
			timeZone: 'America/Denver',
			enabled: true
		};
		account = await accounts.save(tac, account);
		library = account.library;
	});

	after(async () => {
		try {
			await accounts.remove(tac);
		} catch (ignore) { /* intentionally ignored */ }
	});

	it('exposes core methods', () => {
		expect(library.get)
			.to.be.a('function');

		expect(library.list)
			.to.be.a('function');

		expect(library.save)
			.to.be.a('function');

		expect(library.remove)
			.to.be.a('function');
	});

	describe('get method', () => {

		it('throws if a valid context is not provided', async () => {
			try {
				let file = await library.get();
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('context is required');
			}
		});

		it('throws if a filename is not provided', async () => {
			try {
				let file = await library.get('templates');
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('filename is required');
			}
		});

		it('get method throws if the file does not exist', async () => {
			try {
				let file = await library.get('templates', 'test');
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Not Found');
			}
		});

		it('get method does not throw if an filename is provided', async () => {
			// this is an file that does, in fact, exist as a global
			let file = await library.get('templates', 'email/default-profile-submission.html');

			expect( file )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("filename");
		});

	});

	describe('save method', () => {

		it('throws if a valid context is not provided', async () => {
			try {
				let file = await library.save();
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('context is required');
			}
		});

		it('throws if a filename is not provided', async () => {
			try {
				let file = await library.save('templates');
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('filename is required');
			}
		});

		it('throws if some file data is not provided', async () => {
			try {
				let file = await library.save('templates', 'some-test');
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('Some data (obj) is required');
			}
		});

		it('can save an file', async () => {
			let file = {
				contentType: 'text/plain',
				metadata: {
					description: 'A test template',
					author: 'test@test.com',
					sharing: ['__ALL__'],
					tags: ['mocha', 'test']
				},
				extra: {
					testingThis: true
				}
			};
			file = await library.save('templates', 'mocha-test.txt', file);
			expect( file )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("filename")
				.that.equals('mocha-test.txt');

			expect(file.metadata.accountName)
				.to.equal(tac);
		});

	});

	describe('list method', () => {

		it('lists files', async () => {
			let list = await library.list('templates', null, {_inclusive: true});

			expect( list )
				.to.exist.and
				.to.be.an('array');

		});

	});

	describe('remove method', () => {

		it('throws if a valid context is not provided', async () => {
			try {
				let file = await library.remove();
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('context is required');
			}
		});

		it('throws if a filename is not provided', async () => {
			try {
				let file = await library.remove('templates');
				expect( file )
					.to.not.exist;
			} catch (e) {
				expect(e.message)
					.to.include('filename is required');
			}
		});

		it('can remove an file', async () => {
			let file = await library.remove('templates', 'mocha-test.txt');
			expect( file )
				.to.exist.and
				.to.be.a('object').and
				.to.have.property("filename")
				.that.equals('mocha-test.txt');

			expect(file.metadata.accountName)
				.to.equal(tac);
		});

	});


	describe('instance', () => {

		let file = null;

		before(async () => {
			file = {
				contentType: 'text/plain',
				metadata: {
					description: 'A test template',
					author: 'test@test.com',
					sharing: ['__ALL__'],
					tags: ['mocha', 'test']
				},
				extra: {
					testingThis: true
				},
				utf8Content: 'one big test'
			};
			file = await library.save('templates', 'mocha-test-instance.txt', file);
		});

		after(async () => {
			try {
				await library.remove('templates', 'mocha-test-instance.txt');
			} catch (ignore) { /* intentionally ignored */ }
		});

		it('provides a save method', () => {
			expect(file.save)
				.to.be.a('function');
		});

		it('provides a remove method', () => {
			expect(file.remove)
				.to.be.a('function');
		});

		describe('save', () => {
			it('saves itself', async () => {
				file.metadata.description += '.modified';
				file.utf8Content = 'instance save test';
				file = await file.save();

				expect(file.metadata.description)
					.to.include('modified');

				expect(file.version)
					.to.be.above(1);

				file.filename = 'mod-'+file.filename;
				file = await file.save();

				expect(file.filename)
					.to.include('mod-');
			});
		});

		describe('remove', () => {
			it('removes itself', async () => {
				await file.remove();
				try {
					file = await library.get('templates', file.filename);
					expect( file )
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
