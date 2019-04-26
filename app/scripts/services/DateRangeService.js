import moment from 'moment';

angular
  .module('confRegistrationWebApp')
  .service('DateRangeService', function DateChangeEmitter() {
    var subscribed = {};
    var cache = {};

    this.subscribe = function(emitter, callback) {
      if (angular.isUndefined(subscribed[emitter])) subscribed[emitter] = [];

      subscribed[emitter].push(callback);

      if (angular.isDefined(cache[emitter])) {
        callback(cache[emitter]);
      }
    };

    this.emitChange = function(emitter, value) {
      cache[emitter] = value;

      angular.forEach(subscribed[emitter], function(callback) {
        callback(value);
      });
    };

    this.calculateDateRange = function(startDate, endDate) {
      if (
        angular.isUndefined(startDate) ||
        startDate === null ||
        startDate === ''
      ) {
        return 1;
      }
      if (angular.isUndefined(endDate) || endDate === null || endDate === '') {
        return 1;
      }

      const days = moment(endDate).diff(moment(startDate), 'days');

      if (days === 0) return 1;
      return days > 0 ? days : days * -1;
    };
  });
