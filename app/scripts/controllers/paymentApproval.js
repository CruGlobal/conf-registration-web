
angular.module('confRegistrationWebApp')
  .controller('PaymentApprovalCtrl', function ($scope, $rootScope, $routeParams, $http, modalMessage) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'user-registration',
      title: 'Event Registration Tool',
      confId: 0,
      footer: false
    };

    $scope.payment = {};
    var paymentHash = $routeParams.paymentHash;

    //retrieve payment
    $http.get('payments/scholarship/' + paymentHash)
      .then(function(response) {
        $scope.payment = response.data;
      })
      .catch(function() {
        $scope.payment = null;
      });

    $scope.updatePayment = function(status){
      $scope.posting = true;
      var paymentObject = angular.copy($scope.payment);
      paymentObject.status = status;

      $http.put('payments/scholarship/' + paymentHash, paymentObject)
        .then(function() {
          $scope.payment = paymentObject;
        }).catch(function(response) {
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while saving the payment.');
          $scope.posting = false;
        });
    };
  });
