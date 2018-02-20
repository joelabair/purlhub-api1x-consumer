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

	const req = request.agent()
		.use(throttle.plugin())
		.set('Accept', 'application/json')
		.auth(user, pass)
		.retry(3);

	const compose = function compose(data) {
		if (!data || !data.nodeName) {
			return data;
		}

		let _pObjBase = base.replace('/admin/rest/accounts/', '/admin/rest/');
		_pObjBase += '/'+trimSlashes(data.nodePath);

		if(Array.isArray(data.childNodes)) {
			data.childNodes = data.childNodes.map(compose);
		}

		let descriptor = Object.getOwnPropertyDescriptors(data);

		descriptor.classification = {
			get: function() {
				return this['nodeClass'];
			},
			set: function(v) {
				this['nodeClass'] = v;
			},
			configurable: false,
			enumerable: false
		};

		return Object.create({
			objects: require('./objects.js')(_pObjBase, user, pass),
			save: async function() {
				let name = this.id || null;
				return save(name, this);
			},
			remove: async function() {
				let name = this.id || null;
				return remove(name);
			},
			id: data.nodePath,
			original: data.nodeName
		},
		descriptor);
	};

	const get = async function get(path) {
		path = trimSlashes(path);

		expect(path, 'A node path is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Getting Node [%s].', path);
		let res = await req.get(base+'/nodes/'+path);
		debug('%O', res.body.response.data[0]);
		return compose(res.body.response.data[0]);
	};

	const list = async function list() {
		debug('Scanning Nodes...');
		let res = await req.get(base+'/nodes/');
		debug('%O', res.body.response.data);
		return res.body.response.data.map(compose);
	};

	const save = async function save(path, data) {
		path = trimSlashes(path);

		expect(path, 'A node path is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("classification", "status", "description", "newName");

		let _data = {};

		if (data.original !== data.nodeName) {
			data.newName = data.nodeName;
		}

		["classification", "status", "description", "newName"].forEach(n => {
			if (data[n]) _data[n] = data[n];
		});

		debug('Saving Node [%s] w/ %O', path, _data);
		let res = await req.post(base+'/nodes/'+path).send(_data);
		debug('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	const remove = async function remove(path) {
		path = trimSlashes(path);

		expect(path, 'A node path is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing Node [%s].', path);
		let res = await req.del(base+'/nodes/'+path);
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
