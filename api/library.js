"use strict";

/* global debugPrefix */
const debug = require('debug')(debugPrefix+':accounts.library');
const resdbg = require('debug')(debugPrefix+':accounts.library-response');

const validator = require('validator');
const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

function sanitize(data) {
	data = validator.toString(data);
	data = validator.stripLow(data);
	data = validator.trim(data);
	return data;
}

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

/**
* API Accounts Library (asset library) sub-structure.
* @kind member
* @memberof Account
*/
function library(base, user, pass) {
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

	/**
	 * A purlHub account library asset instance.
	 * @namespace Asset
	 * @type object
	 *
	 * @property {string} filename			The filename including any path.
	 * @property {object} metadata		The associated metadata.
	 * @property {string} contentType	A binary content type.
	 * @property {boolean} head			The CV state flag.
	 * @property {boolean} deleted		The files deleted state flag.
	 * @property {number} length			The file's binary data content length.
	 * @property {number} version			The version identifier.
	 */
	const compose = function compose(data) {
		if (!data) return data;

		expect(data)
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("filename", "metadata", "contentType", "head", "length");

		return Object.create({
			/**
			* Save this asset instance.
			* @async
			* @memberof Asset
			* @returns {Promise<Asset,HTTPError>}	A promise that resolves to the saved purlHub {@link #asset--object|Asset} (w/ instance methods).
			*
			* @example
			* asset.save()
			*   .catch(console.error)
			*   .then(console.log);
			*/
			save: async function() {
				return save(this);
			},
			/**
			* Remove this asset instance.
			* @async
			* @memberof Asset
			* @returns {Promise<Asset,HTTPError>}	A promise that resolves to the removed purlHub {@link #asset--object|Asset} (static object w/ out instance methods).
			*
			* @example
			* asset.remove()
			*   .catch(console.error)
			*   .then(console.log);
			*/
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

	/**
	* Gets a library asset.
	* @async
	* @param {string} context		The asset's context (images|documents|videos|layouts|sections|templates).
	* @param {string} filename		A asset filename including any path.
	* @param {object} [options]		An optional object of request options.
	* @returns {Promise<Asset,HTTPError>}	A promise that resolves to a purlHub {@link #asset--object|Asset} instance.
	*
	* @example
	* let asset = account.library.get('templates','/email/message.txt')
	*   .catch(console.error)
	*   .then(console.log);
	*/
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

	/**
	* Lists all assets.
	* @async
	* @param {string} context		The asset's context (images|documents|videos|layouts|sections|templates).
	* @param {string} [directory]	An optional directory prefix.
	* @param {object} [options]		An optional object of request options.
	* @returns {Promise<Asset,HTTPError>}	A promise that resolves to an array of purlHub {@link #asset--object|Asset} object instances.
	*
	* @example
	* let assets = account.library.list('templates')
	*   .catch(console.error)
	*   .then(console.log);
	*/
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

	/**
	* Saves a library asset.
	* @async
	* @param {object} asset			A purlHub {@link #asset--object|Asset} instance.
	* @param {object} [options]		An optional object of request options.
	* @returns {Promise<Asset,HTTPError>}	A promise that resolves to a purlHub {@link #asset--object|Asset} instance.
	*
	* @example
	* let asset = account.library.save({
	*     filename: 'some/file.txt',
	*     metadata: {
	*       context: 'template',
	*       description: 'This is a test'
	*     },
	*     contentType: 'text/plain'
	*   })
	*   .catch(console.error)
	*   .then(console.log);
	*/
	const save = async function save(asset, options) {
		expect(asset, 'A valid asset (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.all.keys("filename", "metadata", "contentType");

		expect(asset, 'A valid asset (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys( "filename", "metadata", "contentType", "head", "version", "deleted", "length", "md5", "aliases", "extra" );

		expect(asset.metadata, 'Some metadata is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.all.keys("context");

		expect(asset.metadata, 'Some metadata is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("accountName", "context", "author", "description", "sharing", "tags");

		let context = pluralize(trimSlashes(asset.metadata.context));
		let filename = trimSlashes(asset.filename);

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

		let _data = {};

		["contentType", "utf8Content", "publicCdnURI", "renameTo"].forEach(n => {
			if (asset[n]) _data[n] = asset[n];
		});

		["description", "author", "sharing", "tags"].forEach(n => {
			if (asset.metadata[n]) _data[n] = asset.metadata[n];
		});

		if (asset.extra) {
			_data.extraData = asset.extra;
		}

		if (asset.id !== asset.filename) {
			_data.renameTo = asset.filename;
		}

		if (options) {
			_data = Object.assign(_data, options);
		}

		debug('Saving Asset [%s/%s] w/ %O', context, filename, _data);
		let res = await req.post(base+`/library/assets/${context}/${filename}`).send(_data);
		resdbg('%O', res.body.response.data.item);
		return compose(res.body.response.data.item);
	};

	/**
	* Removes a asset.
	* @async
	* @param {string} context		The asset's context (images|documents|videos|layouts|sections|templates).
	* @param {string} filename		A asset filename including any path.
	* @param {object} [options]		An optional object of request options.
	* @returns {Promise<Asset,HTTPError>}	A promise that resolves to a purlHub {@link #asset--object|Asset} instance (static object w/ out instance methods).
	*
	* @example
	* let asset = account.library.remove('templates','/email/message.txt')
	*   .catch(console.error)
	*   .then(console.log);
	*/
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
}

module.exports = library;
