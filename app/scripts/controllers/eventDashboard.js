'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventDashboardCtrl', function ($rootScope, $scope, ConfCache, conferences, $modal, modalMessage, $location, $http, Model, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-dashboard',
      bodyClass: '',
      title: 'My Dashboard',
      confId: 0,
      footer: true
    };

    $scope.conferences = _.map(conferences, function(c){
      c.lastAccess = localStorage.getItem('lastAccess:' + c.id);
      return c;
    });

    $scope.filterRecentEvents = function(c){
      return angular.isUndefined(_.find($scope.recentEvents, {id: c.id}));
    };

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

    $scope.requestAccess = function () {
      $modal.open({
        templateUrl: 'views/modals/accessEvent.html',
        controller: 'AccessEventCtrl'
      });
    };

    $scope.goToEventPage = function (page, eventId) {
      var eventData = _.find($scope.conferences, {id: eventId});
      if (!eventData.archived) {
        $location.path('/' + page + '/' + eventId);
      }
    };

    $scope.restoreEvent = function (eventId) {
      var eventData = _.find($scope.conferences, {id: eventId});
      eventData.archived = false;

      $http({
        method: 'PUT',
        url: 'conferences/' + eventId,
        data: eventData
      }).success(function () {
        //Clear cache
        ConfCache.empty();
      }).error(function (data) {
        modalMessage.error('Error: ' + data.errorMessage);
        eventData.archived = true;
      });
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
              conference.id = conferenceOrig.id;
              conference.name = conferenceName;

              //remove payment gateway info
              conference.paymentGatewayType = 'AUTHORIZE_NET';
              conference.paymentGatewayId = null;

              // map the old id to the new id so that question to registrant type assignments can be cloned.
              var registrantTypeIdMap = {};
              var blockIdMap = {};

              angular.forEach(conference.registrantTypes, function(v, i){
                var originalRegTypeId = conference.registrantTypes[i].id;
                var clonedRegTypeId = uuid();
                registrantTypeIdMap[originalRegTypeId] = clonedRegTypeId;
                conference.registrantTypes[i].id = clonedRegTypeId;
                conference.registrantTypes[i].conferenceId = conference.id;

                //clone earlyRegistrationDiscounts
                angular.forEach(conference.registrantTypes[i].earlyRegistrationDiscounts, function(v, k){
                  conference.registrantTypes[i].earlyRegistrationDiscounts[k].id = uuid();
                  conference.registrantTypes[i].earlyRegistrationDiscounts[k].registrantTypeId = clonedRegTypeId;
                });
              });

              //clone promotions
              angular.forEach(conference.promotions, function(v, i){
                conference.promotions[i].id = uuid();
                conference.promotions[i].conferenceId = conference.id;

                var originalRegTypeIds = angular.copy(conference.promotions[i].registrantTypeIds);
                conference.promotions[i].registrantTypeIds = [];
                angular.forEach(originalRegTypeIds, function(id){
                  conference.promotions[i].registrantTypeIds.push(registrantTypeIdMap[id]);
                });
              });

              //clone conference pages
              conference.registrationPages = result.registrationPages;
              for (var i = 0; i < conference.registrationPages.length; i++) {
                var pageUuid = uuid();
                conference.registrationPages[i].id = pageUuid;
                conference.registrationPages[i].conferenceId = conference.id;
                for (var j = 0; j < conference.registrationPages[i].blocks.length; j++) {
                  var blockUuid = uuid();
                  blockIdMap[conference.registrationPages[i].blocks[j].id] = blockUuid;
                  conference.registrationPages[i].blocks[j].id = blockUuid;
                  conference.registrationPages[i].blocks[j].pageId = pageUuid;

                  //block rules
                  for (var l = 0; l < conference.registrationPages[i].blocks[j].rules.length; l++) {
                    conference.registrationPages[i].blocks[j].rules[l].id = uuid();
                    conference.registrationPages[i].blocks[j].rules[l].blockId = blockUuid;
                    conference.registrationPages[i].blocks[j].rules[l].parentBlockId = blockIdMap[conference.registrationPages[i].blocks[j].rules[l].parentBlockId];
                  }

                  // take a copy of the registrantTypes for this block
                  var originalRegTypeIds = angular.copy(conference.registrationPages[i].blocks[j].registrantTypes);

                  // clear the registrantTypes on the block (a copy was just made)
                  conference.registrationPages[i].blocks[j].registrantTypes = [];

                  // loop through the registantTypes from the original block
                  for(var k = 0; k <  originalRegTypeIds.length; k++) {
                    // take the original block ID, and look up the new on that corresponds to it in the map.
                    // add that new Id to the registrant types on the block
                    var id = originalRegTypeIds[k];
                    conference.registrationPages[i].blocks[j].registrantTypes.push(registrantTypeIdMap[id]);
                  }
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
