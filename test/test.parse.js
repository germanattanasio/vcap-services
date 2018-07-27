'use strict';

var assert = require('assert');
var vcapServices = require('../index');

function assertEmptyObject(expected, actual) {
  assert.equal(Object.keys(expected).length, Object.keys(actual).length);
}

// override console.warn and supress messages
console.warn = function(){
  return ;
};

describe('vcap_services', function() {
  var ORIGINAL_VALUE = null;
  var credentials = {
    password: '<password>',
    url: '<url>',
    username: '<username>',
    api_key: '<api_key>'
  };
  var redis = {name: 'Compose for Redis-ov'};
  var nosql_x5 = {name: 'Cloudant NoSQL DB-x5'};
  var nosql_x6 = {name: 'Cloudant NoSQL DB-x6'};

  before(function() {
    // save VCAP_SERVICES value in an auxiliar variable.
    ORIGINAL_VALUE = process.env.VCAP_SERVICES;

    // set individual service environmental variables
    process.env.CONVERSATION_W1 = JSON.stringify(credentials);
    process.env.COMPOSE_FOR_REDIS_OV = JSON.stringify(redis);

    process.env.CLOUDANT_NOSQL_DB_X5 = JSON.stringify(nosql_x5);
    process.env.CLOUDANT_NOSQL_DB_X6 = JSON.stringify(nosql_x6);

    process.env.OBJECT_STORAGE_6J = 'Not JSON';

    process.env.weather_company_data_wu = JSON.stringify({ name: 'weather-company_data_wu' });

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
    if (ORIGINAL_VALUE) {
      process.env.VCAP_SERVICES = ORIGINAL_VALUE;
    } else {
      process.env.VCAP_SERVICES = '';
    }
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

  it('should return conversation service credentials', function() {
    assert.deepEqual(credentials, vcapServices.getCredentials(null, null, 'conversation_w1'));
  });

  it('should return first available nosql db service information', function() {
    assert.deepEqual(nosql_x5, vcapServices.getCredentials(null, null, 'cloudant_nosql_db_x5'));
  });

  it('should return instance of nosql db or fall back on service name if instance name DNE', function() {
    assert.deepEqual({}, vcapServices.getCredentials(null, null, 'cloudant_nosql_xx'));
    assert.deepEqual(nosql_x5, vcapServices.getCredentials('cloudant_nosql', null, 'cloudant_nosql_db_x5'));

    assert.deepEqual(nosql_x5, vcapServices.getCredentials(null, null, 'cloudant_nosql_db_x5'));
    assert.deepEqual(nosql_x5, vcapServices.getCredentials('cloudant_nosql', null, 'cloudant_nosql_db_x5'));

    assert.deepEqual(nosql_x6, vcapServices.getCredentials(null, null, 'cloudant_nosql_db_x6'));
    assert.deepEqual(nosql_x6, vcapServices.getCredentials('cloudant_nosql', null, 'cloudant_nosql_db_x6'));
  });

  it('should return {} if the env variable is not upper case', function() {
    assert.deepEqual({}, vcapServices.getCredentials(null, null, 'weather_company_data_wu'));
    assert.deepEqual({}, vcapServices.getCredentials(null, null, 'weather_company_data'));
  });

  it('should return redis information when name or iname are specified with other delimiters [ -&]', function() {

    assert.deepEqual(redis, vcapServices.getCredentials(null, null, 'COMPOSE_FOR_REDIS_OV'));
    assert.deepEqual(redis, vcapServices.getCredentials(null, null, 'Compose-for-Redis-ov'));
    assert.deepEqual(redis, vcapServices.getCredentials(null, null, 'Compose for redis ov'));
    assert.deepEqual(redis, vcapServices.getCredentials(null, null, 'Compose&for&redis-ov'));
  });

  it('should return {} when the env var is not JSON', function() {
    assert.deepEqual({}, vcapServices.getCredentials(null, null, 'OBJECT_STORAGE'));

    assert.deepEqual({}, vcapServices.getCredentials(null, null, 'Object Storage-6j'));
  });

  it('should get the credentials for Starter', function() {
    assert.deepEqual(credentials, vcapServices.getCredentialsForStarter('personality_insights'));
  });
});


describe('credentials file and Kube', function() {
  var cloudCredentials = {
    watson_conversation_password: '<password>',
    watson_conversation_url: '<url>',
    watson_conversation_username: '<username>',
    watson_conversation_api_key: '<api_key>',
    watson_conversation_apikey: '<apikey>',
  };
  var credentials = {
    'api_key': '<api_key>',
    'iam_apikey': '<apikey>',
    'password': '<password>',
    'url': '<url>',
    'username': '<username>',
  };

  it('should return {} for missing parameters', function() {
    assertEmptyObject({}, vcapServices.getCredentialsFromLocalConfig(null));
    assertEmptyObject({}, vcapServices.getCredentialsFromLocalConfig({}));
    assertEmptyObject({}, vcapServices.getCredentialsFromLocalConfig(undefined));
  });

  it('should return the credentials', function() {
    assert.deepEqual(credentials, vcapServices.getCredentialsFromLocalConfig('conversation', cloudCredentials));
  });

  it('should return no credentials for Kube', function() {
    assert.deepEqual({}, vcapServices.getCredentialsFromKubeEnv('conversation'));
  });

  it('should return the credentials for Kube', function() {
    process.env.service_watson_conversation = JSON.stringify(cloudCredentials);
    assert.deepEqual(credentials, vcapServices.getCredentialsFromKubeEnv('conversation'));
  });

  it('should get the credentials for Starter from Kube', function() {
    process.env.service_watson_conversation = JSON.stringify(cloudCredentials);
    assert.deepEqual(credentials, vcapServices.getCredentialsForStarter('conversation'));
  });

  it('should get the credentials for Starter from file', function() {
    assert.deepEqual(credentials, vcapServices.getCredentialsForStarter('conversation', cloudCredentials));
  });

  it('should return {} for Starter from file for wrong params', function() {
    assertEmptyObject({}, vcapServices.getCredentialsForStarter(null));
    assertEmptyObject({}, vcapServices.getCredentialsForStarter({}));
    assertEmptyObject({}, vcapServices.getCredentialsForStarter(undefined));
  });
});
