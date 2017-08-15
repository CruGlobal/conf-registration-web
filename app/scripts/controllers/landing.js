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

    $scope.eventSearch = _.debounce(function(val) {
      if(!val){ return; }
      if(val.length < 2){
        return;
      }
      $http.get('conferences', {
        params: {
          conferenceName: val
        }
      }).then(function(response){
        if(angular.isDefined($scope.searchVal) && val === $scope.searchVal) {
          $scope.eventFilters = {
            locationName: '',
            date: ''
          };
          $scope.searchComplete = val;
          $scope.searchResults = response.data;

          $scope.filterUpdate();
        }
      });
    }, 800);

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
        case 'This Week':
          return eventStartTime.isBetween(
            moment().startOf('week'),
            moment().endOf('week'),
            'day', '[]'
          );
        case 'Next Week':
          return eventStartTime.isBetween(
            moment().startOf('week').add(1, 'week'),
            moment().endOf('week').add(1, 'week'),
            'day', '[]'
          );
        case 'This Month':
          return eventStartTime.isBetween(
            moment().startOf('month'),
            moment().endOf('month'),
            'day', '[]'
          );
        case 'Next Month':
          return eventStartTime.isBetween(
            moment().startOf('month').add(1, 'month'),
            moment().endOf('month').add(1, 'month'),
            'day', '[]'
          );
        case 'Greater Than Next Month':
          return eventStartTime.isSameOrAfter(
            moment().endOf('month').add(1, 'month')
          );
        default:
          return true;
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
