'use strict';

angular.module('confRegistrationWebApp')
  .controller('PaymentApprovalCtrl', function ($scope, $rootScope, $routeParams, $http) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      title: 'Scholarship Approval',
      confId: 0,
      footer: false
    };

    $scope.payment = {};
    var paymentHash = $routeParams.paymentHash;

    //retrieve payment
    $http.get('payments/scholarship/' + paymentHash).
      success(function(data) {
        $scope.payment = data;
      }).
      error(function() {
        //$scope.payment = null;
      });
      $scope.payment = {
        scholarship: {
          scholarshipStatus: 'DENIED'
        }
      };
  });