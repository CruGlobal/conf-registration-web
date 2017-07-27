import moment from 'moment';

import bigBreakImg from 'img/landing/big-break.jpg';
import studentsImg from 'img/landing/311.jpg';
import climbingImg from 'img/landing/187.jpg';

angular.module('confRegistrationWebApp')
  .controller('landingCtrl', function ($rootScope, $scope, $http, $cookies, $location, analytics) {
    $rootScope.globalPage = {
      type: 'landing',
      mainClass: 'dashboard',
      bodyClass: '',
      confId: 0,
      footer: true
    };

    var jumboImgs = [
      {
        url: bigBreakImg,
        position: '0 85%'
      }, {
        url: studentsImg,
        position: '0 10%'
      }, {
        url: climbingImg,
        position: '0 60%'
      }
    ];
    $scope.jumboImg = jumboImgs[_.random(0, jumboImgs.length - 1)];

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

        $scope.filterUpdate();
      });
    }, 500, {leading: false});

    $scope.filterSearchResults = function(){
      return _.filter($scope.searchResults, event => {
        return $scope.dateFilter(event) && $scope.locationFilter(event);
      });
    };

    $scope.filterUpdate = function(){
      analytics.digitalData.searchTerm = $scope.searchVal;
      analytics.digitalData.searchLocationFilter = $scope.eventFilters.locationName;
      analytics.digitalData.searchDateFilter = $scope.eventFilters.date;
      analytics.digitalData.numberOfResults = $scope.filterSearchResults().length;
      analytics.track('search');
    };

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
      return !locationFilter || locationFilter === event.locationName;
    };

    $scope.selectEvent = function(e, route){
      if(route === 'register') {
        $location.path('/register/' + e.id + '/page/');
      }else{
        $location.path('/' + route + '/' + e.id);
      }
    };
  });
