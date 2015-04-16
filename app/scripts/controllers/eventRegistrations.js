'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventRegistrationsCtrl', function ($rootScope, $scope, $modal, modalMessage, $http, $window, RegistrationCache, conference, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'event-registrations',
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
      block: [],
      page: 1,
      limit: 20,
      orderBy: 'last_name',
      order: 'ASC',
      filter: '',
      filterPayment: '',
      filterRegType: '',
      includeCheckedin: 'yes',
      includeWithdrawn: 'yes',
      includeIncomplete: 'no'
    };
    $scope.meta = {
      totalPages: 0
    };
    $scope.reversesort = false;
    $scope.visibleFilterRegistrantTypes = _.sortBy(angular.copy(conference.registrantTypes).concat({
      id: '',
      name: '-Any-'
    }), 'name');
    var expandedRegistrations = {};

    $scope.$watch('queryParameters', function(q, oldQ){
      //reset page
      if(q.page > 1 && q.page === oldQ.page){
        $scope.queryParameters.page = 1;
        return;
      }

      if(q.page !== oldQ.page){
        //scroll to top on page change
        $window.scrollTo(0, 0);
      }

      $scope.refreshRegistrations();
    }, true);

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
      $scope.queryParameters.block = visibleBlocks;
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
      $scope.queryParameters.block = visibleBlocks;
    };

    var throttleFilter = _.debounce(function(){
      $scope.$apply(function(){
        $scope.queryParameters.filter = $scope.strFilter;
      });
    }, 500);
    $scope.$watch('strFilter', function(strFilter){
      if(angular.isDefined(strFilter)){
        throttleFilter();
      }
    });

    $scope.refreshRegistrations = function(){
      RegistrationCache.getAllForConference(conference.id, $scope.queryParameters).then(function(data){
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

    $scope.answerSort = function (registrant) {
      var orderBy = $scope.queryParameters.orderBy;
      if (angular.isUndefined(orderBy)) {
        return 0;
      }

      if(orderBy === 'completed_timestamp'){
        return $scope.getRegistration(registrant.registrationId).completedTimestamp;
      }else if(orderBy === 'created_timestamp'){
        return registrant.createdTimestamp;
      }else if(orderBy === 'registrant_type_id'){
        return registrant.registrantTypeId;
        //return $scope.getRegistrantType(registration.registrantTypeId).name;
      }else if(orderBy === 'first_name'){
        return registrant.firstName;
      }else if(orderBy === 'last_name'){
        return registrant.lastName;
      }else if(orderBy === 'email') {
        return registrant.email;
      }else if(orderBy === 'checked_in_timestamp') {
        return registrant.checkedInTimestamp;
      }else{
        var answerValue = findAnswer(registrant, orderBy);
        if(angular.isUndefined(answerValue)){
          return '';
        }

        answerValue = answerValue.value;
        if(_.isObject(answerValue)){
          var blockType = _.find($scope.blocks, { 'id': orderBy }).type;
          if(blockType === 'checkboxQuestion'){
            return _.keys(_.pick(answerValue, function(val){ return val; })).join();
          }else{
            return _.values(answerValue).join();
          }
        }else{
          return answerValue;
        }
      }
    };

    $scope.setOrder = function (order) {
      if (order === $scope.queryParameters.orderBy) {
        $scope.reversesort = !$scope.reversesort;
      } else {
        $scope.reversesort = false;
      }
      $scope.queryParameters.orderBy = order;
      $scope.queryParameters.order = ($scope.reversesort ? 'DESC' : 'ASC');
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
        var registration = _.find($scope.registrations, { 'id': registrant.registrationId });
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
