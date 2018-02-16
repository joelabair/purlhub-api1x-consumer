"use strict";

const Throttle    = require('superagent-throttle');

module.exports = new Throttle({
  active: true,		// set false to pause queue
  rate: 10,          	// how many requests can be sent every `ratePer`
  ratePer: 1000,	// number of ms in which `rate` requests may be sent
  concurrent: 10	// how many requests can be sent concurrently
});
