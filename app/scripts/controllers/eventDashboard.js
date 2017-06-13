import eventDashboardEventTemplate from 'views/components/eventDashboardEvent.html';
import createEventModalTemplate from 'views/modals/createEvent.html';
import accessEventModalTemplate from 'views/modals/accessEvent.html';
import cloneEventModalTemplate from 'views/modals/cloneEvent.html';

angular.module('confRegistrationWebApp')
  .controller('eventDashboardCtrl', function ($rootScope, $scope, ConfCache, conferences, $uibModal, modalMessage, $location, $http) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-dashboard',
      bodyClass: '',
      title: 'My Dashboard',
      confId: 0,
      footer: true
    };
    $scope.eventBoxView = eventDashboardEventTemplate;

    $scope.conferences = _.map(angular.copy(conferences), function(c){
      c.lastAccess = localStorage.getItem('lastAccess:' + c.id);
      return c;
    });

    $scope.filterRecentEvents = function(c){
      return angular.isUndefined(_.find($scope.recentEvents, {id: c.id}));
    };

    $scope.createEvent = function () {
      $uibModal.open({
        templateUrl: createEventModalTemplate
      }).result.then(function (conferenceName) {
          if(!conferenceName){ return; }

          ConfCache.create(conferenceName).then(function (conference) {
            $location.path('/eventDetails/' + conference.id);
          });
        });
    };

    $scope.requestAccess = function () {
      $uibModal.open({
        templateUrl: accessEventModalTemplate,
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
        }).then(function () {
          //Clear cache
          ConfCache.empty();
          $location.path('/eventOverview/' + eventData.id);
        }).catch(function (response) {
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error occurred while attempting to restore event.');
        }).finally(function() {
          $rootScope.loadingMsg = '';
        });
      });
    };

    $scope.cloneEvent = function (conferenceToCloneId) {
      var conferenceToClone = _.find(conferences, {id: conferenceToCloneId});

      $uibModal.open({
        templateUrl: cloneEventModalTemplate,
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
        }}).then(function(response){
          ConfCache.empty();
          $location.path('/eventDetails/' + response.data.id);
        }).catch(function(response){
          modalMessage.error(response.data && response.data.error ? response.data.error.message : 'An error has occurred while attempting to clone.');
        });
      });
    };
  });
