'use strict';

angular.module('confRegistrationWebApp')
  .controller('RideshareReportCtrl', function ($rootScope, $scope, $http, conference, registrations) {
    $rootScope.globalPage = {
      type: '',
      mainClass: '',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: false
    };

    $scope.conference = conference;
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
    });

    $scope.riders = function(driverId){
      return _.filter($scope.participants, { 'driveWillingness': 'ride', 'driverRideId': driverId });
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

    $scope.formatTime = function(time){
      return moment(time).format('h:mma');
    };
  });