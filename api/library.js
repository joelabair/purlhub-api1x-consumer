"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.library');

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

// Accounts Library Assets Endpoint
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

	base = base.toLowerCase();

	debug('Attached child @ %s.', base);

	return {
		get: async function(context, fileName) {
			context = trimSlashes(context);
			fileName = trimSlashes(fileName);

			expect(context, 'A valid context is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1)
				.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

			expect(fileName, 'A fileName is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Getting Asset [%s/%s].', context, fileName);
			let res = await req.get(base+`/library/assets/${context}/${fileName}`);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		},

		list: async function(context, directory, filter) {
			context = trimSlashes(context);
			expect(context, 'A valid context is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1)
				.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

			if (directory) {
				directory = trimSlashes(directory);
				expect(directory, 'Invalid directory!')
					.to.be.a('string')
					.and.to.have.length.above(1);
				directory += '/';
			}

			if (filter) {
				expect(filter, 'Invalid filter!')
					.to.be.a('object');
			}

			//	its optional, but if it exists, it must be a object
			if (filter) {
				expect(filter, 'filter must be an object!')
					.to.be.a('object');
			}

			debug('Scanning Assets [%s/%s].', context, directory);
			let res = await req.get(base+`/library/assets/${context}/${directory}`).query(filter);
			let data = res.body.response.data || [];
			if (typeof data === 'object' && !Array.isArray(data)) {
				if ('list' in data) {
					data = data.list;
				}
			}
			debug('%O', data);
			return data;
		},

		save: async function(context, fileName, data) {
			context = trimSlashes(context);
			fileName = trimSlashes(fileName);

			expect(context, 'A valid context is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1)
				.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

			expect(fileName, 'A fileName is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			expect(data, 'Some data is required!')
				.to.exist.and
				.to.be.a('object');

			debug('Saving Asset [%s/%s].', context, fileName);
			let res = await req.post(base+`/library/assets/${context}/${fileName}`).send(data);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		},

		remove: async function(context, fileName) {
			context = trimSlashes(context);
			fileName = trimSlashes(fileName);

			expect(context, 'A valid context is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1)
				.and.to.match(/^(layouts|sections|templates|images|videos|documents)$/);

			expect(fileName, 'A fileName is required!')
				.to.exist.and
				.to.be.a('string')
				.and.to.have.length.above(1);

			debug('Removing Asset [%s/%s].', context, fileName);
			let res = await req.del(base+`/library/assets/${context}/${fileName}`);
			debug('%O', res.body.response.data);
			return res.body.response.data;
		}
	};
};
