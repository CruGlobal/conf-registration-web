'use strict';

angular.module('confRegistrationWebApp')
  .service('TimestampUtil', function TimestampUtil() {
    this.convertToZone = function(timestamp, zone) {

      var offsetFromUTCInMinutes = new Date().getTimezoneOffset();
      var offsetFromEasternTimeInMinutes = offsetFromUTCInMinutes - zone.offset(timestamp);

      timestamp.subtract(offsetFromEasternTimeInMinutes, 'minutes');

      return timestamp;
    };
  });