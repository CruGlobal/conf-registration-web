'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, $rootScope, $routeParams, $location, $window, $http, $q, $interval, RegistrationCache, conference, currentRegistration, validateRegistrant, modalMessage) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'user-registration',
      conference: conference,
      confId: conference.id,
      footer: false
    };

    var pageId = $routeParams.pageId;
    $scope.conference = angular.copy(conference);
    var originalCurrentRegistration = angular.copy(currentRegistration);
    $scope.currentRegistration = currentRegistration;
    $scope.currentRegistrant = $routeParams.reg;
    $scope.savingAnswers = false;

    $scope.activePageId = pageId || '';
    $scope.page = _.find(conference.registrationPages, { 'id': pageId });
    $scope.activePageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
    $scope.nextPage = function(){
      var visiblePageArray = _.filter($scope.conference.registrationPages, function(page) {
        return $scope.pageIsVisible(page);
      });
      return visiblePageArray[_.findIndex(visiblePageArray, { 'id': pageId }) + 1];
    };

    //if current page doesn't exist, go to first page
    if($scope.activePageIndex === -1 && angular.isDefined($scope.page)){
      $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + $scope.conference.registrationPages[0].id);
    }

    //setup visited flags array to store visits by a specific registrant to a specific page
    if(!$rootScope.visitedPages){
      $rootScope.visitedPages = [];
    }
    //bool for the show-errors directive that tells it whether the current page has been visited by the current registrant
    var pageAndRegistrantId = $scope.currentRegistrant + '_' + $scope.activePageIndex;
    $scope.currentPageVisited = _.contains($rootScope.visitedPages, pageAndRegistrantId);


    //save answers on route change
    $scope.$on('$routeChangeStart', function () {
      $interval.cancel(saveAnswersInterval);
      if(angular.isUndefined($scope.currentRegistrant)){
        return;
      }

      $scope.savingAnswers = true;
      $q.all(findAnswersToSave());
    });

    //auto save answers every 15 seconds
    var saveAnswersInterval = $interval(function(){
      if(angular.isUndefined($scope.currentRegistrant)){
        return;
      }

      $scope.savingAnswers = true;
      $q.all(findAnswersToSave()).then(function(){
        $scope.savingAnswers = false;
      });
    }, 15000);

    $scope.goToNext = function () {
      //add current page and registrant combo to the visitedPages array
      if($scope.currentRegistrant){
        $rootScope.visitedPages.push(pageAndRegistrantId);
      }

      var nextPage = $scope.nextPage();
      if (angular.isDefined(nextPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + nextPage.id);
      } else {
        $scope.reviewRegistration();
      }
    };

    $scope.previousPage = function () {
      var visiblePageArray = _.filter($scope.conference.registrationPages, function (page) {
        return $scope.pageIsVisible(page);
      });

      var previousPage = visiblePageArray[_.findIndex(visiblePageArray, {'id': pageId}) - 1];
      if (angular.isDefined(previousPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + previousPage.id);
      } else if ($scope.currentRegistration.completed) {
        $location.path('/reviewRegistration/' + conference.id);
      } else {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/').search('reg', null);
      }
    };

    $scope.reviewRegistration = function(){
      if(angular.isUndefined($scope.currentRegistrant)){
        $location.path('/reviewRegistration/' + conference.id).search('regType', null).search('reg', null);
        return;
      }

      $scope.savingAnswers = true;
      $q.all(findAnswersToSave()).then(function(){
        $location.path('/reviewRegistration/' + conference.id).search('regType', null).search('reg', null);
      });
    };

    $scope.registrantName = function(r) {
      var nameBlock = _.find(_.flatten(conference.registrationPages, 'blocks'), { 'profileType': 'NAME' }).id;
      var registrant = _.find($scope.currentRegistration.registrants, { 'id': r.id });
      var returnStr = '';
      nameBlock = _.find(registrant.answers, { 'blockId': nameBlock });

      if(angular.isDefined((nameBlock))){
        nameBlock = nameBlock.value;
        if(angular.isDefined((nameBlock.firstName))){
          returnStr = nameBlock.firstName + ' ' + (nameBlock.lastName || '');
        }
      }

      return (returnStr.trim().length ? returnStr : _.find(conference.registrantTypes, { 'id': r.registrantTypeId }).name);
    };

    $scope.registrantIsComplete = function(registrantId) {
      var invalidBlocks = validateRegistrant.validate(conference, _.find(currentRegistration.registrants, { 'id': registrantId }));
      return (invalidBlocks.length === 0);
    };

    $scope.startOver = function(){
      modalMessage.confirm({
        'title': 'Start Over',
        'question': 'Are you sure you want to start over? All answers will be erased.',
        'yesString': 'Start Over',
        'noString': 'Cancel',
        'normalSize': true
      }).then(function(){
        $scope.currentRegistration.registrants = [];
        RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration);
      });
    };

    $scope.pageIsVisible = function(page){
      return _.contains(_.map(page.blocks, function(block){
        return validateRegistrant.blockVisible(block, _.find($scope.currentRegistration.registrants, { 'id': $scope.currentRegistrant }));
      }), true);
    };

    var findAnswersToSave = function(){
      var currentRegistrantOriginalAnswers = _.find(originalCurrentRegistration.registrants, { 'id': $scope.currentRegistrant }).answers;
      var currentRegistrantAnswers = _.find($scope.currentRegistration.registrants, { 'id': $scope.currentRegistrant }).answers;
      var answersToSave = [];

      angular.forEach(currentRegistrantAnswers, function(a){
        var savedAnswer = _.find(currentRegistrantOriginalAnswers, { 'id': a.id });
        if(angular.isUndefined(savedAnswer) || !angular.equals(savedAnswer.value, a.value)){
          answersToSave.push($http.put('answers/' + a.id, a));
        }
      });

      //update originalCurrentRegistration
      originalCurrentRegistration = angular.copy($scope.currentRegistration);

      return answersToSave;
    };
  });
