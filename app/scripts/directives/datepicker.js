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
          var saveDate = new Date(timestamp);
          $scope.$apply(function () {
            $scope.localModel = saveDate;
          });
        };
      },
      link: function (scope, element) {
        var inputDate = new Date(scope.localModel);
        jQuery(element).find('.datepicker').datetimepicker({
          defaultDate: moment(inputDate).format('MM/DD/YYYY hh:mm A')
        }).on('dp.change', function (ev) {
          scope.updateTimeStamp(ev.date);
        });
      }
    };
  });
