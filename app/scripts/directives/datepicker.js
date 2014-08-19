'use strict';

angular.module('confRegistrationWebApp')
  .directive('crsDatetimepicker', function () {
    return {
      templateUrl: 'views/components/datepicker.html',
      restrict: 'E',
      scope: {
        'localModel': '=model'
      },
      controller: function ($timeout, $scope) {
        $scope.updateTimeStamp = function (timestamp) {
          $scope.$apply(function () {
            $scope.localModel = moment(timestamp);
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