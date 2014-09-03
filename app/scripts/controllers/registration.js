'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, $rootScope, $sce, $routeParams, $location, RegistrationCache, conference, currentRegistration, validateRegistrant) {
    $rootScope.globalPage = {
      type: 'registration',
      mainClass: 'front-form',
      bodyClass: 'frontend',
      title: conference.name,
      confId: conference.id,
      footer: false
    };

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
      var regType = _.find(currentRegistration.registrants, { 'id': $routeParams.reg}).registrantTypeId;
      angular.forEach($scope.conference.registrationPages, function(page) {
        var pageIndex = _.findIndex($scope.conference.registrationPages, { 'id': page.id });
        angular.forEach(page.blocks, function(block) {
          if (_.contains(block.registrantTypes, regType)) {
            _.remove($scope.conference.registrationPages[pageIndex].blocks, function(b) { return b.id === block.id; });
          }
        });

        if(page.blocks.length === 0) {
          _.remove($scope.conference.registrationPages, function(p) { return p.id === page.id; });
        }
      });
    }

    if (currentRegistration.completed) {
      $scope.currentRegistration.remainingBalance = currentRegistration.totalDue;
      currentRegistration.pastPayments.forEach(function (payment) {
        $scope.currentRegistration.remainingBalance -= payment.amount;
      });
    }

    function getPageById(pageId) {
      var pages = conference.registrationPages;

      for (var i = 0; i < pages.length; i++) {
        if (angular.equals(pageId, pages[i].id)) {
          return pages[i];
        }
      }
    }

    var pageId = $routeParams.pageId;
    $scope.activePageId = pageId || '';
    $scope.page = getPageById(pageId);
    $scope.activePageIndex = _.findIndex(conference.registrationPages, { id: pageId });

    function getPageAfterById(pageId) {
      var pages = $scope.conference.registrationPages;
      for (var i = 0; i < pages.length; i++) {
        if (angular.equals(pageId, pages[i].id)) {
          return pages[i + 1];
        }
      }
    }

    $scope.nextPage = getPageAfterById(pageId);

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
      var previousPage = conference.registrationPages[$scope.activePageIndex - 1];
      if (angular.isDefined(previousPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + previousPage.id);
      }  {
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
  });