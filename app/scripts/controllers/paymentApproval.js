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
        $scope.payment = null;
      });

    $scope.updatePayment = function(status){
      $scope.posting = true;
      var paymentObject = angular.copy($scope.payment);
      paymentObject.scholarship.scholarshipStatus = status;

      $http.put('payments/scholarship/' + paymentHash, paymentObject).
        success(function() {
          $scope.payment = paymentObject;
        }).
        error(function() {
          alert('An error occurred while saving the payment.');
          $scope.posting = false;
        });
    };
  });
