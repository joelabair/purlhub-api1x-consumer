"use strict";

const debug = require('debug')('phRestClient-v1.0:accounts.nodes');
const resdbg = require('debug')('phRestClient-v1.0:accounts.nodes-response');

const expect = require('chai').expect;
const request = require('superagent');
require('superagent-retry')(request);

function trimSlashes (path) {
	if (path) {
		return String(path).trim(path).replace(/(^\/|\/$)/g,'');
	}
	return path;
}


/**
* API Accounts Nodes (child nodes) sub-structure.
* @kind member
* @memberof Account
*/
function nodes(base, user, pass) {

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
	 * A purlHub account child node instance.
	 * @namespace Node
	 * @type object
	 *
	 * @property {string} nodeName		The node's label.
	 * @property {string} nodePath			The node's hierarchical path including its name.
	 * @property {string} description		A long description.
	 * @property {string} classification	An arbitrary node type classification.
	 * @property {string} status				The state (live|draft) indicating the default event tracking mode.
	 */
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
			/**
			* Save this node instance.
			* @async
			* @memberof Node
			* @returns {Promise<Node,HTTPError>}	A promise that resolves to the saved purlHub {@link #node|Node} (w/ instance methods).
			*
			* @example
			* node.save()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			save: async function() {
				let name = this.id || null;
				return save(name, this);
			},
			/**
			* Remove this node instance.
			* @async
			* @memberof Node
			* @returns {Promise<Node,HTTPError>}	A promise that resolves to the removed purlHub {@link #node|Node} (static object w/ out instance methods).
			*
			* @example
			* node.remove()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			remove: async function() {
				let name = this.id || null;
				return remove(name);
			},
			id: data.nodePath,
			original: data.nodeName
		},
		descriptor);
	};

	/**
	* Gets a node.
	* @async
	* @param {string} path		A node path.
	* @returns {Promise<Node,HTTPError>}	A promise that resolves to a purlHub {@link #node|Node} instance.
	*
	* @example
	* let node = account.nodes.get('/default/Sales')
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const get = async function get(path) {
		path = trimSlashes(path);

		expect(path, 'A node path is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Getting Node [%s].', path);
		let res = await req.get(base+'/nodes/'+path);
		resdbg('%O', res.body.response.data[0]);
		return compose(res.body.response.data[0]);
	};

	/**
	* Lists all nodes.
	* @async
	* @returns {Promise<Node,HTTPError>}	A promise that resolves to an array of purlHub {@link #node|Node} object instances.
	*
	* @example
	* let node = account.nodes.list()
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const list = async function list() {
		debug('Scanning Nodes...');
		let res = await req.get(base+'/nodes/');
		resdbg('%O', res.body.response.data);
		return res.body.response.data.map(compose);
	};

	/**
	* Saves a node.
	* @async
	* @param {string} path		A node path.
	* @param {object} data	A purlHub {@link #node|Node} object.
	* @returns {Promise<Node,HTTPError>}	A promise that resolves to a purlHub {@link #node|Node} instance.
	*
	* @example
	* let node = account.nodes.save('/default/Sales', {password: '12345678', timeZone: 'America/Denver'})
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
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
		resdbg('%O', res.body.response.data);
		return compose(res.body.response.data);
	};

	/**
	* Removes a node.
	* @async
	* @param {string} name	A node path.
	* @returns {Promise<Node,HTTPError>}	A promise that resolves to the removed purlHub {@link #node|Node} (static object w/ out instance methods).
	*
	* @example
	* let node = account.nodes.remove('/default/Sales')
	* 	.catch(console.error)
	* 	.then(console.log);
	*/
	const remove = async function remove(path) {
		path = trimSlashes(path);

		expect(path, 'A node path is required!')
			.to.exist.and
			.to.be.a('string')
			.and.to.have.length.above(1);

		debug('Removing Node [%s].', path);
		let res = await req.del(base+'/nodes/'+path);
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

module.exports = nodes;
