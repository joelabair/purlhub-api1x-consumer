"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.nodes.objects');

const expect = require('chai').expect;
const validator = require('validator');
const request = require('superagent');
require('superagent-retry')(request);

async function _getBatch(req, base, filter, offset) {
	let params = {
		offset: offset
	};

	if (filter) {
		params.containsFilter = filter;
	}

	let res = await req.get(base+'/purlProfilesList').query(params);
	return [res.body.response.data, res.body.response.total];
}

// Accounts Nodes Object Endpoint
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

	const req = request.agent()
		.use(throttle.plugin())
		.set('Accept', 'application/json')
		.auth(user, pass)
		.retry(3);

	const compose = function compose(data) {
		if (!data || !data.purlCode) {
			return data;
		}

		return Object.create({
			save: async function() {
				let name = this.purlCode || null;
				return save(name, this);
			},
			remove: async function() {
				let name = this.purlCode || null;
				return remove(name);
			}
		},
		Object.getOwnPropertyDescriptors(data));
	};

	const get = async function get(name) {
		// jshint expr:true

		expect(name, 'A purlCode is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(validator.isEmail(name), 'A purlCode is required!')
			.to.be.false;

		let params = {
			'containsFilter': {
				'purlCode' : name
			}
		};

		debug('Getting Object [%s].', name);
		let res = await req.get(base+'/purlProfilesList').query(params);
		debug('%O', res.body.response.data[0]);
		return res.body.response.data[0];
	};

	const list = async function list(filter) {
		let data = [];

		debug('Scanning Objects...');
		let [batch, total] = await _getBatch(req, base, filter, 0);
		Array.prototype.push.apply(data, batch);

		if (total) {
			while(data.length < total) {
				[batch, total] = await _getBatch(req, base, filter, data.length);
				Array.prototype.push.apply(data, batch);
			}
		}

		debug('Found [%s] Objects...', total);

		batch = null;
		return data;
	};

	const save = async function save(code, data) {
		expect(code, 'A purlCode is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object');

		debug('Saving Object [%s].', code);
		let res = await req.post(base+'/purlProfile')
			.query({
				'purlCode': code
			})
			.send(data);
		debug('%O', res.body.response.data);
		return res.body.response.data;
	};

	const remove = async function remove(code) {
		expect(code, 'A purlCode is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing Object [%s].', code);
		let res = await req.del(base+'/purlProfile')
			.query({
				'purlCode': code
			});
		debug('%O', res.body.response.data);
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
