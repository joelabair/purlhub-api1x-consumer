"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.users');
const resdbg = require('debug')(debugPrefix+':accounts.users-response');

const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

// Accounts Users Endpoint
module.exports = function users(base, user, pass) {

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

	const req = request.agent()
		.use(throttle.plugin())
		.set('Accept', 'application/json')
		.auth(user, pass)
		.retry(3);

	const compose = function compose(data) {
		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object');

		if (!data.accountName || !data.login) {
			return data;
		}

		let descriptor = Object.getOwnPropertyDescriptors(data);

		descriptor.password = {
			get: function() {
				return this['passwd'];
			},
			set: function(v) {
				this['passwd'] = v;
			},
			configurable: false,
			enumerable: false
		};

		return Object.create({
			save: async function() {
				let name = this.id || null;
				return save(name, this);
			},
			remove: async function() {
				let name = this.id || null;
				return remove(name);
			},
			id: data.login
		},
		descriptor);
	};

	const get = async function get(name) {
		expect(name, 'A user name is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Getting User [%s].', name);
		let res = await req.get(base+'/users/'+name);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	const list = async function list() {
		debug('Scanning Users...');
		let res = await req.get(base+'/users/');
		resdbg('%O', res.body.response.data);
		return res.body.response.data.map(compose);
	};

	const save = async function save(name, data) {
		expect(name, 'A user name is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("roles", "passwd", "enabled", "locked", "timeZone", "screenName", "password", "newLogin");

		let _data = {};

		["roles", "passwd", "enabled", "locked", "timeZone", "screenName", "password", "newLogin"].forEach(n => {
			if (n === 'roles') {
				if (Array.isArray(data[n])) {
					data[n] = data[n].join(',');
				}
			}
			if (data[n]) _data[n] = data[n];
		});

		if (name !== data.login) {
			_data.newLogin = data.login;
		}

		debug('Saving User [%s] w/ %O', name, _data);
		let res = await req.post(base+'/users/'+name).send(_data);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	const remove = async function remove(name) {
		expect(name, 'A user name is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing User [%s].', name);
		let res = await req.del(base+'/users/'+name);
		resdbg('%O', res.body.response.data);
		return res.body.response.data;
	};

	debug('Attached child @ %s.', base);

	return {
		get: get,
		list: list,
		save: save,
		remove: remove
	};
};
