'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: 'views/components/datepicker.html',
      restrict: 'E',
      scope: {
        'localModel': '=model'
      },
      controller: function ($timeout, $scope, TimestampUtil) {
        $scope.updateTimeStamp = function (timestamp) {
          $scope.$apply(function () {
            var zone = moment.tz.zone('America/New_York');
            $scope.localModel = TimestampUtil.convertToZone(timestamp,zone);
          });
        };
      },
      link: function (scope, element) {
        jQuery(element).find('.datepicker').datetimepicker({
          defaultDate: moment.parseZone(scope.localModel).format('MM/DD/YYYY hh:mm A')
        }).on('dp.change', function (ev) {
          scope.updateTimeStamp(ev.date);
        });
      }
    };
  });
