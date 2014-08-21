'use strict';

angular.module('confRegistrationWebApp')
  .filter('evtDateFormat', function () {
    return function (date, zone) {
      return moment.tz(date, zone).format('MMM D, YYYY h:mm a z');
    };
  });