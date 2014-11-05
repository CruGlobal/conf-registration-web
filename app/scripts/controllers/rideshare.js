'use strict';

angular.module('confRegistrationWebApp')
  .controller('RideshareCtrl', function ($rootScope, $scope, $http, conference, registrations, ConfCache, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container conference-details',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    $scope.conference = conference;

    if (permissions.permissionInt >= permissionConstants.UPDATE) {
      if(conference.rideshareEnabled){
        $scope.templateUrl = 'views/rideshare.html';
      }else{
        return;
      }
    } else {
      $scope.templateUrl = 'views/permissionError.html';
    }

    $http.get('conferences/' + conference.id + '/rideshare').success(function (data) {
      //remove participants with uncompleted registrations
      angular.forEach(angular.copy(data), function(p){
        var completed = false;
        var registrant = _.find(_.flatten(registrations, 'registrants'), { 'id': p.personId });
        if(registrant){
          var registration = _.find(registrations, { 'id': registrant.registrationId });
          completed = registration.completed;
        }

        if(!completed){
          _.remove(data, function(rp) { return rp.id === p.id; });
        }
      });
      $scope.participants = data;

      if(!_.isEmpty($scope.participants)){
        $scope.map = {
          center: {
            latitude: _.first($scope.participants).latitude,
            longitude: _.first($scope.participants).longitude
          },
          zoom: 13
        };
      }
    });

    var centerMap = function(lat, lng){
      $scope.map.center.latitude = lat;
      $scope.map.center.longitude = lng;
    };

    var mapIcons = {
      driverUnavailable: {
        url: '/img/rideshare/UD.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      driverUnavailableSelected: {
        url: '/img/rideshare/S_UD.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      driverAvailable: {
        url: '/img/rideshare/AD.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      driverAvailableSelected: {
        url: '/img/rideshare/S_AD.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      riderAvailable: {
        url: '/img/rideshare/AR.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      riderUnavailable: {
        url: '/img/rideshare/UR.png',
        scaledSize: new google.maps.Size(24, 24)
      },
      riderUnavailableDriverSelected: {
        url: '/img/rideshare/S_UR.png',
        scaledSize: new google.maps.Size(24, 24)
      }
    };
    $scope.markerIcon = function(p){
      switch(p.driveWillingness) {
        case 'drive':
          if($scope.countAssignedRiders(p.id) >= p.numberPassengers){
            if($scope.selectedDriver === p.id){
              return mapIcons.driverUnavailableSelected;
            }
            return mapIcons.driverUnavailable;
          }else{
            if($scope.selectedDriver === p.id){
              return mapIcons.driverAvailableSelected;
            }
            return mapIcons.driverAvailable;
          }
          break;
        case 'ride':
          if(p.driverRideId){
            if($scope.selectedDriver === p.driverRideId){
              return mapIcons.riderUnavailableDriverSelected;
            }
            return mapIcons.riderUnavailable;
          }
          return mapIcons.riderAvailable;
      }
    };

    $scope.drivers = function(){
      return _.filter($scope.participants, { 'driveWillingness': 'drive' });
    };

    $scope.ridersUnassigned = function(){
      return _.filter($scope.participants, { 'driveWillingness': 'ride', 'driverRideId': null });
    };

    $scope.ridersAssigned = function(){
      return _.filter($scope.participants, function(p) { return p.driveWillingness === 'ride' && p.driverRideId; });
    };

    $scope.nonParticipants = function(){
      return _.filter($scope.participants, function(p) { return p.driveWillingness === 'na'; });
    };

    $scope.registrantName = function(id) {
      var nameBlock = _.find(_.flatten(conference.registrationPages, 'blocks'), { 'profileType': 'NAME' }).id;
      var registrant = _.find(_.flatten(registrations, 'registrants'), { 'id': id });
      if(angular.isUndefined(registrant)){
        return 'Undefined';
      }
      var returnStr;
      nameBlock = _.find(registrant.answers, { 'blockId': nameBlock });

      if(angular.isDefined((nameBlock))){
        nameBlock = nameBlock.value;
        if(angular.isDefined((nameBlock.firstName))){
          returnStr = nameBlock.firstName + ' ' + (nameBlock.lastName || '');
        }
      }

      return returnStr;
    };

    $scope.selectDriver = function(driver){
      $scope.selectedDriver = driver.id;
      centerMap(driver.latitude, driver.longitude);
    };

    $scope.selectRider = function(rider){
      centerMap(rider.latitude, rider.longitude);
    };

    $scope.assignRider = function(rider){
      var driver = _.find($scope.participants, { 'id': $scope.selectedDriver });
      if($scope.countAssignedRiders(driver.id) >= driver.numberPassengers){
        alert('Cannot add rider, selected car is already full.');
        return;
      }
      rider.driverRideId = $scope.selectedDriver;
    };

    $scope.unassignRider = function(rider){
      rider.driverRideId = null;
    };

    $scope.countAssignedRiders = function(driver){
      if(driver) {
        return _.filter($scope.participants, { 'driveWillingness': 'ride', 'driverRideId': driver }).length;
      }else{
        var seats = _.pluck($scope.drivers(), 'numberPassengers');
        if(!_.isEmpty(seats)){
          var totalSeats = seats.reduce(function(a, b) {
            return a + b;
          });
          return totalSeats - $scope.ridersAssigned().length;
        }
        return 0;
      }
    };

    $scope.formatTime = function(time){
      return moment(time).format('h:mma');
    };
  });