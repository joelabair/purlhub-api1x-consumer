"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.nodes');
const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

function trimSlashes (path) {
	if (path) {
		return String(path).trim(path).replace(/(^\/|\/$)/g,'');
	}
	return path;
}

// Accounts Nodes Endpoint
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
		if (!data || !data.nodeName) {
			return data;
		}

		let _pObjBase = base.replace('/admin/rest/accounts/', '/admin/rest/');
		_pObjBase += '/'+trimSlashes(data.nodePath);

		if(Array.isArray(data.childNodes)) {
			data.childNodes = data.childNodes.map(compose);
		}

		return Object.create({
			objects: require('./objects.js')(_pObjBase, user, pass)
		},
		Object.getOwnPropertyDescriptors(data));
	};

	debug('Attached child @ %s.', base);

	return {
		get: async function(path) {
			path = trimSlashes(path);

			expect(path, 'A node path is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Getting Node [%s].', path);
			let res = await req.get(base+'/nodes/'+path);
			debug('%O', res.body.response.data[0]);
			return compose(res.body.response.data[0]);
		},

		list: async function() {
			debug('Scanning Nodes...');
			let res = await req.get(base+'/nodes/');
			debug('%O', res.body.response.data);
			return res.body.response.data.map(compose);
		},

		save: async function(path, data) {
			path = trimSlashes(path);

			expect(path, 'A node path is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			expect(data, 'Some data (obj) is required!')
				.to.exist.and
				.to.be.a('object');

			debug('Saving Node [%s] w/ %O', path, data);
			let res = await req.post(base+'/nodes/'+path).send(data);
			debug('%O', res.body.response.data);
			return compose(res.body.response.data);
		},

		remove: async function(path) {
			path = trimSlashes(path);

			expect(path, 'A node path is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Removing Node [%s].', path);
			let res = await req.del(base+'/nodes/'+path);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		}
	};
};
