"use strict";

const chai = require("chai");
const expect = chai.expect;

const root = process.env['PHAPICON_TESTURIROOT'];
const login = process.env['PHAPICON_TESTLOGIN'];
const pass = process.env['PHAPICON_TESTPASS'];
const tac = 'random-test-'+(new Date()).getTime();

// jshint mocha:true
// jshint expr:true

describe('API', function(){

	let api = require('../');

	it('exports a function',function(){
		expect(api)
			.to.be.a('function');
	});

	it('throws if a base uri is not provided', function() {
		expect(api)
			.to.throw("baseURI is required");
	});

	it('throws if a login is not provided', function() {
		expect(api.bind(null, root))
			.to.throw("login is required");
	});

	it('throws if a password is not provided', function() {
		expect(api.bind(null, root, login))
			.to.throw("password is required");
	});

	it('does not throw when all required values are provided', function() {
		expect(api.bind(null, root, login, pass))
			.not.to.throw();
	});

	it('exposes the root of the api tree', function() {
		expect(api(root, login, pass))
			.to.have.property('accounts');
	});

	/* Accounts */
	describe('Accounts', require('./accounts.sub.js'));

});
