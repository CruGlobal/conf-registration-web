angular
  .module('confRegistrationWebApp')
  .factory('transformCampusAnswerInterceptor', function () {
    // Transform campus answer objects to just their id before sending to the server
    function transform(answer) {
      if (
        answer &&
        angular.isObject(answer.value) &&
        answer.value.id &&
        answer.value.name
      ) {
        answer.value = answer.value.id;
      }
    }

    function walk(item) {
      if (!item || !angular.isObject(item)) return;

      // Only transform answers in data (where campus answer exists)
      if (item.blockId && item.value !== undefined) {
        transform(item);
      }

      // Handles different data shapes where campus answers may be nested
      ['answers', 'registrants', 'groupRegistrants'].forEach(function (key) {
        if (angular.isArray(item[key])) {
          item[key].forEach(walk);
        }
      });
    }

    return {
      request: function (config) {
        // Only transform data on PUT and POST requests
        if (
          (config.method === 'PUT' || config.method === 'POST') &&
          config.data
        ) {
          walk(config.data);
        }
        return config;
      },
    };
  });
