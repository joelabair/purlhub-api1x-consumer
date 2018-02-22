"use strict";

global.debugPrefix = 'phRestClient-1.x';

/* global debugPrefix */
const debug = require('debug')(debugPrefix);

const validator = require('validator');
const expect = require('chai').expect;
const { URL } = require('url');

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


/**
 * purlHub API Root instance constructor (new||call).
 * @base {string} - The API root URI (i.e. https://api.purlhub.com).
 * @user {string} - A login username.
 * @pass {string} - A login password.
 * @returns {object}
 *
 * @example
 * const API = require('purlhub-api1x-consumer');
 * let api = new API('https://api.purlhub.com', 'user@example.com', '12345678');
 *
 * // OR simply
 * const API = require('purlhub-api1x-consumer');
 * let api = API('https://api.purlhub.com', 'user@example.com', '12345678');
 */
function api(base, user, pass) {
	base = trimSlashes(base);
	user = sanitize(user);
	pass = sanitize(pass);

	// validate the base as a URI and make sure its using https
	let url = new URL(base);
	url.protocol = 'https:';
	base = url.toString();

	expect(base, 'A baseURI is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1)
		.and.to.match(/api(-dvlp)?\.purlhub\.(com|local)/);

	expect(user, 'A login is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1);

	expect(pass, 'A password is required!')
		.to.exist.and
		.to.be.a('string')
		.and.to.have.length.above(1);

	const accounts = require('./api/accounts.js');
	debug('Constructed API1x consumer @ %s.', base);

	return {
		accounts: accounts(base, user, pass)
	};
}

module.exports = api;
