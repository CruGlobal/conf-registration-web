import moment from 'moment';

angular.module('confRegistrationWebApp')
  .filter('dateRangeFormat', function () {
    return function (date) {
      if(date) {
        return moment(date,'YYYY-MM-DD').format('MMM DD, YYYY');
      }else{
        return '';
      }
    };
  });
