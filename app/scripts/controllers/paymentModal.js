angular.module('confRegistrationWebApp')
  .controller('paymentModal', function ($scope, $modalInstance, $http, data, RegistrationCache) {
    $scope.registration = data;
    $scope.close = function () {
      $modalInstance.close($scope.registration);
    };

    $scope.newPayment = {
      registrationId: $scope.registration.id
    };

    $scope.processPayment = function() {
      $scope.newPayment.readyToProcess = true;
      $http.post('payments/', $scope.newPayment).success(function (){
        $http.get('registrations/' + $scope.registration.id).success(function (data){
          RegistrationCache.update('registrations/' + data.id, data, function (){});
          $scope.registration = data;
        });
        $scope.addNewPayment = false;
        delete $scope.newPayment;
      }).error(function (reason){
        alert('payment failed...');
      });
    }
  });