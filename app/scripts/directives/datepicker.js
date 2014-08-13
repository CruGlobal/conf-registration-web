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
            $scope.localModel = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
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
