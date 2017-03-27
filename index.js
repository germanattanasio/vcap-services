'use strict';

/**
 * if VCAP_SERVICES exists then it returns the credentials
 * for the last service that stars with 'name' or {} otherwise
 * If plan is specified it will return the credentials for
 * the service instance that match that plan or {} otherwise
 * @param  String name, service name
 * @param  String plan, service plan
 * @param  String iname, instance name
 * @return {Object} the service credentials or {} if
 * name is not found in VCAP_SERVICES
 */
module.exports.getCredentials = function(name, plan, iname) {
  if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    for (var service_name in services) {
      if (service_name.indexOf(name) === 0) {
        for (var i = services[service_name].length - 1; i >= 0; i--) {
          var instance = services[service_name][i];
          if ((!plan || plan === instance.plan) && (!iname || iname === instance.name))
            return instance.credentials || {};
        }
      }
    }
  } else {
    var env = process.env;
    if(iname && env[iname]) {
      console.log('returning iname');
      var instance = JSON.parse(env[iname]);
      return instance;
    }
    for (var key in env){
      if (env.hasOwnProperty(key)) {
        if (key.startsWith(name)){
          console.log('key: ' + key + 'env[key]' + env[key]);
          console.log('returning regexx');
          var instance = JSON.parse(env[key]);
          return instance;
        }
      }
        /**var regex = new RegExp( name + '_*');
        if (regex.test(key)) {

          console.log('key: ' + key + 'env[key]' + env[key]);
          console.log('returning regexx');
          var instance = JSON.parse(env[key]);
          return instance;
        }
      }**/
    }
    return {};
  }
};
