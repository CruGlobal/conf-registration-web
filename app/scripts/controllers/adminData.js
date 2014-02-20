'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDataCtrl', function ($scope, registrations, conference, $modal, permissions, $http, uuid) {

    $scope.conference = conference;
    $scope.blocks = [];
    $scope.reversesort = false;
    $scope.showAllViewId = 'all';
    $scope.defaultViewId = 'default';
    $scope.activeRegViewId = $scope.defaultViewId;
    $scope.savedState = '';

    // collect completed registrations
    registrations = _.filter(registrations, function (item) { return item.completed !== false; });

    // collect all 'Content' blocks from the conferences' pages
    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          block.visible = true;
          $scope.blocks.push(block);
        }
      });
    });

    // get all the registration views for this conference
    $http({method: 'GET',
      url: 'conferences/' + conference.id + '/registration-views'
    }).success(function (data) {
      $scope.registrationViews = _.sortBy(data, 'name');

      var profileBlocks = function (blocks) {
        return _.filter(blocks, function (block) {
          var profileTypes = [ 'EMAIL', 'NAME' ];
          return profileTypes.indexOf(block.profileType) > -1;
        });
      };

      $scope.registrationViewsDropdown = [
        {
          id: $scope.defaultViewId,
          name: '-Default-',
          visibleBlockIds: _.pluck(profileBlocks($scope.blocks), 'id')
        },
        {
          id: $scope.showAllViewId,
          name: '-Show All-',
          visibleBlockIds: _.pluck($scope.blocks, 'id')
        }
      ];

      $scope.registrationViewsDropdown = $scope.registrationViewsDropdown.concat($scope.registrationViews);
      $scope.setRegView();
    });

    // toggle (show/hide) the column and auto save the registration view
    $scope.toggleColumn = function (block) {
      $scope.blocks[block].visible = !$scope.blocks[block].visible;
      $scope.updateRegView();
    };

    // set the registration view as per the active registration view id
    $scope.setRegView = function () {
      $scope.savedState = '';
      if ($scope.activeRegViewId === '') {

      } else {
        var visibleBlocks = _.find($scope.registrationViewsDropdown, { 'id': $scope.activeRegViewId }).visibleBlockIds;
        angular.forEach($scope.blocks, function (block) {
          if (visibleBlocks.indexOf(block.id) !== -1) {
            block.visible = true;
          } else if (block.type.indexOf('Content') === -1) {
            block.visible = false;
          }
        });
      }
    };

    // create a registration view
    $scope.createRegView = function () {
      $modal.open({
        templateUrl: 'views/regViewCreate.html',
        controller: 'CreateDialogCtrl',
        resolve: {
          defaultValue: function () {
            return '';
          }
        }
      }).result.then(function (viewName) {
          if (viewName !== '') {

            var regViewNames = _.pluck($scope.registrationViewsDropdown, 'name');
            if (regViewNames.indexOf(viewName) > -1)
            {
              var errorModalOptions = {
                templateUrl: 'views/errorModal.html',
                controller: 'errorModal',
                resolve: {
                  message: function () {
                    return 'View name "' + viewName + '" already exists. Please provide a different view name.';
                  }
                }
              };

              $modal.open(errorModalOptions);

              return;
            }

            var newView = {
              id: uuid(),
              conferenceId: conference.id,
              name: viewName,
              visibleBlockIds: _.pluck(_.filter($scope.blocks, function (item) {
                return item.visible === true;
              }), 'id')
            };

            $http({method: 'POST',
              url: 'conferences/' + conference.id + '/registration-views',
              data: newView
            }).success(function () {
              $scope.registrationViews = $scope.registrationViews.concat(newView);
              $scope.registrationViewsDropdown = $scope.registrationViewsDropdown.concat(newView);
              $scope.activeRegViewId = newView.id;
            }).error(function () {
            });
          }
        });
    };

    // update a registration view
    $scope.updateRegView = function () {

      // don't update predefined view
      if ($scope.isPredefinedView($scope.activeRegViewId))
      {
        return;
      }

      var thisView = {
        id: $scope.activeRegViewId,
        conferenceId: conference.id,
        name: _.find($scope.registrationViewsDropdown, { 'id': $scope.activeRegViewId }).name,
        visibleBlockIds: _.pluck(_.filter($scope.blocks, function (item) {
          return item.visible === true;
        }), 'id')
      };

      $scope.savedState = 'Saving...';
      $http({method: 'PUT',
        url: 'registration-views/' + $scope.activeRegViewId,
        data: thisView
      }).success(function () {
        $scope.registrationViews = _.remove($scope.registrationViews, function (view) { return view.id !== $scope.activeRegViewId; });
        $scope.registrationViewsDropdown = _.remove($scope.registrationViewsDropdown, function (view) {
          return view.id !== $scope.activeRegViewId;
        });
        $scope.registrationViews = $scope.registrationViews.concat(thisView);
        $scope.registrationViewsDropdown = $scope.registrationViewsDropdown.concat(thisView);
        $scope.activeRegViewId = thisView.id;
        $scope.savedState = 'Saved';
      }).error(function () {
      });
    };

    // delete a registration view
    $scope.delRegView = function () {

      // don't delete predefined views
      if ($scope.isPredefinedView($scope.activeRegViewId))
      {
        return;
      }

      $http({method: 'DELETE',
        url: 'registration-views/' + $scope.activeRegViewId
      }).success(function () {
        $scope.registrationViews = _.remove($scope.registrationViews, function (view) { return view.id !== $scope.activeRegViewId; });
        $scope.registrationViewsDropdown = _.remove($scope.registrationViewsDropdown, function (view) {
          return view.id !== $scope.activeRegViewId;
        });

        $scope.activeRegViewId = $scope.defaultViewId;
        $scope.setRegView();

      }).error(function () {
      });
    };

    $scope.findAnswer = function (registration, blockId) {
      return _.find(registration.answers, function (answer) {
        return angular.equals(answer.blockId, blockId);
      });
    };

    $scope.getSelectedCheckboxes = function (choices) {
      return _.keys(_.pick(choices, function (val) {
        return val === true;
      }));
    };

    $scope.answerSort = function (registration) {
      if (angular.isDefined($scope.order)) {
        if (angular.isDefined($scope.findAnswer(registration, $scope.order))) {
          if ($scope.findAnswer(registration, $scope.order).value.text) { //text field
            return $scope.findAnswer(registration, $scope.order).value.text;
          } else if ($scope.getSelectedCheckboxes($scope.findAnswer(registration, $scope.order).value).length > 0) {
            //mc
            return $scope.getSelectedCheckboxes($scope.findAnswer(registration, $scope.order).value).join(' ');
          } else if (typeof $scope.findAnswer(registration, $scope.order).value === 'object') { //name
            return _.values($scope.findAnswer(registration, $scope.order).value).join(' ');
          } else { //radio
            return $scope.findAnswer(registration, $scope.order).value;
          }
        }
      } else {
        return 0;
      }
    };

    $scope.setOrder = function (order) {
      if (order === $scope.order) {
        $scope.reversesort = !$scope.reversesort;
      } else {
        $scope.reversesort = false;
      }
      $scope.order = order;
    };

    $scope.registrations = registrations;
    $scope.permissions = permissions;

    $scope.viewPayments = function (registrationId) {
      var registrationPayments = _.filter(registrations, function (item) { return item.id === registrationId; });
      registrationPayments = registrationPayments[0].pastPayments;

      var paymentModalOptions = {
        templateUrl: 'views/paymentsModal.html',
        controller: 'errorModal',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          message: function () {
            return registrationPayments;
          }
        }
      };
      $modal.open(paymentModalOptions).result.then(function () {
      });
    };

    $scope.isPredefinedView = function (regViewId) {
      var predefinedViews = [ $scope.showAllViewId, $scope.defaultViewId ];
      return predefinedViews.indexOf(regViewId) > -1;
    };

    $scope.isConferenceCost = function () {
      return conference.conferenceCost > 0;
    };

  });