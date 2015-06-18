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
        url: 'http://cache1.asset-cache.net/xc/479706311.jpg?v=2&c=IWSAsset&k=2&d=48Cd-2UFMkPiYPy6EBt_9dfkZ9cAf7N9GxSGSGB066G75ggZ7ZCGSgDouEDf47Kt0',
        position: '0 10%'
      }, {
        url: 'http://cache3.asset-cache.net/xc/488613187.jpg?v=2&c=IWSAsset&k=2&d=e27x9TJ6f85cSxl6ixp1rl1rI4cDtsOLYsPc55tqPfKd1NYqgmigru1zTVjLyxG80',
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
        case 'This Weekend':
          var fridayMidnight = moment().startOf('week').add(5, 'days');
          var nextMondayMidnight = moment().startOf('week').add(8, 'days');
          return eventStartTime >= fridayMidnight && eventStartTime <= nextMondayMidnight;
        case 'Next Week':
          var nextMonday = moment().startOf('week').add(8, 'days');
          var nextSundayMidnight = moment().startOf('week').add(14, 'days');
          return eventStartTime >= nextMonday && eventStartTime <= nextSundayMidnight;
        case 'This Month':
          return eventStartTime >= moment().startOf('month') && eventStartTime <= moment().startOf('month').add(1, 'month');
      }
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
