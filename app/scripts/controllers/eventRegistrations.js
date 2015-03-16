'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventRegistrationsCtrl', function ($rootScope, $scope, $modal, modalMessage, $http, RegistrationCache, conference, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'registrations',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };

    function hasPermission(){
      if(permissions.permissionInt < permissionConstants.UPDATE){
        modalMessage.error('You do not have permission to perform this action. Please contact an event administrator to request permission.');
        return false;
      }else{
        return true;
      }
    }

    $scope.conference = conference;
    $scope.blocks = [];
    $scope.queryParameters = {
      //blocks: [],
      page: 1,
      limit: 20,
      orderBy: 'last_name',
      order: 'ASC',
      filter: '',
      filterPayment: '',
      filterRegType: '',
      filterCheckin: 'yes',
      filterWithdrawn: 'yes',
      filterIncomplete: 'no'
    };
    $scope.meta = {
      totalPages: 0
    };
    $scope.$watch('queryParameters', function(q, oldQ){
      //reset page
      if(q.page > 1 && q.page === oldQ.page){
        $scope.queryParameters.page = 1;
        return;
      }
      console.log($scope.queryParameters);

      $scope.refreshRegistrations();
    }, true);


    $scope.paginationRange = function(){
      var start = 1, end = $scope.meta.totalPages;

      var pagination = [start].concat(_.range(($scope.queryParameters.page - 3), $scope.queryParameters.page + 4), _.range((end - 1), end));
      _.remove(pagination, function(num) {
        return num < 1 || num >= end;
      });
      return _.uniq(pagination);
    };
    $scope.reversesort = false;
    $scope.order = 'lastName';
    $scope.filterRegistrantType = '';
    $scope.visibleFilterRegistrantTypes = _.sortBy(angular.copy(conference.registrantTypes).concat({
      id: '',
      name: '-Any-'
    }), 'name');
    var expandedRegistrations = {};

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
      visibleBlocks =  _.pluck(_.where($scope.blocks, { 'visible': true }), 'id');
      localStorage.setItem('visibleBlocks:' + conference.id, JSON.stringify(visibleBlocks));
      if($scope.blocks[block].visible){
        $scope.refreshRegistrations();
      }
    };

    $scope.refreshRegistrations = function(){
      RegistrationCache.getAllForConference(conference.id, $scope.queryParameters).then(function(data){
        console.log(data);
        $scope.meta = data.meta;
        $scope.registrations = data.registrations;
        $scope.registrants = _.flatten(data.registrations, 'registrants');
        expandedRegistrations = {};
      }, function(){
        $scope.registrations = [];
        $scope.registrants = [];
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
        modalMessage.error('Error: registration data could be be retrieved.');
      });
    };

    // determine if registration payment status matches current payment category
    $scope.paymentStatus = function (registrant) {
      var registration = _.find($scope.registrations, { 'id': registrant.registrationId });
      var paymentCategory = _.find($scope.paymentCategories, { 'name': $scope.currentPaymentCategory });
      return paymentCategory.matches(registration.totalPaid, registration.calculatedTotalDue);
    };

    $scope.filterCompleteStatus = function (registrant) {
      var registration = _.find($scope.registrations, {'id': registrant.registrationId});
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
      var registration = _.find($scope.registrations, { 'id': registrantId });
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
          modalMessage.error('Error: registrant data could be be retrieved.');
          delete expandedRegistrations[r];
        });
      }
    };

    $scope.expandedStatus = function (r) {
      return expandedRegistrations[r];
    };

    $scope.editRegistrant = function (r) {
      if(!hasPermission()){
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
        modalMessage.error('Error: registrant data could be be retrieved.');
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
      if(!hasPermission()){
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
      return _.find($scope.registrations, { 'id': id });
    };

    $scope.getRegistrantType = function(id){
      return _.find(conference.registrantTypes, { 'id': id });
    };

    $scope.withdrawRegistrant = function(registrant, value){
      if(!hasPermission()){
        return;
      }

      registrant.withdrawn = value;
      if(value){
        //used to update front view only, backend generates its own timestamp
        registrant.withdrawnTimestamp = new Date();
      }

      //update registration
      var registrationIndex = _.findIndex($scope.registrations, { 'id': registrant.registrationId });
      var registrantIndex = _.findIndex($scope.registrations[registrationIndex].registrants, { 'id': registrant.id });
      $scope.registrations[registrationIndex].registrants[registrantIndex] = registrant;

      $rootScope.loadingMsg = (value ? 'Withdrawing ' : 'Reinstating ') + registrant.firstName;
      $http.put('registrations/' + registrant.registrationId, $scope.registrations[registrationIndex]).success(function(){
        $rootScope.loadingMsg = '';
      }).error(function(){
        $rootScope.loadingMsg = '';
        registrant.withdrawn = !value;
        modalMessage.error('An error occurred while withdrawing this registrant.');
      });
    };

    $scope.checkInRegistrant = function(registrant, value){
      if(!hasPermission()){
        return;
      }

      var originalValue = angular.copy(registrant.checkedInTimestamp);
      registrant.checkedInTimestamp = (value ? new Date().toJSON() : null);

      //update registration
      var registrationIndex = _.findIndex($scope.registrations, { 'id': registrant.registrationId });
      var registrantIndex = _.findIndex($scope.registrations[registrationIndex].registrants, { 'id': registrant.id });
      $scope.registrations[registrationIndex].registrants[registrantIndex] = registrant;

      $rootScope.loadingMsg = (value ? 'Checking in ' : 'Removing check-in for ') + registrant.firstName;
      $http.put('registrations/' + registrant.registrationId, $scope.registrations[registrationIndex]).success(function(){
        $rootScope.loadingMsg = '';
      }).error(function(){
        $rootScope.loadingMsg = '';
        registrant.checkedInTimestamp = originalValue;
        modalMessage.error('An error occurred while checking in this registrant.');
      });
    };

    $scope.deleteRegistrant = function (registrant) {
      if(!hasPermission()){
        return;
      }

      modalMessage.confirm('Delete Registration', 'Are you sure you want to delete this registration?<br>There is no recovering the data once deleted.', 'Delete', 'Cancel', true).then(function(){
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
      });
    };
  });
