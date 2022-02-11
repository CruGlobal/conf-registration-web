angular
  .module('confRegistrationWebApp')
  .controller(
    'RegistrationCtrl',
    function (
      $scope,
      $rootScope,
      $routeParams,
      $route,
      $location,
      $window,
      $http,
      $q,
      $interval,
      RegistrationCache,
      conference,
      currentRegistration,
      validateRegistrant,
      modalMessage,
    ) {
      if (angular.isDefined($rootScope.currentRegistrationErrorMessage)) {
        modalMessage.error($rootScope.currentRegistrationErrorMessage);
      }

      $rootScope.globalPage = {
        type: 'registration',
        mainClass: 'container front-form',
        bodyClass: 'user-registration',
        conference: conference,
        confId: conference.id,
        footer: false,
      };

      var pageId = $routeParams.pageId;
      $scope.conference = angular.copy(conference);
      var originalCurrentRegistration = angular.copy(currentRegistration);
      $scope.currentRegistration = currentRegistration;
      $scope.currentRegistrant = $routeParams.reg;
      $scope.savingAnswers = false;

      $scope.activePageId = pageId || '';
      // Filter through all pages and remove any empty pages
      // Check for registrant needed since on the welcome page
      // user could possibly not have started registration yet
      $scope.validPages =
        $scope.currentRegistration.registrants.length >= 1
          ? $scope.conference.registrationPages.filter((page) => {
              const registrantId = $scope.currentRegistrant
                ? $scope.currentRegistrant
                : $scope.currentRegistration.registrants[0].id;

              return (
                page.blocks.filter((block) =>
                  validateRegistrant.blockVisible(
                    block,
                    currentRegistration.registrants.find(
                      (r) => r.id === registrantId,
                    ),
                  ),
                ).length > 0
              );
            })
          : $scope.conference.registrationPages;

      $scope.checkValidPages = () => {
        $scope.validPages = $scope.conference.registrationPages.filter(
          (page) => {
            const registrantId = $scope.currentRegistrant
              ? $scope.currentRegistrant
              : $scope.currentRegistration.registrants[0].id;

            return (
              page.blocks.filter((block) =>
                validateRegistrant.blockVisible(
                  block,
                  currentRegistration.registrants.find(
                    (r) => r.id === registrantId,
                  ),
                ),
              ).length > 0
            );
          },
        );
      };

      $scope.page = _.find($scope.validPages, { id: pageId });
      $scope.activePageIndex = _.findIndex($scope.validPages, {
        id: pageId,
      });
      $scope.nextPage = function () {
        $scope.checkValidPages();
        var visiblePageArray = _.filter($scope.validPages, function (page) {
          return $scope.pageIsVisible(page);
        });
        return visiblePageArray[
          _.findIndex(visiblePageArray, { id: pageId }) + 1
        ];
      };

      $scope.getValidFirstPage = (registrantId) =>
        $scope.conference.registrationPages.filter(
          (page) =>
            page.blocks.filter((block) =>
              validateRegistrant.blockVisible(
                block,
                currentRegistration.registrants.find(
                  (r) => r.id === registrantId,
                ),
              ),
            ).length > 0,
        )[0];

      // If a page is refreshed in preview mode redirect to the registration welcome page.
      // A registrant data in preview mode is not stored in the backend, so after refreshing
      // the form breaks because there is no registrant created.
      if (
        $scope.registerMode === 'preview' &&
        $scope.activePageId !== '' &&
        !_.find(currentRegistration.registrants, { id: $routeParams.reg })
      ) {
        $scope.activePageId = '';
      }

      //if current page doesn't exist, go to first page
      if ($scope.activePageIndex === -1 && angular.isDefined($scope.page)) {
        $location.path(
          '/' +
            $rootScope.registerMode +
            '/' +
            conference.id +
            '/page/' +
            $scope.validPages[0].id,
        );
      }

      //If page contains no questions
      if (angular.isDefined($scope.page) && $scope.page.blocks.length === 0) {
        // If not last page, then advanced to next page
        if ($scope.page.position < $scope.validPages.length - 1) {
          $location.path(
            '/' +
              $rootScope.registerMode +
              '/' +
              conference.id +
              '/page/' +
              $scope.validPages[$scope.page.position + 1].id,
          );
        }
        // If last page, then advanced to registration page
        else {
          $scope.reviewRegistration();
        }
      }

      //setup visited flags array to store visits by a specific registrant to a specific page
      if (!$rootScope.visitedPages) {
        $rootScope.visitedPages = [];
      }
      //bool for the show-errors directive that tells it whether the current page has been visited by the current registrant
      var pageAndRegistrantId =
        $scope.currentRegistrant + '_' + $scope.activePageIndex;
      $scope.currentPageVisited = _.includes(
        $rootScope.visitedPages,
        pageAndRegistrantId,
      );
      $scope.visitedPage = function (pageId) {
        return _.includes(
          $rootScope.visitedPages,
          $scope.currentRegistrant +
            '_' +
            _.findIndex($scope.validPages, { id: pageId }),
        );
      };

      //auto save answers every 15 seconds
      var saveAnswersInterval = $interval(function () {
        if (angular.isUndefined($scope.currentRegistrant)) {
          return;
        }

        $scope.savingAnswers = true;
        $q.all(findAnswersToSave()).then(function () {
          $scope.savingAnswers = false;
        });
      }, 15000);

      //save answers on route change
      $scope.$on('$routeChangeStart', function () {
        $interval.cancel(saveAnswersInterval);
        if (angular.isUndefined($scope.currentRegistrant)) {
          return;
        }

        $scope.savingAnswers = true;
        $q.all(findAnswersToSave());

        //add current page and registrant combo to the visitedPages array
        if ($scope.currentRegistrant) {
          $rootScope.visitedPages.push(pageAndRegistrantId);
        }
      });

      $scope.goToNext = function () {
        var nextPage = $scope.nextPage();
        if (angular.isDefined(nextPage)) {
          $location.path(
            '/' +
              $rootScope.registerMode +
              '/' +
              conference.id +
              '/page/' +
              nextPage.id,
          );
        } else {
          $scope.reviewRegistration();
        }
      };

      $scope.previousPage = function () {
        var visiblePageArray = _.filter($scope.validPages, function (page) {
          return $scope.pageIsVisible(page);
        });

        var previousPage =
          visiblePageArray[_.findIndex(visiblePageArray, { id: pageId }) - 1];
        if (angular.isDefined(previousPage)) {
          $location.path(
            '/' +
              $rootScope.registerMode +
              '/' +
              conference.id +
              '/page/' +
              previousPage.id,
          );
        } else if ($scope.currentRegistration.completed) {
          $location.path('/reviewRegistration/' + conference.id);
        } else {
          $location
            .path(
              '/' + $rootScope.registerMode + '/' + conference.id + '/page/',
            )
            .search('reg', null);
        }
      };

      $scope.reviewRegistration = function () {
        if (angular.isUndefined($scope.currentRegistrant)) {
          $location
            .path('/reviewRegistration/' + conference.id)
            .search('regType', null)
            .search('reg', null);
          return;
        }

        $scope.savingAnswers = true;
        $q.all(findAnswersToSave()).then(function () {
          $location
            .path('/reviewRegistration/' + conference.id)
            .search('regType', null)
            .search('reg', null);
        });
      };

      $scope.registrantName = function (r) {
        var nameBlock = _.find(_.flatten(_.map($scope.validPages, 'blocks')), {
          profileType: 'NAME',
        }).id;
        var registrant = _.find($scope.currentRegistration.registrants, {
          id: r.id,
        });
        var returnStr = '';
        nameBlock = _.find(registrant.answers, { blockId: nameBlock });

        if (angular.isDefined(nameBlock)) {
          nameBlock = nameBlock.value;
          if (angular.isDefined(nameBlock.firstName)) {
            returnStr = nameBlock.firstName + ' ' + (nameBlock.lastName || '');
          }
        }

        return returnStr.trim().length
          ? returnStr
          : _.find(conference.registrantTypes, { id: r.registrantTypeId }).name;
      };

      $scope.registrantIsComplete = function (registrantId) {
        var invalidBlocks = validateRegistrant.validate(
          conference,
          _.find(currentRegistration.registrants, { id: registrantId }),
        );
        return !invalidBlocks.length;
      };

      $scope.pageIsValid = function (pageId) {
        var invalidBlocks = validateRegistrant.validate(
          conference,
          _.find(currentRegistration.registrants, {
            id: $scope.currentRegistrant,
          }),
          pageId,
        );
        return !invalidBlocks.length;
      };

      $scope.startOver = function () {
        modalMessage
          .confirm({
            title: 'Start Over',
            question:
              'Are you sure you want to start over? All answers will be erased.',
            yesString: 'Start Over',
            noString: 'Cancel',
            normalSize: true,
          })
          .then(function () {
            var registrantDeleteRequests = [];
            angular.forEach(
              $scope.currentRegistration.registrants,
              function (r) {
                registrantDeleteRequests.push(
                  $http({
                    method: 'DELETE',
                    url: 'registrants/' + r.id,
                  }),
                );
              },
            );
            $q.all(registrantDeleteRequests).then(function () {
              RegistrationCache.emptyCache();
              $route.reload();
            });
          });
      };

      $scope.pageIsVisible = function (page) {
        if (angular.isUndefined($scope.currentRegistrant)) {
          return false;
        }

        return _.includes(
          _.map(page.blocks, function (block) {
            return validateRegistrant.blockVisible(
              block,
              _.find($scope.currentRegistration.registrants, {
                id: $scope.currentRegistrant,
              }),
            );
          }),
          true,
        );
      };

      function findAnswersToSave() {
        var currentRegistrantOriginal = _.find(
          originalCurrentRegistration.registrants,
          { id: $scope.currentRegistrant },
        );
        var currentRegistrantOriginalAnswers = currentRegistrantOriginal
          ? currentRegistrantOriginal.answers
          : [];
        var currentRegistrant = _.find($scope.currentRegistration.registrants, {
          id: $scope.currentRegistrant,
        });
        var answersToSave = [];

        angular.forEach(
          currentRegistrant ? currentRegistrant.answers : [],
          function (a) {
            var savedAnswer = _.find(currentRegistrantOriginalAnswers, {
              id: a.id,
            });
            if (
              angular.isUndefined(savedAnswer) ||
              !angular.equals(savedAnswer.value, a.value)
            ) {
              if ($scope.registerMode !== 'preview') {
                answersToSave.push($http.put('answers/' + a.id, a));
              }
            }
          },
        );

        //update originalCurrentRegistration
        originalCurrentRegistration = angular.copy($scope.currentRegistration);

        return answersToSave;
      }
    },
  );
