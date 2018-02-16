"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.users');
const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

// Accounts Users Endpoint
module.exports = function(base, user, pass) {

	expect(base, 'A baseURI is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1)
		.and.to.match(/api(-dvlp)?\.purlhub\.(com|local)/);

	expect(user, 'A login required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1);

	expect(pass, 'A password is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1);

	const throttle = require('./throttle.js');

	let req = request.agent()
		.use(throttle.plugin())
		.set('Accept', 'application/json')
		.auth(user, pass)
		.retry(3);

	let compose = function(data) {
		if (!data || !data.accountName || !data.login) {
			return data;
		}

		// prototype utility methods
		return Object.create({
			save: async function() {
				expect(this, 'This (obj) is required!')
					.to.exist.and
					.to.be.a('object').and
					.to.have.own.property('login');

				expect(this.login, 'A account name is required!')
					.to.exist.and
					.to.be.a('string')
					.and.to.have.length.above(1);

				let data = this;
				let name = data.login;

				debug('Saving User [%s] w/ %O', name, data);
				let res = await req.post(base+'/users/'+name).send(data);
				debug('%O', res.body.response.data);
				return compose(res.body.response.data);
			},
			remove: async function() {
				expect(this, 'This (obj) is required!')
					.to.exist.and
					.to.be.a('object').and
					.to.have.own.property('login');

				expect(this.login, 'A account name is required!')
					.to.exist.and
					.to.be.a('string')
					.and.to.have.length.above(1);

				let data = this;
				let name = data.login;

				debug('Removing User [%s].', name);
				let res = await req.del(base+'/users/'+name);
				debug('%O', res.body.response.data);
				return res.body.response.data;
			}
		},
		Object.getOwnPropertyDescriptors(data));
	};

	debug('Attached child @ %s.', base);

	return {
		get: async function(name) {
			expect(name, 'A user name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Getting User [%s].', name);
			let res = await req.get(base+'/users/'+name);
			debug('%O', res.body.response.data);
			return compose(res.body.response.data);
		},

		list: async function() {
			debug('Scanning Users...');
			let res = await req.get(base+'/users/');
			debug('%O', res.body.response.data);
			return res.body.response.data.map(compose);
		},

		save: async function(name, data) {
			expect(name, 'A user name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			expect(data, 'Some data (obj) is required!')
				.to.exist.and
				.to.be.a('object');

			debug('Saving User [%s] w/ %O', name, data);
			let res = await req.post(base+'/users/'+name).send(data);
			debug('%O', res.body.response.data);
			return compose(res.body.response.data);
		},

		remove: async function(name) {
			expect(name, 'A user name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Removing User [%s].', name);
			let res = await req.del(base+'/users/'+name);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		}
	};
};
