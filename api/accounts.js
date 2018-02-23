"use strict";

/* global debugPrefix */
const debug = require('debug')(debugPrefix+':accounts');
const resdbg = require('debug')(debugPrefix+':accounts-response');

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


/**
 * API Accounts sub-structure
 * @kind member
 * @memberof API
 */
function accounts(base, user, pass) {
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

	/**
	 * A purlHub account instance.
	 * @namespace Account
	 * @type object
	 *
	 * @property {string} alias				The display name.
	 * @property {boolean} enabled	The account state flag.
	 * @property {string} timeZone		The account default time zone identifier.
	 * @property {string} subscription	The account subscription class.
	 */
	const compose = function compose(data) {
		if (!data || !data.accountName) {
			return data;
		}

		let _base = base+`/admin/rest/accounts/${data.accountName}`;

		return Object.create({
			library: require('./library.js')(_base, user, pass),
			nodes: require('./nodes.js')(_base, user, pass),
			users: require('./users.js')(_base, user, pass),
			/**
			* Save this account instance.
			* @async
			* @memberof Account
			* @returns {Promise<Account,HTTPError>}	A promise that resolves to the saved purlHub {@link #account|Account} (w/ instance methods).
			*
			* @example
			* account.save()
			*   .catch(console.error)
			*   .then(console.log);
			*/
			save: async function() {
				return save(this);
			},
			/**
			* Remove this account instance.
			* @async
			* @memberof Account
			* @returns {Promise<Account,HTTPError>}	A promise that resolves to the removed purlHub {@link #account|Account} (static object w/ out instance methods).
			*
			* @example
			* account.remove()
			*   .catch(console.error)
			*   .then(console.log);
			*/
			remove: async function() {
				return remove(this.accountName);
			}
		},
		Object.getOwnPropertyDescriptors(data));
	};

	/**
	* Gets an account.
	* @param {string} name	A purlHub account name.
	* @returns {Promise<Account,HTTPError>}	A promise that resolves to a purlHub {@link #account|Account} instance.
	*
	* @example
	* let account = api.accounts.get('my-acnt')
	*   .catch(console.error)
	*   .then(console.log);
	*/
	const get = async function get(name) {
		name = trimSlashes(name);

		expect(name, 'A account name is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Getting Account [%s].', name);
		let res = await req.get(base+'/admin/rest/accounts/'+name);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	/**
	* Lists some accounts (ACL privileged method).
	* @returns {Promise<Account,HTTPError>}	A promise that resolves to an array of purlHub {@link #account|Account} object instances.
	*
	* @example
	* let account = api.accounts.list()
	*   .catch(console.error)
	*   .then(console.log);
	*/
	const list = async function list() {
		debug('Scanning Accounts...');
		let res = await req.get(base+'/admin/rest/accounts/');
		resdbg('%O', res.body.response.data);
		return res.body.response.data.map(compose); // array of objects
	};

	/**
	* Saves an account.
	* @param {object} account	A purlHub {@link #account|Account} object.
	* @returns {Promise<Account,HTTPError>}	A promise that resolves to a purlHub {@link #account|Account} instance.
	*
	* @example
	* let account = api.accounts.save({
	*     accountName: 'my-acnt',
	*     alias: 'My display name',
	*     timeZone: 'America/Denver'
	*   })
	*   .catch(console.error)
	*   .then(console.log);
	*/
	const save = async function save(account) {
		expect(account, 'An account (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.all.keys("accountName").and
			.to.contain.any.keys("alias", "enabled", "timeZone", "subscription");

		expect(account.accountName, 'A account name is required!')
			.to.be.a('string')
			.and.to.have.length.above(1);

		if ('alias' in account) expect(account.alias).to.be.a('string');
		if ('enabled' in account) expect(account.enabled).to.be.a('boolean');
		if ('timeZone' in account) expect(account.timeZone).to.be.a('string');
		if ('subscription' in account) expect(account.subscription).to.be.a('string');

		let name = trimSlashes(account.accountName);

		let _data = {};

		["accountName", "alias", "enabled", "timeZone", "subscription"].forEach(n => {
			if (account[n]) _data[n] = account[n];
		});

		debug('Saving Account [%s] w/ %O', name, _data);
		let res = await req.post(base+'/admin/rest/accounts/'+name).send(_data);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	/**
	* Removes an account.
	* @async
	* @param {string} name	A purlHub account name.
	* @returns {Promise<Account,HTTPError>}	A promise that resolves to the removed purlHub {@link #account|Account} (static object w/ out instance methods).
	*
	* @example
	* let account = api.accounts.remove('my-acnt')
	*   .catch(console.error)
	*   .then(console.log);
	*/
	const remove = async function remove(name) {
		name = trimSlashes(name);

		expect(name, 'A account name is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing Account [%s].', name);
		let res = await req.del(base+'/admin/rest/accounts/'+name);
		resdbg('%O', res.body.response.data);
		return res.body.response.data;
	};

	debug('Attached child @ %s.', base+'/admin/rest/accounts/');

	return {
		get: get,
		list: list,
		save: save,
		remove: remove
	};
}

module.exports = accounts;
