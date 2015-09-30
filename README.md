# VCAP_SERVICES

[![Build Status](https://secure.travis-ci.org/vcap_services/vcap_services.png)](http://travis-ci.org/germanattanasio/vcap_services)
[![Coverage Status](https://img.shields.io/coveralls/germanattanasio/vcap_services.svg)](https://coveralls.io/r/germanattanasio/vcap_services)
[![npm-version](https://img.shields.io/npm/v/vcap_services.svg)](https://www.npmjs.com/package/vcap_services)
[![npm-downloads](https://img.shields.io/npm/dm/vcap_services.svg)](https://www.npmjs.com/package/vcap_services)

Parse and return service credentials from `VCAP_SERVICES`.

## Installation

```sh
$ npm install vcap_services --save
```

## Usage

```sh
var vcapServices = require('vcap_services');
var credentials = vcapServices.getCredentials('personality_insights');
console.log(credentials);
```

If `VCAP_SERVICES` is:
```sh
{
  "VCAP_SERVICES": {
    "personality_insights": [{
        "credentials": {
          "password": "<password>",
          "url": "<url>",
          "username": "<username>"
        },
      "label": "personality_insights",
      "name": "personality-insights-service",
      "plan": "standard"
   }]
  }
}
```

Output:
```json
{
  "password": "<password>",
  "url": "<url>",
  "username": "<username>"
}
```

## Tests
Running all the tests:
```sh
$ npm test
```

Running a specific test:
```sh
$ mocha -g '<test name>'
```


## License

MIT.

## Contributing
See [CONTRIBUTING](https://github.com/germanattanasio/vcap_services/blob/master/CONTRIBUTING.md).
