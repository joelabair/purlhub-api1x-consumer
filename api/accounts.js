"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts');

const validator = require('validator');
const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

var sanitize = function sanitize(data) {
	data = validator.toString(data);
	data = validator.stripLow(data);
	data = validator.trim(data);
	return data;
};

function trimSlashes (data) {
	if (data) {
		return validator.trim(sanitize(data), '/');
	}
	return data;
}

// Accounts Endpoint
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
		if (!data || !data.accountName) {
			return data;
		}

		let _base = base+`/admin/rest/accounts/${data.accountName}`;

		return Object.create({
			library: require('./library.js')(_base, user, pass),
			nodes: require('./nodes.js')(_base, user, pass),
			users: require('./users.js')(_base, user, pass),
			save: async function() {
				expect(this, 'This (obj) is required!')
					.to.exist.and
					.to.be.a('object').and
					.to.have.own.property('accountName');

				expect(this.accountName, 'A account name is required!')
					.to.exist.and
					.to.be.a('string')
					.and.to.have.length.above(1);

				let data = this;
				let name = data.accountName;

				debug('Saving Account [%s] w/ %O', name, data);
				let res = await req.post(base+'/admin/rest/accounts/'+name).send(data);
				debug('%O', res.body.response.data);
				return compose(res.body.response.data);
			},
			remove: async function() {
				expect(this, 'This (obj) is required!')
					.to.exist.and
					.to.be.a('object').and
					.to.have.own.property('accountName');

				expect(this.accountName, 'A account name is required!')
					.to.exist.and
					.to.be.a('string')
					.and.to.have.length.above(1);

				let data = this;
				let name = data.accountName;

				debug('Removing Account [%s].', name);
				let res = await req.del(base+'/admin/rest/accounts/'+name);
				debug('%O', res.body.response.data);
				return res.body.response.data;
			}
		},
		Object.getOwnPropertyDescriptors(data));
	};

	debug('Attached child @ %s.', base);

	return {
		get: async function(name) {
			name = trimSlashes(name);

			expect(name, 'A account name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Getting Account [%s].', name);
			let res = await req.get(base+'/admin/rest/accounts/'+name);
			debug('%O', res.body.response.data);
			return compose(res.body.response.data);
		},

		list: async function() {
			debug('Scanning Accounts...');
			let res = await req.get(base+'/admin/rest/accounts/');
			debug('%O', res.body.response.data);
			return res.body.response.data.map(compose); // array of objects
		},

		save: async function(name, data) {
			name = trimSlashes(name);

			expect(name, 'A account name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			expect(data, 'Some data (obj) is required!')
				.to.exist.and
				.to.be.a('object');

			debug('Saving Account [%s] w/ %O', name, data);
			let res = await req.post(base+'/admin/rest/accounts/'+name).send(data);
			debug('%O', res.body.response.data);
			return compose(res.body.response.data);
		},

		remove: async function(name) {
			name = trimSlashes(name);

			expect(name, 'A account name is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Removing Account [%s].', name);
			let res = await req.del(base+'/admin/rest/accounts/'+name);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		}
	};
};
