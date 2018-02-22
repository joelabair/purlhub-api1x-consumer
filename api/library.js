"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.library');
const resdbg = require('debug')('phRestClient-v1.0:accounts.library-response');

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

function pluralize (data) {
	if (data) {
		return String(data).replace(/s$/, '')+'s';
	}
	return data;
}

// Accounts Library Assets Endpoint
module.exports = function(base, user, pass) {
	expect(base, 'A baseURI is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1)
		.and.to.match(/api(-dvlp)?\.purlhub\.(com|local)/);

	base = base.toLowerCase();

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
		if (!data) return data;

		expect(data)
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("filename", "metadata", "contentType", "head", "length");

		return Object.create({
			save: async function() {
				let name = this.id || null;
				let metadata = this.metadata || {};
				let context = metadata.context || null;
				return save(context, name, this);
			},
			remove: async function() {
				let name = this.id || null;
				let metadata = this.metadata || {};
				let context = metadata.context || null;
				return remove(context, name);
			},
			id: data.filename
		},
		Object.getOwnPropertyDescriptors(data));
	};

	const get = async function get(context, filename, options) {
		context = pluralize(trimSlashes(context));
		filename = trimSlashes(filename);

		expect(context, 'A valid context is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1)
			.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

		expect(filename, 'A filename is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		//	its optional, but if it exists, it must be a object
		if (options) {
			expect(options, 'options must be an object!')
				.to.be.a('object');
		}

		debug('Getting Asset [%s/%s].', context, filename);
		let res = await req.get(base+`/library/assets/${context}/${filename}`).query(options);
		resdbg('%O', res.body.response.data.item);
		return compose(res.body.response.data.item);
	};

	const list = async function list(context, directory, options) {
		context = pluralize(trimSlashes(context));

		expect(context, 'A valid context is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1)
			.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

		if (!!directory) {
			directory = trimSlashes(directory);
			expect(directory, 'Invalid directory!')
				.to.be.a('string')
				.and.to.have.length.above(1);
			directory += '/';
		} else {
			directory = '';
		}

		//	its optional, but if it exists, it must be a object
		if (options) {
			expect(options, 'options must be an object!')
				.to.be.a('object');
		}

		debug('Scanning Assets [%s/%s].', context, directory);
		let res = await req.get(base+`/library/assets/${context}/${directory}`).query(options);
		let data = res.body.response.data || [];
		if (typeof data === 'object' && !Array.isArray(data)) {
			if ('list' in data) {
				data = data.list;
			}
		}
		resdbg('%O', data);
		return data.map(compose);
	};

	const save = async function save(context, filename, data, options) {
		context = pluralize(trimSlashes(context));
		filename = trimSlashes(filename);

		expect(context, 'A valid context is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1)
			.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

		expect(filename, 'A filename is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("filename", "metadata", "aliases", "extra", "contentType", "head", "version", "deleted", "length", "md5");

		expect(data.metadata, 'Some metadata is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("description", "author", "sharing", "tags");

		//	its optional, but if it exists, it must be a object
		if (options) {
			expect(options, 'options must be an object!')
				.to.be.a('object');
		}

		let _data = {};

		["contentType", "utf8Content", "publicCdnURI", "renameTo"].forEach(n => {
			if (data[n]) _data[n] = data[n];
		});

		["description", "author", "sharing", "tags"].forEach(n => {
			if (data.metadata[n]) _data[n] = data.metadata[n];
		});

		if (data.extra) {
			_data.extraData = data.extra;
		}

		if (data.id !== data.filename) {
			_data.renameTo = data.filename;
		}

		if (options) {
			_data = Object.assign(_data, options);
		}

		debug('Saving Asset [%s/%s] w/ %O', context, filename, _data);
		let res = await req.post(base+`/library/assets/${context}/${filename}`).send(_data);
		resdbg('%O', res.body.response.data.item);
		return compose(res.body.response.data.item);
	};

	const remove = async function remove(context, filename, options) {
		context = pluralize(trimSlashes(context));
		filename = trimSlashes(filename);

		expect(context, 'A valid context is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1)
			.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

		expect(filename, 'A filename is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		//	its optional, but if it exists, it must be a object
		if (options) {
			expect(options, 'options must be an object!')
				.to.be.a('object');
		}

		debug('Removing Asset [%s/%s].', context, filename);
		let res = await req.del(base+`/library/assets/${context}/${filename}`).query(options);
		resdbg('%O', res.body.response.data.item);
		return res.body.response.data.item;
	};

	debug('Attached child @ %s.', base);

	return {
		get: get,
		list: list,
		save: save,
		remove: remove
	};
};
