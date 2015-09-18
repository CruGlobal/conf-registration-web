'use strict';

angular.module('confRegistrationWebApp')
  .controller('landingCtrl', function ($rootScope, $scope, $http, $cookies, $location, ConfCache) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'dashboard',
      bodyClass: '',
      title: '',
      confId: 0,
      footer: true
    };

    var jumboImgs = [
      {
        url: '/img/landing/big-break.jpg',
        position: '0 85%'
      }, {
        url: '/img/landing/311.jpg',
        position: '0 10%'
      }, {
        url: '/img/landing/187.jpg',
        position: '0 60%'
      }
    ];
    $scope.jumboImg = jumboImgs[_.random(0, jumboImgs.length - 1)];

    var userIsLoggedIn = angular.isDefined($cookies.crsToken) && $cookies.crsAuthProviderType !== 'NONE';
    var loggedInUserEvents = [];
    if(userIsLoggedIn){
      ConfCache.get('').then(function(response){
        loggedInUserEvents = _.pluck(response, 'id');
      });
    }

    $scope.eventSearch = _.throttle(function(val) {
      if(!val){ return; }
      if(val.length < 2){
        return;
      }
      $http.get('conferences', {
        params: {
          conferenceName: val
        }
      }).then(function(response){
        $scope.eventFilters = {
          locationName: '',
          date: ''
        };
        $scope.searchComplete = val;
        $scope.searchResults = response.data;
      });
    }, 500, {leading: false});

    $scope.dateFilter = function(event){
      var eventStartTime = moment.tz(event.eventStartTime, event.eventTimezone);

      switch($scope.eventFilters.date){
        case '':
          return true;
        case 'This Week':
          var mondayMidnight = moment().startOf('week');
          var saturdayMidnight = moment().startOf('week').add(6, 'days');
          return eventStartTime >= mondayMidnight && eventStartTime <= saturdayMidnight;
        case 'Next Week':
          var nextMonday = moment().startOf('week').add(8, 'days');
          var nextSundayMidnight = moment().startOf('week').add(14, 'days');
          return eventStartTime >= nextMonday && eventStartTime <= nextSundayMidnight;
        case 'This Month':
          return eventStartTime >= moment().startOf('month') && eventStartTime <= moment().startOf('month').add(1, 'month');
        case 'Next Month':
          return eventStartTime >= moment().startOf('month').add(1, 'month') && eventStartTime <= moment().startOf('month').add(2, 'month');
        case 'Greater Than Next Month':
          return eventStartTime >= moment().startOf('month').add(2, 'month');
      }
    };

    $scope.locationFilter = function(event){
      var locationFilter = $scope.eventFilters.locationName;
      return !locationFilter || locationFilter == event.locationName;
    };

    $scope.selectEvent = function(e, route){
      if(route === 'register') {
        $location.path('/register/' + e.id + '/page/');
      }else{
        $location.path('/' + route + '/' + e.id);
      }
    };

    $scope.userAdminForEvent = function(eventId){
      return _.contains(loggedInUserEvents, eventId);
    };
  });
