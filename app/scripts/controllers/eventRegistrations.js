'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventRegistrationsCtrl', function ($rootScope, $scope, $modal, $http, apiUrl, uuid, registrations, conference, RegViewCache, RegistrationsViewService, U, PaymentsViewService, permissions) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'registrations',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };

    $scope.conference = conference;
    $scope.blocks = [];
    $scope.reversesort = false;
    $scope.showAllViewId = 'all';
    $scope.defaultViewId = 'default';
    $scope.activeRegViewId = $scope.defaultViewId;
    $scope.savedState = '';
    $scope.showRegistrationsCompleted = true;
    $scope.columnsDropdownToggle = false;
    $scope.registrations = registrations;
    $scope.registrants = _.flatten(registrations, 'registrants');

    // collect all 'Content' blocks from the conferences' pages
    angular.forEach(conference.registrationPages, function (page) {
      angular.forEach(page.blocks, function (block) {
        if (block.type.indexOf('Content') === -1) {
          $scope.blocks.push(angular.copy(block));
        }
      });
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
        templateUrl: 'views/modals/regViewCreate.html',
        controller: 'createEventCtrl',
        resolve: {
          defaultValue: function () {
            return '';
          }
        }
      }).result.then(function (viewName) {
        if (viewName !== '') {

          var regViewNames = _.pluck($scope.registrationViewsDropdown, 'name');
          if (regViewNames.indexOf(viewName) > -1) {
            var errorModalOptions = {
              templateUrl: 'views/modals/errorModal.html',
              controller: 'genericModal',
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
        RegViewCache.update(conference.id, $scope.registrationViews);
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
        RegViewCache.update(conference.id, $scope.registrationViews);
      }).error(function () {
      });
    };

    // get all the registration views for this conference
    RegViewCache.get(conference.id, function (data) {
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
          name: '-Name & Email-',
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
        if($scope.order === 'completed'){
          return $scope.getRegistration(registration.registrationId).completedTimestamp;
        }else if($scope.order === 'type'){
          return $scope.getRegistrantType(registration.registrantTypeId).name;
        }else{
          if (angular.isDefined($scope.findAnswer(registration, $scope.order))) {
            var answerValue = $scope.findAnswer(registration, $scope.order).value;
            if(_.isObject(answerValue)){
              return _.values($scope.findAnswer(registration, $scope.order).value).join(' ');
            }else{
              return answerValue;
            }
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

    $scope.viewPayments = function (registrationId) {
      var paymentModalOptions = {
        templateUrl: 'views/modals/paymentsModal.html',
        controller: 'paymentModal',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          registration: function () {
            return _.find(registrations, { 'id': registrationId });
          },
          conference: function () {
            return conference;
          }
        }
      };

      $modal.open(paymentModalOptions).result.then(function (updatedRegistration) {
        var localUpdatedRegistrationIndex = _.findIndex($scope.registrations, { 'id': updatedRegistration.id });
        $scope.registrations[localUpdatedRegistrationIndex] = updatedRegistration;
      });
    };

    $scope.isPredefinedView = function (regViewId) {
      var predefinedViews = [ $scope.showAllViewId, $scope.defaultViewId ];
      return predefinedViews.indexOf(regViewId) > -1;
    };

    // define payment categories
    $scope.paymentCategories = [
      {
        name: 'Show All',
        matches: function () {
          return true;
        }
      },
      {
        name: 'Full/Overpaid',
        matches: function (x, y) {
          return x >= y;
        }
      },
      {
        name: 'Partial',
        matches: function (x, y) {
          return x > 0 && x < y;
        }
      },
      {
        name: 'Full/Partial',
        matches: function (x) {
          return x > 0;
        }
      },
      {
        name: 'Not Paid',
        matches: function (x) {
          if (x === null) {
            return true;
          }

          return x <= 0;
        }
      },
      {
        name: 'Overpaid',
        matches: function (x, y) {
          return x > y;
        }
      }
    ];

    // set current to first in array
    $scope.currentPaymentCategory = _.first($scope.paymentCategories).name;

    // determine if registration payment status matches current payment category
    $scope.paymentStatus = function (registrant) {
      var registration = _.find(registrations, { 'id': registrant.registrationId });
      var paymentCategory = _.find($scope.paymentCategories, { 'name': $scope.currentPaymentCategory });
      return paymentCategory.matches(registration.totalPaid, registration.calculatedTotalDue);
    };

    $scope.completeStatus = function (registrant) {
      var registration = _.find(registrations, { 'id': registrant.registrationId });
      if ($scope.showRegistrationsCompleted) {
          return registration.completed;
      } else {
        return true;
      }
    };

    $scope.paidInFull = function (registrantId) {
      var registration = _.find(registrations, { 'id': registrantId });
      return registration.totalPaid >= registration.calculatedTotalDue;
    };

    var expandedRegistrations = [];
    $scope.expandRegistration = function (r) {
      if (_.contains(expandedRegistrations, r)) {
        _.remove(expandedRegistrations, function (i) { return i === r; });
      } else {
        expandedRegistrations.push(r);
      }
    };
    $scope.isExpanded = function (r) {
      return _.contains(expandedRegistrations, r);
    };

    $scope.editRegistrant = function (r) {
      var editRegistrationDialogOptions = {
        templateUrl: 'views/modals/editRegistration.html',
        controller: 'editRegistrationModalCtrl',
        resolve: {
          registrant: function () {
            return r;
          },
          conference: function () {
            return conference;
          }
        }
      };

      $modal.open(editRegistrationDialogOptions).result.then(function (registration) {
        //update registration
        var index = _.findIndex($scope.registrations, { 'id': registration.id });
        $scope.registrations[index] = registration;

        //update registrant
        r = _.find(registration.registrants, { 'id': r.id });
        index = _.findIndex($scope.registrants, { 'id': r.id });
        $scope.registrants[index] = r;
      });
    };

    // Export conference registrations information to csv
    // showRegistrationsCompleted is now passed to this function. If checked only completed registrations will be exported.
    // If unchecked all registrations will be exported
    $scope.export = function () {
      $modal.open({
        templateUrl: 'views/modals/export.html',
        controller: 'exportDataModal',
        resolve: {
          conference: function data() {
            return $scope.conference;
          },
          hasCost: function data() {
            return $scope.eventHasCost();
          }
        }
      }).result.then(function(action) {
       var table;
       var csvContent;
       var url;
       if(action === 'exportAllData') {
         table = RegistrationsViewService.getTable(conference, registrations, $scope.showRegistrationsCompleted);
         csvContent = U.stringifyArray(table, ',');
         url = apiUrl + 'services/download/registrations/' + encodeURIComponent(conference.name) + '-registrations.csv';
         U.submitForm(url, { name: csvContent });
       } else if(action === 'exportVisibleData') {
         table = RegistrationsViewService.getTable(conference, registrations, $scope.showRegistrationsCompleted, $scope.getVisibleBlocksForExport());
         csvContent = U.stringifyArray(table, ',');
         url = apiUrl + 'services/download/registrations/' + encodeURIComponent(conference.name) + '-registrations.csv';
         U.submitForm(url, { name: csvContent });
       } else if(action === 'exportPayments') {
         $scope.exportPayments();
       }
      });
    };

    /*
     *   for the export, we should always return the values of the boxes that are checked.  this gets around
     *   the fact that pre-defined views are not automatically updated.. therefore creating a scenario where
     *   a user has altered a pre-defined view, but not clicked 'save-as'.  in this case they would have
     *   exposed or hidden some blocks, but upon export receive just the blocks in the pre-defined view.
     */
    $scope.getVisibleBlocksForExport = function () {
      return _.pluck(_.filter($scope.blocks, function (item) {
        return item.visible === true;
      }), 'id');
    };

    // Export conference registration payments information to csv
    $scope.exportPayments = function () {
      var table = PaymentsViewService.getTable(conference, registrations);
      var csvContent = U.stringifyArray(table, ',');
      var url = apiUrl + 'services/download/payments/' + conference.name + '-payments.csv';
      U.submitForm(url, { name: csvContent });
    };

    $scope.eventHasCost = function () {
      return _.max(_.flatten(conference.registrantTypes, 'cost')) > 0;
    };

    $scope.registerUser = function () {
      var registrationModalOptions = {
        templateUrl: 'views/modals/manualRegistration.html',
        controller: 'registrationModal',
        resolve: {
          conference: function () {
            return conference;
          }
        }
      };
      $modal.open(registrationModalOptions);
    };

    $scope.allowDeleteRegistration = function () {
      return permissions.permissionInt > 1;
    };

    $scope.getRegistration = function(id){
      return _.find(registrations, { 'id': id });
    };

    $scope.getRegistrantType = function(id){
      return _.find(conference.registrantTypes, { 'id': id });
    };

    $scope.deleteRegistrant = function (registrant) {
      var modalInstance = $modal.open({
        templateUrl: 'views/modals/deleteRegistration.html',
        controller: 'deleteRegistrationCtrl'
      });

      modalInstance.result.then(function (doDelete) {
        if (doDelete) {
          var registration = _.find(registrations, { 'id': registrant.registrationId });
          var url = 'registrations/' + registration.id;

          if(registration.registrants.length > 1){
            //Delete Registrant
            url = 'registrants/' + registrant.id;
          }

          $http({
            method: 'DELETE',
            url: url
          }).success(function () {
            _.remove($scope.registrants, function (r) {
              return r.id === registrant.id;
            });
          });
        }
      });
    };
  });
