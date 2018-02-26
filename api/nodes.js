"use strict";

/* global debugPrefix */
const debug = require('debug')(debugPrefix+':accounts.nodes');
const resdbg = require('debug')(debugPrefix+':accounts.nodes-response');

const path = require('path');
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

	const rnpSym = Symbol("RealNodePath");

	/**
	 * A purlHub account child node instance.
	 * @namespace Node
	 * @type object
	 *
	 * @property {string} nodeName		The node's literal name.
	 * @property {string} nodeClass		An arbitrary node type classification.
	 * @property {string} nodePath			The node's hierarchical path including its name.
	 * @property {string} description		A long description.
	 * @property {string} status				The state (live|draft) indicating the default event tracking mode.
	 * @property {object} childNodes		An object of hierarchical child node instances.
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

		descriptor[rnpSym] = {
			value: path.parse(descriptor.nodePath.value),
			writable: true
		};

		descriptor.nodeName = {
			get: function() {
				return this[rnpSym].base;
			},
			set: function(v) {
				this[rnpSym].base = path.parse(v).base;
			},
			enumerable: true,
			configurable: true
		};

		descriptor.nodePath = {
			get: function() {
				return path.format(this[rnpSym]);
			},
			set: function(v) {
				// newName can only set the basename component of the path
				this[rnpSym].base = path.parse(v).base;
			},
			enumerable: true,
			configurable: true
		};

		return Object.create({
			objects: require('./objects.js')(_pObjBase, user, pass),
			/**
			* Save this node instance.
			* @async
			* @memberof Node
			*
			* @returns {Promise}
			* @fulfil {Node} 	The saved purlHub node instance.
			* @reject {HTTPError} A HTTP error object.
			*
			* @example
			* node.save()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			save: async function() {
				return save(this);
			},
			/**
			* Remove this node instance.
			* @async
			* @memberof Node
			*
			* @returns {Promise}
			* @fulfil {Node} 	The removed purlHub node object (static object w/ out instance methods).
			* @reject {HTTPError} A HTTP error object.
			*
			* @example
			* node.remove()
			* 	.catch(console.error)
			* 	.then(console.log);
			*/
			remove: async function() {
				return remove(this.id);
			},
			// newName can only set the basename component of the path
			id: data.nodeName
		},
		descriptor);
	};

	/**
	* Gets a node.
	* @async
	* @param {string} path		A node path.
	*
	* @returns {Promise}
	* @fulfil {Node} 	A purlHub node instance.
	* @reject {HTTPError} A HTTP error object.
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
	*
	* @returns {Promise}
	* @fulfil {Node[]} 	An array of purlHub node instances.
	* @reject {HTTPError} A HTTP error object.
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
	* @param {object} data	A purlHub {@link #node--object|Node} object.
	*
	* @returns {Promise}
	* @fulfil {Node} 	The saved purlHub node instance.
	* @reject {HTTPError} A HTTP error object.
	*
	* @example
	* let node = account.nodes.save({
	*     nodePath: '/default/Sales',
	*     nodeClass: 'campaign',
	*     description: 'sales node',
	*     status: 'live'
	*   })
	*   .catch(console.error)
	* 	 .then(console.log);
	*/
	const save = async function save(node) {
		expect(node, 'A node (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.all.keys("nodePath", "nodeClass");

		expect(node, 'a node (obj) is required!')
			.to.exist.and
			.to.be.a('object').and
			.to.contain.any.keys("nodePath", "nodeClass", "nodeName", "status", "description");

		let _data = {};

		let path = ('id' in node) ? trimSlashes(node.id) : trimSlashes(node.nodePath);

		// newName can only set the basename component of the path
		if ('id' in node && node.id !== node.nodeName) {
			_data.newName = node.nodeName;
		}

		["classification", "status", "description"].forEach(n => {
			if (n === 'classification' && node['nodeClass']) {
				_data[n] = node['nodeClass'];
			} else {
				if (node[n]) _data[n] = node[n];
			}
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
	*
	* @returns {Promise}
	* @fulfil {Node} 	The removed purlHub node object (static object w/ out instance methods).
	* @reject {HTTPError} A HTTP error object.
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
