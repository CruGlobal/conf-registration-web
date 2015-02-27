'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventRegistrationsCtrl', function ($rootScope, $scope, $modal, $http, RegistrationCache, registrations, conference, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'registrations',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    var permissionRequiredMsg = 'You do not have permission to perform this action. Please contact an event administrator to request permission.';

    $scope.conference = conference;
    $scope.blocks = [];
    $scope.reversesort = false;
    $scope.order = 'lastName';
    $scope.filterIncompleteRegistrations = 'hide';
    $scope.filterCheckedInRegistrations = 'show';
    $scope.filterWithdrawnRegistrations = 'show';
    $scope.filterRegistrantType = '';
    $scope.visibleFilterRegistrantTypes = _.sortBy(conference.registrantTypes, 'name');
    $scope.visibleFilterRegistrantTypes.unshift({
      id: '',
      name: '-Any-'
    });
    var expandedRegistrations = {};

    $scope.registrations = registrations;
    $scope.registrants = _.flatten(registrations, 'registrants');

    //collect all blocks from the conferences' pages
    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type !== 'paragraphContent') {
          $scope.blocks.push(angular.copy(block));
        }
      });
    });
    //turn on visible blocks
    var visibleBlocks = localStorage.getItem('visibleBlocks:' + conference.id);
    if(!_.isNull(visibleBlocks)){
      visibleBlocks = JSON.parse(visibleBlocks);
      angular.forEach(visibleBlocks, function(blockId){
        var block = _.find($scope.blocks, { 'id': blockId });
        if(angular.isDefined(block)){
          block.visible = true;
        }
      });
    }

    // toggle (show/hide) column(s)
    $scope.toggleColumn = function (block) {
      $scope.blocks[block].visible = !$scope.blocks[block].visible;
      var visibleBlocks =  _.pluck(_.where($scope.blocks, { 'visible': true }), 'id');
      localStorage.setItem('visibleBlocks:' + conference.id, JSON.stringify(visibleBlocks));
      if(!$scope.blocks[block].visible){
        return;
      }

      RegistrationCache.getAllForConference(conference.id, visibleBlocks).then(function(registrations){
        $scope.registrations = registrations;
        $scope.registrants = _.flatten(registrations, 'registrants');
        expandedRegistrations = {};
      });
    };

    $scope.blockIsVisible = function(block, registrantTypeId){
      return !_.contains(block.registrantTypes, registrantTypeId);
    };

    var findAnswer = function (registration, blockId) {
      return _.find(registration.answers, function (answer) {
        return angular.equals(answer.blockId, blockId);
      });
    };

    $scope.answerSort = function (registration) {
      if (angular.isDefined($scope.order)) {
        if($scope.order === 'completed'){
          return $scope.getRegistration(registration.registrationId).completedTimestamp;
        }else if($scope.order === 'created'){
          return $scope.getRegistration(registration.registrationId).createdTimestamp;
        }else if($scope.order === 'type'){
          return $scope.getRegistrantType(registration.registrantTypeId).name;
        }else if($scope.order === 'firstName'){
          return registration.firstName;
        }else if($scope.order === 'lastName'){
          return registration.lastName;
        }else if($scope.order === 'email') {
          return registration.email;
        }else if($scope.order === 'checkedIn') {
          return registration.checkedInTimestamp;
        }else{
          if (angular.isDefined(findAnswer(registration, $scope.order))) {
            var answerValue = findAnswer(registration, $scope.order).value;
            if(_.isObject(answerValue)){
              return _.values(findAnswer(registration, $scope.order).value).join(' ');
            }else{
              return answerValue;
            }
          }
        }
      } else {
        return 0;
      }
    };

    $scope.setOrder = function (order) {
      if (order === $scope.order) {
        $scope.reversesort = !$scope.reversesort;
      } else {
        $scope.reversesort = false;
      }
      $scope.order = order;
    };

    $scope.viewPayments = function (registrationId) {
      $http.get('registrations/' + registrationId).success(function (registration) {
        var paymentModalOptions = {
          templateUrl: 'views/modals/paymentsModal.html',
          controller: 'paymentModal',
          size: 'lg',
          backdrop: 'static',
          resolve: {
            registration: function () {
              return registration;
            },
            conference: function () {
              return conference;
            },
            permissions: function () {
              return permissions;
            }
          }
        };

        $modal.open(paymentModalOptions).result.then(function (updatedRegistration) {
          var localUpdatedRegistrationIndex = _.findIndex($scope.registrations, { 'id': updatedRegistration.id });
          $scope.registrations[localUpdatedRegistrationIndex] = updatedRegistration;
        });
      }).error(function(){
        alert('Error: registration data could be be retrieved.');
      });
    };

    // define payment categories
    $scope.paymentCategories = [
      {
        name: '-Any-',
        matches: function () {
          return true;
        }
      },
      {
        name: 'Full/Overpaid',
        matches: function (x, y) {
          return x >= y;
        }
      },
      {
        name: 'Partial',
        matches: function (x, y) {
          return x > 0 && x < y;
        }
      },
      {
        name: 'Full/Partial',
        matches: function (x) {
          return x > 0;
        }
      },
      {
        name: 'Not Paid',
        matches: function (x) {
          if (x === null) {
            return true;
          }

          return x <= 0;
        }
      },
      {
        name: 'Overpaid',
        matches: function (x, y) {
          return x > y;
        }
      }
    ];

    // set current to first in array
    $scope.currentPaymentCategory = _.first($scope.paymentCategories).name;

    // determine if registration payment status matches current payment category
    $scope.paymentStatus = function (registrant) {
      var registration = _.find(registrations, { 'id': registrant.registrationId });
      var paymentCategory = _.find($scope.paymentCategories, { 'name': $scope.currentPaymentCategory });
      return paymentCategory.matches(registration.totalPaid, registration.calculatedTotalDue);
    };

    $scope.filterCompleteStatus = function (registrant) {
      var registration = _.find(registrations, {'id': registrant.registrationId});
      if ($scope.filterIncompleteRegistrations === 'hide') {
        return registration.completed;
      } else if ($scope.filterIncompleteRegistrations === 'only') {
        return !registration.completed;
      } else {
        return true;
      }
    };

    $scope.filterCheckedIn = function(registrant){
      if ($scope.filterCheckedInRegistrations === 'hide') {
        return !registrant.checkedInTimestamp;
      } else if ($scope.filterCheckedInRegistrations === 'only') {
        return registrant.checkedInTimestamp;
      } else {
        return true;
      }
    };

    $scope.filterWithdrawn = function(registrant){
      if ($scope.filterWithdrawnRegistrations === 'hide') {
        return !registrant.withdrawn;
      } else if ($scope.filterWithdrawnRegistrations === 'only') {
        return registrant.withdrawn;
      } else {
        return true;
      }
    };

    $scope.paidInFull = function (registrantId) {
      var registration = _.find(registrations, { 'id': registrantId });
      return registration.totalPaid >= registration.calculatedTotalDue;
    };

    $scope.expandRegistration = function (r) {
      if (expandedRegistrations[r] === 'open') {
        delete expandedRegistrations[r];
      } else {
        expandedRegistrations[r] = 'loading';

        $http.get('registrants/' + r).success(function (registrantData) {
          expandedRegistrations[r] = 'open';

          //update registrant
          var index = _.findIndex($scope.registrants, { 'id': registrantData.id });
          $scope.registrants[index] = registrantData;

          //update registration
          index = _.findIndex($scope.registrations, { 'id': registrantData.registrationId });
          var registrantIndex = _.findIndex($scope.registrations[index].registrants, { 'id': registrantData.id });
          $scope.registrations[index].registrants[registrantIndex] = registrantData;
        }).error(function(){
          alert('Error: registrant data could be be retrieved.');
          delete expandedRegistrations[r];
        });
      }
    };

    $scope.expandedStatus = function (r) {
      return expandedRegistrations[r];
    };

    $scope.editRegistrant = function (r) {
      if(permissions.permissionInt < permissionConstants.UPDATE){
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return permissionRequiredMsg;
            }
          }
        });
        return;
      }

      $http.get('registrations/' + r.registrationId).success(function (registration) {
        var editRegistrationDialogOptions = {
          templateUrl: 'views/modals/editRegistration.html',
          controller: 'editRegistrationModalCtrl',
          resolve: {
            registrantId: function () {
              return r.id;
            },
            registration: function () {
              return registration;
            },
            conference: function () {
              return conference;
            }
          }
        };

        $modal.open(editRegistrationDialogOptions).result.then(function (registration) {
          //update registration
          var index = _.findIndex($scope.registrations, { 'id': registration.id });
          $scope.registrations[index] = registration;

          //update registrant
          r = _.find(registration.registrants, { 'id': r.id });
          index = _.findIndex($scope.registrants, { 'id': r.id });
          $scope.registrants[index] = r;
        });
      }).error(function(){
        alert('Error: registrant data could be be retrieved.');
        delete expandedRegistrations[r];
      });
    };

    // Export conference registrations information to csv
    $scope.export = function () {
      $modal.open({
        templateUrl: 'views/modals/export.html',
        controller: 'exportDataModal',
        resolve: {
          conference: function() {
            return $scope.conference;
          },
          hasCost: function() {
            return $scope.eventHasCost();
          }
        }
      });
    };

    $scope.eventHasCost = function () {
      return _.max(_.flatten(conference.registrantTypes, 'cost')) > 0;
    };

    $scope.registerUser = function () {
      if(permissions.permissionInt < permissionConstants.UPDATE){
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return permissionRequiredMsg;
            }
          }
        });
        return;
      }

      $modal.open({
        templateUrl: 'views/modals/manualRegistration.html',
        controller: 'registrationModal',
        resolve: {
          conference: function () {
            return conference;
          }
        }
      });
    };

    $scope.getRegistration = function(id){
      return _.find(registrations, { 'id': id });
    };

    $scope.getRegistrantType = function(id){
      return _.find(conference.registrantTypes, { 'id': id });
    };

    $scope.withdrawRegistrant = function(registrant, value){
      if(permissions.permissionInt < permissionConstants.UPDATE){
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return permissionRequiredMsg;
            }
          }
        });
        return;
      }

      registrant.withdrawn = value;
      if(value){
        //used to update front view only, backend generates it's own timestamp
        registrant.withdrawnTimestamp = new Date();
      }

      //update registration
      $http.put('registrations/' + registrant.registrationId, $scope.getRegistration(registrant.registrationId)).error(function(){
        registrant.withdrawn = !value;
        alert('An error occurred while updating this registration.');
      });
    };

    $scope.checkInRegistrant = function(registrant, value){
      if(permissions.permissionInt < permissionConstants.UPDATE){
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return permissionRequiredMsg;
            }
          }
        });
        return;
      }

      var originalValue = angular.copy(registrant.checkedInTimestamp);
      registrant.checkedInTimestamp = (value ? new Date() : null);

      //update registration
      $http.put('registrations/' + registrant.registrationId, $scope.getRegistration(registrant.registrationId)).error(function(){
        registrant.checkedInTimestamp = originalValue;
        alert('An error occurred while updating this registration.');
      });
    };

    $scope.deleteRegistrant = function (registrant) {
      if(permissions.permissionInt < permissionConstants.UPDATE){
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'You do not have permission to perform this action. Please contact an event admin to request permission.';
            }
          }
        });
        return;
      }

      var modalInstance = $modal.open({
        templateUrl: 'views/modals/deleteRegistration.html',
        controller: 'deleteRegistrationCtrl'
      });

      modalInstance.result.then(function (doDelete) {
        if (doDelete) {
          var registration = _.find(registrations, { 'id': registrant.registrationId });
          var url = 'registrations/' + registration.id;

          if(registration.registrants.length > 1){
            //Delete Registrant
            url = 'registrants/' + registrant.id;
          }

          $http({
            method: 'DELETE',
            url: url
          }).success(function () {
            _.remove($scope.registrants, function (r) {
              return r.id === registrant.id;
            });

            _.remove(registration.registrants, function (r) {
              return r.id === registrant.id;
            });
          });
        }
      });
    };
  });
