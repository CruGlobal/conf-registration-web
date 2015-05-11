'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, $rootScope, $sce, $routeParams, $location, $window, RegistrationCache, conference, currentRegistration, validateRegistrant, modalMessage) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      conference: conference,
      confId: conference.id,
      footer: false
    };

    var pageId = $routeParams.pageId;

    if(angular.isUndefined(pageId) && currentRegistration.completed) {
      $location.path('reviewRegistration/' + conference.id);
    }

    $scope.validPages = {};
    $scope.$on('pageValid', function (event, validity) {
      event.stopPropagation();
      $scope.validPages[event.targetScope.page.id] = validity;
      $scope.registrationComplete = _.filter($scope.validPages).length === $scope.conference.registrationPages.length;
    });

    $scope.conference = angular.copy(conference);
    $scope.currentRegistration = currentRegistration;
    $scope.currentRegistrant = $routeParams.reg;

    //remove blocks that are not part of registrant type
    if(angular.isDefined($routeParams.reg)){
      var reg = _.find(currentRegistration.registrants, { 'id': $routeParams.reg});
      if(angular.isUndefined(reg)){
        $location.path($rootScope.registerMode + '/' + $scope.conference.id + '/page/').search('reg', null);
        return;
      }
      angular.forEach(angular.copy(conference.registrationPages), function(page) {
        var pageIndex = _.findIndex($scope.conference.registrationPages, { 'id': page.id });
        angular.forEach(angular.copy(page.blocks), function(block) {
          if (_.contains(block.registrantTypes, reg.registrantTypeId)) {
            _.remove($scope.conference.registrationPages[pageIndex].blocks, function(b) { return b.id === block.id; });
          }
        });

        if($scope.conference.registrationPages[pageIndex].blocks.length === 0) {
          _.remove($scope.conference.registrationPages, function(p) { return p.id === page.id; });
        }
      });
    }

    $scope.activePageId = pageId || '';
    $scope.page = _.find(conference.registrationPages, { 'id': pageId });
    $scope.activePageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });

    function getPageAfterById(pageId) {
      var pages = $scope.conference.registrationPages;
      for (var i = 0; i < pages.length; i++) {
        if (angular.equals(pageId, pages[i].id)) {
          return pages[i + 1];
        }
      }
    }

    $scope.nextPage = getPageAfterById(pageId);

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

    $scope.goToNext = function () {
      //add current page and registrant combo to the visitedPages array
      if($scope.currentRegistrant){
        $rootScope.visitedPages.push(pageAndRegistrantId);
      }

      if (angular.isDefined($scope.nextPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + $scope.nextPage.id);
      } else {
        $location.path('/reviewRegistration/' + conference.id).search('regType', null);
      }
    };

    $scope.previousPage = function () {
      var previousPage = $scope.conference.registrationPages[$scope.activePageIndex - 1];
      if (angular.isDefined(previousPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + previousPage.id);
      } else if($scope.currentRegistration.completed) {
        $location.path('/reviewRegistration/' + conference.id);
      } else {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/');
      }
    };

    $scope.registrantName = function(r) {
      var nameBlock = _.find(_.flatten(conference.registrationPages, 'blocks'), { 'profileType': 'NAME' }).id;
      var registrant = _.find(currentRegistration.registrants, { 'id': r.id });
      var returnStr;
      nameBlock = _.find(registrant.answers, { 'blockId': nameBlock });

      if(angular.isDefined((nameBlock))){
        nameBlock = nameBlock.value;
        if(angular.isDefined((nameBlock.firstName))){
          returnStr = nameBlock.firstName + ' ' + (nameBlock.lastName || '');
        }
      }

      return returnStr || _.find(conference.registrantTypes, { 'id': r.registrantTypeId }).name;
    };

    $scope.registrantIsComplete = function(registrantId) {
      var invalidBlocks = validateRegistrant.validate(conference, _.find(currentRegistration.registrants, { 'id': registrantId }));
      return (invalidBlocks.length === 0);
    };

    $scope.anyPaymentMethodAccepted = function(){
      return conference.acceptCreditCards || conference.acceptChecks || conference.acceptTransfers || conference.acceptScholarships;
    };

    $scope.startOver = function(){
      modalMessage.confirm('Start Over', 'Are you sure you want to start over? All answers will be erased.', 'Start Over', 'Cancel', true).then(function(){
        $scope.currentRegistration.registrants = [];
        RegistrationCache.update('registrations/' + $scope.currentRegistration.id, $scope.currentRegistration);
      });
    };
  });
