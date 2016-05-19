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
        plan: 'not-a-plan'
      },{
        credentials: {},
        plan: 'beta'
      },{
        credentials: credentials,
        plan: 'standard'
      }],
      retrieve_and_rank: [{
        name: 'retrieve-and-rank-standard',
        label: 'retrieve_and_rank',
        plan: 'standard',
        credentials: credentials
      }],
      natural_language_classifier: [{
        name: 'NLC 1',
        plan: 'standard',
        credentials: credentials
      },{
        name: 'NLC 2',
        plan: 'standard',
        credentials: credentials
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

  it('should return the last available credentials', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials('personality_insights'));
    assert.deepEqual(credentials, vcapServices.getCredentials('personality'));
  });

  it('should return the last available credentials that match a plan', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials('personality_insights','standard'));
    assert.deepEqual({}, vcapServices.getCredentials('personality','beta'));
    assert.deepEqual({}, vcapServices.getCredentials('personality','foo'));
  });

  it('should return the last available credentials that match an instance name', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials('natural_language_classifier',null,'NLC 1'));
    assert.deepEqual({}, vcapServices.getCredentials('natural_language_classifier',null,'NLC 3'));
    assert.deepEqual({}, vcapServices.getCredentials('natural_language_classifier','foo','NLC 1'));
    assert.deepEqual({}, vcapServices.getCredentials('natural_language_classifier','foo','NLC 3'));
  });

  it('should return the last available credentials that match a plan and an instance name', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials('natural_language_classifier','standard','NLC 1'));
    assert.deepEqual({}, vcapServices.getCredentials('natural_language_classifier','foo','NLC 1'));
    assert.deepEqual({}, vcapServices.getCredentials('natural_language_classifier','foo','NLC 3'));
  });

  it('should return {} when service plan not found', function() {
    assert.deepEqual({}, vcapServices.getCredentials('personality','foo'));
  });

  it('should return {} when service not found', function() {
    assertEmptyObject({}, vcapServices.getCredentials('foo'));
  });

});
