'use strict';

angular.module('confRegistrationWebApp')
  .controller('MainCtrl', function ($scope, ConfCache, $modal, $location, $http, Model, uuid) {
    $scope.$on('conferences/', function (event, conferences) {
      conferences = _.sortBy(conferences, function(conf) { return conf.name; });
      $scope.conferences = conferences;
      for (var i = 0; i < $scope.conferences.length; i++) {
        getTotalRegistrations(conferences[i].id, i);
      }
    });

    function getTotalRegistrations(confId, confIndex) {
      $http.get('conferences/' + confId + '/registrations').success(function (result) {
        $scope.conferences[confIndex].totalRegistrations = _.filter(result, function (item) {
          return item.completed === true;
        }).length;
      });
    }
    ConfCache.query();

    $scope.createConference = function () {
      $modal.open({
        templateUrl: 'views/createConference.html',
        controller: 'CreateConferenceDialogCtrl',
        resolve: {
          defaultValue: function () {
            return '';
          }
        }
      }).result.then(function (conferenceName) {
        if (conferenceName !== null && conferenceName !== '' && !angular.isUndefined(conferenceName)) {
          ConfCache.create(conferenceName).then(function (conference) {
            $location.path('/wizard/' + conference.id);
          });
        }
      });
    };


    $scope.cloneConference = function (conferenceToCloneId) {
      var conferenceToClone = _.find($scope.conferences, {id: conferenceToCloneId});

      $modal.open({
        templateUrl: 'views/cloneConference.html',
        controller: 'CreateConferenceDialogCtrl',
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
                $location.path('/wizard/' + conference.id);
              });
            });
          });
        }
      });
    };
  });
