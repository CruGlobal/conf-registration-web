'use strict';

angular.module('confRegistrationWebApp')
  .factory('debouncePutsInterceptor', function ($timeout, $q) {
    var waitingRequests = {
      // url :       // URL of the request
      //   {
      //     holdRequests: boolean,
      //     timer: Promise of the config waiting to be flushed by the timeout
      //   }
    };

    var passThrough = function (config) {
      var fn = function () {
        waitingRequests[config.url].holdRequests = false;
      };
      waitingRequests[config.url] = {
        holdRequests: true,
        timer: $timeout(fn, 200)
      };
    };

    var holdRequest = function (config) {
      $timeout.cancel(waitingRequests[config.url].timer);
      var fn = function () {
        waitingRequests[config.url].holdRequests = false;
        return config;
      };
      return waitingRequests[config.url].timer = $timeout(fn, 200);
    };

    return {
      request: function (config) {
        var deferredConfig;
        if (config.method === 'PUT') {
          if (waitingRequests[config.url] && waitingRequests[config.url].holdRequests) {
            deferredConfig = holdRequest(config);
          } else {
            passThrough(config);
          }
        }

        return deferredConfig || config;
      }
    };
  });
