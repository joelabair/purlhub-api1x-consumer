"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.users');
const resdbg = require('debug')(debugPrefix+':accounts.users-response');

const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);


/**
* API Accounts Users sub-structure.
* @kind member
* @memberof Account
*/
function users(base, user, pass) {

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
	 * A purlHub account user instance.
	 * @namespace User
	 * @type object
	 *
	 * @property {string} login					The username / login.
	 * @property {string} password			The associated password.
	 * @property {string} screenName	A display name.
	 * @property {array|string} roles		The users ACL roles (array or comma delimited string).
	 * @property {boolean} enabled		The users active state flag.
	 * @property {bollean} locked			The users security lockout state flag.
	 * @property {string} timeZone			The account default time zone identifier.
	 */
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
			/**
			* Save this user instance.
			* @async
			* @memberof User
			* @returns {Promise<User,HTTPError>}	A promise that resolves to the saved purlHub {@link #user|User} (w/ instance methods).
			*
			* @example
			* user.save()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			save: async function() {
				return save(this);
			},
			/**
			* Remove this user instance.
			* @async
			* @memberof User
			* @returns {Promise<User,HTTPError>}	A promise that resolves to the removed purlHub {@link #user|User} (static object w/ out instance methods).
			*
			* @example
			* user.remove()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			remove: async function() {
				return remove(this.id);
			},
			id: data.login
		},
		descriptor);
	};

	/**
	* Gets a user.
	* @param {string} name	A username / login.
	* @returns {Promise<User,HTTPError>}	A promise that resolves to a purlHub {@link #user|User} instance.
	*
	* @example
	* let account = account.users.get('user@example.com')
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
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

	/**
	* Lists all users.
	* @returns {Promise<User,HTTPError>}	A promise that resolves to an array of purlHub {@link #user|User} object instances.
	*
	* @example
	* let account = account.users.list()
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const list = async function list() {
		debug('Scanning Users...');
		let res = await req.get(base+'/users/');
		resdbg('%O', res.body.response.data);
		return res.body.response.data.map(compose);
	};

	/**
	* Saves a user.
	* @param {object} data	A purlHub {@link #user|User} object.
	* @returns {Promise<User,HTTPError>}	A promise that resolves to a purlHub {@link #user|User} instance.
	*
	* @example
	* let user = account.users.save({login: 'user@example.com', password: '12345678', timeZone: 'America/Denver'})
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const save = async function save(data) {
		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("login", "roles", "passwd", "enabled", "locked", "timeZone", "screenName", "password", "newLogin");

		let _data = {};

		["login", "roles", "passwd", "enabled", "locked", "timeZone", "screenName", "password", "newLogin"].forEach(n => {
			if (n === 'roles') {
				if (Array.isArray(data[n])) {
					data[n] = data[n].join(',');
				}
			}
			if (data[n]) _data[n] = data[n];
		});

		if (data.id !== data.login) {
			_data.newLogin = data.login;
		}

		debug('Saving User [%s] w/ %O', data.id, _data);
		let res = await req.post(base+'/users/'+data.id).send(_data);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	/**
	* Removes a user.
	* @async
	* @param {string} name	A username / login.
	* @returns {Promise<User,HTTPError>}	A promise that resolves to the removed purlHub {@link #user|User} (static object w/ out instance methods).
	*
	* @example
	* let user = account.users.remove('user@example.com')
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
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
}

module.exports = users;
