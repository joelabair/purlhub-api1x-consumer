"use strict";

global.debugPrefix = 'phRestClient-1.x';
const debug = require('debug')(debugPrefix);

const validator = require('validator');
const expect = require('chai').expect;

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

// Accounts Endpoint
module.exports = function(base, user, pass) {
	base = trimSlashes(base);
	user = sanitize(user);
	pass = sanitize(pass);

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
};

