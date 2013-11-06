'use strict';

angular.module('confRegistrationWebApp')
  .controller('ReviewRegistrationCtrl', function ($scope, $rootScope, $location, registration, conference, $modal, Model) {

    $scope.conference = conference;
    $scope.registration = registration;
    $scope.answers = registration.answers;
    $scope.blocks = [];

    console.log($rootScope);

    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(block);
        }
      });
    });

    $scope.findAnswer = function (blockId) {
      return _.find($scope.answers, {blockId: blockId});
    };

    $scope.confirmRegistration = function () {
      if (!conference.acceptCreditCards) {
        setRegistrationAsCompleted();
        return;
      }

      registration.currentPayment = {};
      registration.currentPayment.registrationId = registration.id;
      registration.currentPayment.amount = $rootScope.currentPayment.amount;
      registration.currentPayment.creditCardNameOnCard = $rootScope.currentPayment.creditCardNameOnCard;
      registration.currentPayment.creditCardExpirationMonth = $rootScope.currentPayment.creditCardExpirationMonth;
      registration.currentPayment.creditCardExpirationYear = $rootScope.currentPayment.creditCardExpirationYear;
      registration.currentPayment.creditCardNumber = $rootScope.currentPayment.creditCardNumber;
      registration.currentPayment.creditCardCVVNumber = $rootScope.currentPayment.creditCardCVVNumber;
      registration.currentPayment.readyToProcess = true;

      Model.update('/registrations/' + registration.id, registration, function (result) {

        console.log(result.status);

        if (result.status === 501) {
          var errorModalOptions = {
            templateUrl: 'views/errorModal.html',
            controller: 'errorModal',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              message: function () {
                return 'Your card was declined, please verify and re-enter your details or use a different card.';
              }
            }
          };
          $modal.open(errorModalOptions).result.then(function () {
            $location.path('/payment/' + conference.id);
          });
          return;
        } else {
          setRegistrationAsCompleted();
        }
      });
    };

    function setRegistrationAsCompleted() {
      registration.completed = true;
      Model.update('/registrations/' + registration.id, registration, function () {
        $scope.registration.completed = true;
      });
    }

    $scope.editRegistration = function () {
      $location.path('/register/' + conference.id + '/page/' + conference.registrationPages[0].id);
    };
    $scope.editPayment = function () {
      $location.path('/payment/' + conference.id);
    };
  });
