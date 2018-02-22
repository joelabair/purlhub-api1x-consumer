"use strict";

// jshint expr:true

const debug = require('debug')('phRestClient-v1.0:accounts.nodes.objects');
const resdbg = require('debug')('phRestClient-v1.0:accounts.nodes.objects-response');

const md5 = require('md5');
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

function isPlainObject(o) {
	return !!o && typeof o === 'object' && !Array.isArray(o);
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
		if (!data) {
			let err = new Error('Not Found!');
			err.status = 404;
			throw err;
		}

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("purlCode", "profile", "properties", "attributes", "records");

		let hashmap = {
			profile: null,
			properties: null,
			attributes: null,
			records: {}
		};

		["profile", "properties", "attributes"].forEach(name => {
			if (!isPlainObject(data[name])) {
				data[name] = {};
			}
			hashmap[name] = md5(JSON.stringify(data[name]));
		});

		if (isPlainObject(data['records']) && Object.keys(data['records']).length) {
			Object.keys(data['records']).forEach(name => {
				hashmap['records'][name] = md5(JSON.stringify(data['records'][name]));
			});
		} else {
			data['records'] = {};
		}

		return Object.create({
			save: async function() {
				return save(this);
			},
			remove: async function() {
				let name = this.purlCode || null;
				return remove(name);
			},
			hashmap: hashmap
		},
		Object.getOwnPropertyDescriptors(data));
	};

	const get = async function get(name) {
		expect(name, 'A purlCode is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(validator.isEmail(name), 'A purlCode is required!')
			.to.be.false;

		let params = {
			'containsFilter': {
				'purlCode' : name
			},
			attachAttributes: 'all',
			attachRecords: 'all'
		};

		debug('Getting Object [%s].', name);
		let res = await req.get(base+'/purlProfilesList').query(params);
		resdbg('%O', res.body.response.data[0]);
		return compose(res.body.response.data[0]);
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
		return data.map(compose);
	};

	const save = async function save(data) {
		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("purlCode", "profile", "properties", "attributes", "records");

			let code = data.purlCode || null;

		if (code) {
			expect(code, 'A valid purlCode is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);
		}

		const epmap = {
			profile: (data) => {
				let _data = {
					profileData: {}
				};

				if (code) _data['purlCode'] = code;

				Object.keys(data).forEach(key => {
					_data['profileData'][key] = data[key];
				});

				return [base+'/purlProfile', _data];
			},
			properties: (data) => {
				let _data = {
					propertiesData: {},
					viewMode: 'inheritance'
				};

				if (code) _data['purlCode'] = code;

				Object.keys(data).forEach(key => {
					_data['propertiesData'][key] = data[key];
				});

				return [base+'/purlProperties', _data];
			},
			attributes:  (data) => {
				let _data = {};

				if (code) _data['purlCode'] = code;

				Object.keys(data).forEach(key => {
					_data[key] = data[key];
				});

				return [base+'/purlAttributesList', { dataSet: [_data] }];
			},
			records: (label, data) => {
				let _data = {
					recordLabel: label,
					recordData: {}
				};

				if (code) _data['purlCode'] = code;

				Object.keys(data).forEach(key => {
					_data['recordData'][key] = data[key];
				});

				return [base+'/purlRecord', _data];
			}
		};

		await Promise.all(
			["profile", "properties", "attributes"].map(async (name) => {
				if (isPlainObject(data[name]) && Object.keys(data[name]).length) {
					let currhash = md5(JSON.stringify(data[name]));
					if (!data['hashmap'] || data['hashmap'][name] !== currhash) {
						let [uri, payload] = epmap[name](data[name]);

						debug('Saving [%s] Object: %O', name, payload);
						let res = await req.post(uri).send(payload);
						resdbg('%O', res.body.response.data);

						if (res.body.response.purlCode) {
							data['purlCode'] = res.body.response.purlCode;
						}
						if (name === 'attributes') {
							let adata = res.body.response.data[0];
							delete adata.purlCode;
							data[name] = adata;
						} else {
							data[name] = res.body.response.data;
						}
					}
				}
			})
		);

		let records = data.records || {};
		let recordshashmap = (data.hashmap && data.hashmap.records) ? data.hashmap.records : {};

		if (isPlainObject(records) && Object.keys(records).length) {
			await Promise.all(
				Object.keys(records).map(async label => {
					let currhash = md5(JSON.stringify(records[label]));
					if (recordshashmap[label] !== currhash) {
						let [uri, payload] = epmap["records"](label, records[label]);

						debug('Saving [%s:%s] Object: %O', "record", label, payload);
						let res = await req.post(uri).send(payload);
						resdbg('%O', res.body.response.data);

						if (res.body.response.purlCode) {
							data['purlCode'] = res.body.response.purlCode;
						}
						data["records"][label] = res.body.response.data;
					}
				})
			);
		}

		return compose(data);
	};

	const remove = async function remove(code) {
		expect(code, 'A purlCode is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing Object [%s].', code);
		let res = await req.del(base+'/purlProfile')
			.send({
				'purlCode': code
			});
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
