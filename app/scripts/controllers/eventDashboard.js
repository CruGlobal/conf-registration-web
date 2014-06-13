'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDashboardCtrl', function ($rootScope, $scope, ConfCache, RegistrationCache, $modal, $location, $http, Model, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'dashboard',
      bodyClass: '',
      title: 'My Dashboard',
      confId: 0,
      footer: true
    };

    $scope.$on('conferences/', function (event, conferences) {
      $scope.conferences = conferences;
    });
    ConfCache.query();

    $scope.createEvent = function () {
      $modal.open({
        templateUrl: 'views/modals/createEvent.html',
        controller: 'createEventCtrl',
        resolve: {
          defaultValue: function () {
            return '';
          }
        }
      }).result.then(function (conferenceName) {
          if (conferenceName !== null && conferenceName !== '' && !angular.isUndefined(conferenceName)) {
            ConfCache.create(conferenceName).then(function (conference) {
              $location.path('/eventDetails/' + conference.id);
            });
          }
        });
    };

    $scope.goToEventPage = function (page, eventId) {
      $location.path('/' + page + '/' + eventId);
    };

    $scope.cloneEvent = function (conferenceToCloneId) {
      var conferenceToClone = _.find($scope.conferences, {id: conferenceToCloneId});

      $modal.open({
        templateUrl: 'views/modals/cloneEvent.html',
        controller: 'createEventCtrl',
        resolve: {
          defaultValue: function () {
            return conferenceToClone.name + ' (clone)';
          }
        }
      }).result.then(function (conferenceName) {
        if (conferenceName !== null && conferenceName !== '' && !angular.isUndefined(conferenceName)) {
          ConfCache.create(conferenceName).then(function (conference) {
            var conferenceOrig = conference;
            $http.get('conferences/' + conferenceToClone.id).success(function (result) {
              //clone conference details
              conference = angular.copy(result);
              conference.contactUser = conferenceOrig.contactUser;
              conference.id = conferenceOrig.id;
              conference.name = conferenceName;

              //clone conference pages
              conference.registrationPages = result.registrationPages;
              for (var i = 0; i < conference.registrationPages.length; i++) {
                var pageUuid = uuid();
                conference.registrationPages[i].id = pageUuid;
                conference.registrationPages[i].conferenceId = conference.id;
                for (var j = 0; j < conference.registrationPages[i].blocks.length; j++) {
                  conference.registrationPages[i].blocks[j].id = uuid();
                  conference.registrationPages[i].blocks[j].pageId = pageUuid;
                }
              }
              Model.update('conferences/' + conference.id, conference, function () {
                $location.path('/eventDetails/' + conference.id);
              });
            });
          });
        }
      });
    };
  });
