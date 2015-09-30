'use strict';

var assert = require('assert');
var vcapServices = require('../index');

function assertEmptyObject(expected, actual) {
  assert.equal(Object.keys(expected).length, Object.keys(actual).length);
}

describe('vcap_services', function() {
  var ORIGINAL_VALUE = null;
  var credentials = {
    password: '<password>',
    url: '<url>',
    username: '<username>',
    api_key: '<api_key>'
  };

  before(function() {
    // save VCAP_SERVICES value in an auxiliar variable.
    ORIGINAL_VALUE = process.env.VCAP_SERVICES;

    // set VCAP_SERVICES to a default value
    process.env.VCAP_SERVICES = JSON.stringify({
      personality_insights: [{
        credentials: credentials,
        label: 'personality_insights',
        name: 'personality-insights-service',
        plan: 'standard'
      }]
    });

  });

  after(function() {
    // return the original value to VCAP_SERVICES
    process.env.VCAP_SERVICES = ORIGINAL_VALUE;
  });

  it('should return {} for missing parameters', function() {
    assertEmptyObject({}, vcapServices.getCredentials(null));
    assertEmptyObject({}, vcapServices.getCredentials({}));
    assertEmptyObject({}, vcapServices.getCredentials(undefined));
  });

  it('should return the first available credentials', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials('personality_insights'));
    assert.deepEqual(credentials, vcapServices.getCredentials('personality'));
  });

  it('should return {} when service not found', function() {
    assertEmptyObject({}, vcapServices.getCredentials('foo'));
  });

});
