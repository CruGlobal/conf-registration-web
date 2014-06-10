'use strict';

angular.module('confRegistrationWebApp')
  .directive('adminNav', function ($http, RegistrationCache, ConfCache, RegistrationsViewService, PaymentsViewService, ConferenceHelper, U, apiUrl) {
    return {
      templateUrl: 'views/components/adminNav.html',
      restrict: 'A',
      controller: function ($scope, $modal) {
        $scope.deleteConference = function (conferenceToDelete) {

          $modal.open({
            templateUrl: 'views/modals/confirmDeleteConf.html',
            controller: 'confirmCtrl'
          }).result.then(function (result) {
              if (result) {
                alert('delete ' + conferenceToDelete);
              }
            });
        };

        $scope.registerUser = function (conferenceId) {

          var registrationModalOptions = {
            templateUrl: 'views/modals/manualRegistration.html',
            controller: 'registrationModal',
            resolve: {
              conference: ['ConfCache', function (ConfCache) {
                return ConfCache.get(conferenceId);
              }]
            }
          };

          $modal.open(registrationModalOptions);
        };

        // Export conference registrations information to csv
        $scope.exportRegistrations = function (conferenceId) {

          ConfCache.get(conferenceId).then(function (conference) {
            RegistrationCache.getAllForConference(conferenceId).then(function (registrations) {

              var table = RegistrationsViewService.getTable(conference, registrations);

              var csvContent = U.stringifyArray(table, ',');

              var url = apiUrl + 'services/download/registrations/' + conference.name + '-registrations.csv';

              U.submitForm(url, { name: csvContent });
            });
          });
        };

        // Export conference registration payments information to csv
        $scope.exportPayments = function (conferenceId) {

          ConfCache.get(conferenceId).then(function (conference) {
            RegistrationCache.getAllForConference(conferenceId).then(function (registrations) {

              var table = PaymentsViewService.getTable(conference, registrations);

              var csvContent = U.stringifyArray(table, ',');

              var url = apiUrl + 'services/download/payments/' + conference.name + '-payments.csv';

              U.submitForm(url, { name: csvContent });
            });
          });
        };

        $scope.hasCost = function (conference) {
          return ConferenceHelper.hasCost(conference);
        };
      }
    };
  });
