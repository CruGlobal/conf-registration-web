'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDashboardCtrl', function ($rootScope, $scope, ConfCache, conferences, $modal, modalMessage, $location, $http) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-dashboard',
      bodyClass: '',
      title: 'My Dashboard',
      confId: 0,
      footer: true
    };
    $scope.eventBoxView = 'views/components/eventDashboardEvent.html';

    $scope.conferences = _.map(angular.copy(conferences), function(c){
      c.lastAccess = localStorage.getItem('lastAccess:' + c.id);
      return c;
    });

    $scope.filterRecentEvents = function(c){
      return angular.isUndefined(_.find($scope.recentEvents, {id: c.id}));
    };

    $scope.createEvent = function () {
      $modal.open({
        templateUrl: 'views/modals/createEvent.html'
      }).result.then(function (conferenceName) {
          if(!conferenceName){ return; }

          ConfCache.create(conferenceName).then(function (conference) {
            $location.path('/eventDetails/' + conference.id);
          });
        });
    };

    $scope.requestAccess = function () {
      $modal.open({
        templateUrl: 'views/modals/accessEvent.html',
        controller: 'AccessEventCtrl'
      });
    };

    $scope.eventDisabled = function(eventData){
      return eventData.archived || eventData.loggedInUserPermissionLevel === 'REQUESTED';
    };

    $scope.goToEventPage = function (page, eventId) {
      var eventData = _.find($scope.conferences, {id: eventId});
      if (!$scope.eventDisabled(eventData)) {
        $location.path('/' + page + '/' + eventId);
      }
    };

    $scope.restoreEvent = function (eventId) {
      $rootScope.loadingMsg = 'Restoring Event';
      ConfCache.get(eventId).then(function(eventData){
        eventData.archived = false;

        $http({
          method: 'PUT',
          url: 'conferences/' + eventId,
          data: eventData
        }).success(function () {
          //Clear cache
          ConfCache.empty();
          $location.path('/eventOverview/' + eventData.id);
        }).error(function () {
          modalMessage.error('An error occurred while attempting to restore event.');
        }).finally(function() {
          $rootScope.loadingMsg = '';
        });
      });
    };

    $scope.cloneEvent = function (conferenceToCloneId) {
      var conferenceToClone = _.find(conferences, {id: conferenceToCloneId});

      $modal.open({
        templateUrl: 'views/modals/cloneEvent.html',
        controller: 'cloneEventCtrl',
        resolve: {
          defaultValue: function () {
            return conferenceToClone.name + ' (clone)';
          },
          permissions: ['PermissionCache', function (PermissionCache) {
            return PermissionCache.getForConference(conferenceToCloneId);
          }]
        }
      }).result.then(function (data) {
        if(!data.name){ return; }

        $http.post('conferences/' + conferenceToCloneId + '/clone', null, {params: {
          name: data.name,
          includePermissions: data.includePermissions
        }}).success(function(newEvent){
          ConfCache.empty();
          $location.path('/eventDetails/' + newEvent.id);
        }).error(function(){
          modalMessage.error('An error has occurred while attempting to clone.');
        });
      });
    };
  });
