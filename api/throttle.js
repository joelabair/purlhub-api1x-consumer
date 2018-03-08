"use strict";

const Throttle    = require('superagent-throttle');

module.exports = new Throttle({
  active: true,		// set false to pause queue
  rate: 7,          	// how many requests can be sent every `ratePer`
  ratePer: 200,		// number of ms in which `rate` requests may be sent
  concurrent: 3		// how many requests can be sent concurrently
});
