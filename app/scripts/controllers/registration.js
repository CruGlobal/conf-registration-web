'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, $rootScope, $sce, $routeParams, $location, RegistrationCache, conference, currentRegistration, validateRegistrant) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'container front-form',
      bodyClass: 'frontend',
      title: conference.name,
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

    $scope.validateAndGoToNext = function (isValid) {
      if (isValid) {
        if (angular.isDefined($scope.nextPage)) {
          $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + $scope.nextPage.id);
        } else {
          $location.path('/reviewRegistration/' + conference.id);
        }
      } else {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Please fill in all required fields.')
        };
      }
      window.scrollTo(0, 0);
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
      return conference.acceptCreditCards || conference.acceptTransfers;
    };
  });