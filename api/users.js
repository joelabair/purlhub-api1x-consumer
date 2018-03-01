"use strict";

/* global debugPrefix */
const debug = require('debug')(debugPrefix+':accounts.users');
const resdbg = require('debug')(debugPrefix+':accounts.users-response');

const expect = require('chai').expect;
const request = require('superagent');


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

		descriptor.passwd.configurable = false;
		descriptor.passwd.enumerable = false;

		descriptor.password = {
			get: function() {
				return this['passwd'];
			},
			set: function(v) {
				this['passwd'] = v;
			},
			configurable: false,
			enumerable: true
		};

		return Object.create({
			/**
			* Save this user instance.
			* @async
			* @memberof User
			*
			* @returns {Promise}
			* @fulfil {User}	The saved purlHub user instance.
			* @reject {HTTPError}	A HTTP error object.
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
			*
			* @returns {Promise}
			* @fulfil {User}	The removed purlHub user object (static object w/ out instance methods).
			* @reject {HTTPError}	A HTTP error object.
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
	* @async
	* @param {string} name	A username / login.
	*
	* @returns {Promise}
	* @fulfil {User}	A purlHub user instance.
	* @reject {HTTPError}	A HTTP error object.
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
	* @async
	*
	* @returns {Promise}
	* @fulfil {User[]}	An array of purlHub user instances.
	* @reject {HTTPError}	A HTTP error object.
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
	* @async
	* @param {object} data	A purlHub {@link #user|User} object.
	*
	* @returns {Promise}
	* @fulfil {User}	The saved purlHub user instance.
	* @reject {HTTPError}	A HTTP error object.
	*
	* @example
	* let user = account.users.save({
	* 		login: 'user@example.com',
	* 		password: '12345678',
	* 		timeZone: 'America/Denver'
	* 	})
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const save = async function save(data) {
		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.all.keys("login", "password");

		expect(data, 'Some data (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("login", "password", "roles", "enabled", "locked", "timeZone", "screenName", "reference");

		expect(data.login, 'A login is required!')
			.to.be.a('string')
			.and.to.have.length.above(1);

		expect(data.password, 'A password is required!')
			.to.be.a('string')
			.and.to.have.length.above(1);

		let _data = {};

		["login", "password", "roles", "enabled", "locked", "timeZone", "screenName", "reference"].forEach(n => {
			if (n === 'roles') {
				if (Array.isArray(data[n])) {
					_data[n] = data[n].join(',');
				}
			} else {
				if (data[n]) _data[n] = data[n];
			}
		});


		let name = ('id' in data) ? data.id : data.login;

		if ('id' in data && data.id !== data.login) {
			_data.newLogin = data.login;
		}

		debug('Saving User [%s] w/ %O', name, _data);
		let res = await req.post(base+'/users/'+name).send(_data);
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	/**
	* Removes a user.
	* @async
	* @param {string} name	A username / login.
	*
	* @returns {Promise}
	* @fulfil {User}	The removed purlHub user object (static object w/ out instance methods).
	* @reject {HTTPError}	A HTTP error object.
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
