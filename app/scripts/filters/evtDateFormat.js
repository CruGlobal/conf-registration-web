import moment from 'moment';

angular.module('confRegistrationWebApp').filter('evtDateFormat', function() {
  return function(date, zone, format) {
    if (!format) {
      format = 'MMM D, YYYY h:mm a z';
    }

    return moment.tz(date, zone).format(format);
  };
});
