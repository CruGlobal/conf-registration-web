'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegistrationCtrl', function ($scope, $rootScope, $sce, $routeParams, $location, conference, currentRegistration) {
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
      $scope.registrationComplete = _.filter($scope.validPages).length === conference.registrationPages.length;
    });

    $scope.conference = conference;
    $scope.currentRegistration = currentRegistration;

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
      var pages = conference.registrationPages;
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
          //go to payment
          if (conference.acceptCreditCards && _.isUndefined($rootScope.currentPayment)) {
            $location.path('/payment/' + conference.id);
          } else {
            $location.path('/reviewRegistration/' + conference.id);
          }
        }
      } else {
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('Please fill in all required fields.')
        };
        window.scrollTo(0, 0);
      }
    };

    $scope.previousPage = function () {
      var previousPage = conference.registrationPages[$scope.activePageIndex - 1];
      if (angular.isDefined(previousPage)) {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/' + previousPage.id);
      }  {
        $location.path('/' + $rootScope.registerMode + '/' + conference.id + '/page/');
      }
    };

    $scope.isConferenceCost = function () {
      return conference.conferenceCost > 0;
    };
  });