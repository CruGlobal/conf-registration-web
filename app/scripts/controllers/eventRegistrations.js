import registrationsPaidPopoverTemplate from 'views/components/registrationsPaidPopover.html';
import formStatusPopoverTemplate from 'views/components/formStatusPopover.html';
import paymentsModalTemplate from 'views/modals/paymentsModal.html';
import editRegistrationModalTemplate from 'views/modals/editRegistration.html';
import manualRegistrationModalTemplate from 'views/modals/manualRegistration.html';
import {
  findCoupleRegistrants,
  isRegistrantCouple,
} from '../utils/coupleTypeUtils';

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventRegistrationsCtrl',
    function (
      $rootScope,
      $scope,
      $uibModal,
      modalMessage,
      $http,
      $window,
      RegistrationCache,
      conference,
      permissions,
      permissionConstants,
      validateRegistrant,
    ) {
      $rootScope.globalPage = {
        type: 'admin',
        mainClass: 'event-registrations',
        bodyClass: '',
        confId: conference.id,
        footer: true,
      };

      function hasPermission() {
        if (permissions.permissionInt < permissionConstants.CHECK_IN) {
          modalMessage.error({
            title: 'Permissions Error',
            message:
              'You do not have permission to perform this action. Please contact an event administrator to request permission.',
          });
          return false;
        } else {
          return true;
        }
      }

      $scope.paidPopoverTemplateUrl = registrationsPaidPopoverTemplate;
      $scope.formStatusPopoverTemplate = formStatusPopoverTemplate;
      $scope.conference = conference;
      $scope.blocks = [];
      $scope.queryParameters = {
        block: [],
        page: 1,
        limit: 20,
        orderBy: 'last_name',
        order: 'ASC',
        filter: '',
        filterPayment: '',
        filterRegType: '',
        includeCheckedin: 'yes',
        includeWithdrawn: 'yes',
        includeIncomplete: 'yes',
        includeEFormStatus: 'yes',
        includePromotions: true,
      };
      $scope.meta = {
        totalPages: 0,
      };
      $scope.reversesort = false;
      $scope.visibleFilterRegistrantTypes = _.sortBy(
        angular.copy(conference.registrantTypes).concat({
          id: '',
          name: '-Any-',
        }),
        'name',
      );
      var expandedRegistrations = {};

      // Couple type utility functions
      $scope.findCoupleRegistrants = findCoupleRegistrants;
      $scope.isRegistrantCouple = isRegistrantCouple;

      $scope.$watch(
        'queryParameters',
        function (q, oldQ) {
          //reset page
          if (q.page > 1 && q.page === oldQ.page) {
            $scope.queryParameters.page = 1;
            return;
          }

          if (q.page !== oldQ.page) {
            //scroll to top on page change
            $window.scrollTo(0, 0);
          }

          $scope.refreshRegistrations();
        },
        true,
      );

      //collect all blocks from the conferences' pages
      angular.forEach(conference.registrationPages, function (page) {
        angular.forEach(page.blocks, function (block) {
          if (block.type !== 'paragraphContent') {
            $scope.blocks.push(angular.copy(block));
          }
        });
      });

      //turn on visible blocks
      var visibleBlocks = $window.localStorage.getItem(
        'visibleBlocks:' + conference.id,
      );
      if (!_.isNull(visibleBlocks)) {
        visibleBlocks = JSON.parse(visibleBlocks);
        $scope.queryParameters.block = visibleBlocks;
        angular.forEach(visibleBlocks, function (blockId) {
          var block = _.find($scope.blocks, { id: blockId });
          if (angular.isDefined(block)) {
            block.visible = true;
          }
        });
      }

      //toggle (show/hide) columns
      $scope.toggleColumn = function (block) {
        $scope.blocks[block].visible = !$scope.blocks[block].visible;
        visibleBlocks = _.map(_.filter($scope.blocks, { visible: true }), 'id');
        $window.localStorage.setItem(
          'visibleBlocks:' + conference.id,
          JSON.stringify(visibleBlocks),
        );
        $scope.queryParameters.block = visibleBlocks;
      };

      //turn on visible built in columns
      var builtInColumnsVisibleInStorage = $window.localStorage.getItem(
        'builtInColumnsVisibleStorage',
      );
      if (
        typeof builtInColumnsVisibleInStorage === 'undefined' ||
        builtInColumnsVisibleInStorage === null
      ) {
        //Initally display (true) or not display (false) built in columns
        $scope.builtInColumnsVisible = {
          Email: true,
          Group: true,
          GroupId: false,
          Started: true,
          Completed: true,
        };
      } else {
        $scope.builtInColumnsVisible = JSON.parse(
          builtInColumnsVisibleInStorage,
        );
      }

      //toggle (show/hide) built in columns
      $scope.toggleBuiltInColumn = function (columnName) {
        $scope.builtInColumnsVisible[columnName] =
          !$scope.builtInColumnsVisible[columnName];
        $window.localStorage.setItem(
          'builtInColumnsVisibleStorage',
          JSON.stringify($scope.builtInColumnsVisible),
        );
      };

      var throttleFilter = _.debounce(function () {
        $scope.$apply(function () {
          $scope.queryParameters.filter = $scope.strFilter;
        });
      }, 500);
      $scope.$watch('strFilter', function (strFilter) {
        if (angular.isDefined(strFilter)) {
          throttleFilter();
        }
      });
      $scope.resetStrFilter = function () {
        $scope.strFilter = '';
      };

      $scope.refreshRegistrations = function () {
        RegistrationCache.getAllForConference(
          conference.id,
          $scope.queryParameters,
        ).then(
          function (data) {
            $scope.meta = data.meta;
            $scope.registrations = data.registrations;
            $scope.registrants = _.flatten(
              _.map(data.registrations, 'registrants'),
            );
            expandedRegistrations = {};
          },
          function () {
            $scope.registrations = [];
            $scope.registrants = [];
          },
        );
      };

      $scope.isRegistrantReported = function (registrant) {
        const registration = $scope.registrations.find(
          (r) => r.id === registrant.registrationId,
        );
        return registration && registration.reported;
      };

      $scope.blockIsVisible = function (block, registrant) {
        return validateRegistrant.blockVisible(
          block,
          registrant,
          true,
          $scope.conference,
        );
      };

      var findAnswer = function (registration, blockId) {
        return _.find(registration.answers, function (answer) {
          return angular.equals(answer.blockId, blockId);
        });
      };

      $scope.answerSort = function (registrant) {
        var orderBy = $scope.queryParameters.orderBy;
        if (angular.isUndefined(orderBy)) {
          return 0;
        }

        var answerValue = findAnswer(registrant, orderBy);
        if (angular.isUndefined(answerValue)) {
          return '';
        }

        answerValue = answerValue.value;
        if (_.isObject(answerValue)) {
          var blockType = _.find($scope.blocks, { id: orderBy }).type;
          if (blockType === 'checkboxQuestion') {
            return _.keys(
              _.pickBy(answerValue, function (val) {
                return val;
              }),
            ).join();
          } else {
            return _.values(answerValue).join();
          }
        } else {
          return answerValue;
        }
      };

      $scope.setOrder = function (order) {
        if (order === $scope.queryParameters.orderBy) {
          $scope.reversesort = !$scope.reversesort;
        } else {
          $scope.reversesort = false;
        }
        $scope.queryParameters.orderBy = order;
        $scope.queryParameters.order = $scope.reversesort ? 'DESC' : 'ASC';
      };

      $scope.viewPayments = function (registrationId) {
        $http
          .get('registrations/' + registrationId)
          .then(function (response) {
            var paymentModalOptions = {
              templateUrl: paymentsModalTemplate,
              controller: 'paymentModal',
              size: 'lg',
              backdrop: 'static',
              resolve: {
                registration: function () {
                  return response.data;
                },
                promotionRegistrationInfoList: function () {
                  return $scope.meta.promotionRegistrationInfoList;
                },
                conference: function () {
                  return conference;
                },
                permissions: function () {
                  return permissions;
                },
              },
            };

            $uibModal
              .open(paymentModalOptions)
              .result.then(function (updatedRegistration) {
                var localUpdatedRegistrationIndex = _.findIndex(
                  $scope.registrations,
                  { id: updatedRegistration.id },
                );
                $scope.registrations[localUpdatedRegistrationIndex] =
                  updatedRegistration;
              });
          })
          .catch(function () {
            modalMessage.error(
              'Error: registration data could not be retrieved.',
            );
          });
      };

      $scope.viewFormStatus = (registrant) => {
        const formStatusModalOptions = {
          component: 'formStatusModal',
          size: 'md',
          backdrop: 'static',
          resolve: {
            registrant: () => registrant,
            registrantTypeName: () =>
              $scope.getRegistrantType(registrant.registrantTypeId).name,
          },
        };

        $uibModal
          .open(formStatusModalOptions)
          .result.then((updatedRegistrant) => {
            const index = _.findIndex($scope.registrants, {
              id: updatedRegistrant.id,
            });
            $scope.registrants[index] = updatedRegistrant;
          });
      };

      $scope.remainingBalance = function (registrationId) {
        var registration = _.find($scope.registrations, { id: registrationId });
        return registration.remainingBalance;
      };

      $scope.expandRegistration = function (r) {
        if (expandedRegistrations[r] === 'open') {
          delete expandedRegistrations[r];
        } else {
          expandedRegistrations[r] = 'loading';

          $http
            .get('registrants/' + r)
            .then(function (response) {
              var registrantData = response.data;
              expandedRegistrations[r] = 'open';

              //update registrant
              var index = _.findIndex($scope.registrants, {
                id: registrantData.id,
              });
              $scope.registrants[index] = registrantData;

              //update registration
              index = _.findIndex($scope.registrations, {
                id: registrantData.registrationId,
              });
              var registrantIndex = _.findIndex(
                $scope.registrations[index].registrants,
                { id: registrantData.id },
              );
              $scope.registrations[index].registrants[registrantIndex] =
                registrantData;
            })
            .catch(function () {
              modalMessage.error(
                'Error: registrant data could not be retrieved.',
              );
              delete expandedRegistrations[r];
            });
        }
      };

      $scope.expandedStatus = function (r) {
        return expandedRegistrations[r];
      };

      $scope.editRegistrant = function (r) {
        if (!hasPermission()) {
          return;
        }

        $http
          .get('registrations/' + r.registrationId)
          .then(function (response) {
            var editRegistrationDialogOptions = {
              templateUrl: editRegistrationModalTemplate,
              controller: 'editRegistrationModalCtrl',
              resolve: {
                registrantId: function () {
                  return r.id;
                },
                registration: function () {
                  return response.data;
                },
                conference: function () {
                  return conference;
                },
              },
            };

            $uibModal
              .open(editRegistrationDialogOptions)
              .result.then(function (registration) {
                //update registration
                var index = _.findIndex($scope.registrations, {
                  id: registration.id,
                });
                $scope.registrations[index] = registration;

                //update registrant
                r = _.find(registration.registrants, { id: r.id });
                index = _.findIndex($scope.registrants, { id: r.id });
                $scope.registrants[index] = r;
              });
          })
          .catch(function () {
            modalMessage.error(
              'Error: registrant data could not be retrieved.',
            );
            delete expandedRegistrations[r];
          });
      };

      $scope.showGroup = function (id) {
        if (!hasPermission()) {
          return;
        }

        $uibModal.open({
          component: 'showGroupModal',
          resolve: {
            groupName: function () {
              return $scope.getGroupName(id);
            },
            registrationId: function () {
              return id;
            },
            conference: function () {
              return $scope.conference;
            },
            getRegistration: function () {
              return $scope.getRegistration;
            },
            getRegistrantType: function () {
              return $scope.getRegistrantType;
            },
            editRegistrant: function () {
              return $scope.editRegistrant;
            },
            deleteRegistrant: function () {
              return $scope.deleteRegistrant;
            },
            registerUser: function () {
              return $scope.registerUser;
            },
          },
        });
      };

      // Export conference registrations information to csv
      $scope.export = () => {
        $uibModal.open({
          component: 'exportModal',
          resolve: {
            queryParameters: () => $scope.queryParameters,
            conference: () => $scope.conference,
          },
        });
      };

      $scope.registerUser = function (
        primaryRegistration,
        typeId,
        openedFromGroupModal,
      ) {
        if (!hasPermission()) {
          return;
        }

        $uibModal.open({
          templateUrl: manualRegistrationModalTemplate,
          controller: 'registrationModal',
          resolve: {
            conference: function () {
              return conference;
            },
            primaryRegistration: function () {
              return primaryRegistration;
            },
            typeId: function () {
              return typeId;
            },
            openedFromGroupModal: function () {
              return openedFromGroupModal || false;
            },
          },
        });
      };

      $scope.getRegistration = function (id) {
        return _.find($scope.registrations, { id: id });
      };

      $scope.getGroupName = function (id) {
        var registration = $scope.getRegistration(id);

        if (registration.primaryRegistrantId === null) return null;

        var registrant = _.find(registration.groupRegistrants, {
          id: registration.primaryRegistrantId,
        });
        if (angular.isUndefined(registrant)) return null;

        return `${registrant.firstName} ${registrant.lastName}`;
      };

      $scope.isGroupRegistrant = (registrant) =>
        $scope.getRegistrantType(registrant.registrantTypeId)
          .groupSubRegistrantType ||
        $scope.getRegistrantType(registrant.registrantTypeId)
          .allowGroupRegistrations;

      $scope.getRegistrantType = function (id) {
        return _.find(conference.registrantTypes, { id: id });
      };

      $scope.showModal = function (title, question, yesMessage, noMessage) {
        return modalMessage.confirm({
          title: title,
          question: question,
          yesString: yesMessage,
          noString: noMessage || 'Cancel',
          normalSize: true,
        });
      };

      $scope.buildCoupleWithdrawMessage = function (value) {
        const title = value
          ? 'Withdraw Couple/Spouse'
          : 'Reinstate Couple/Spouse';
        const yesString = value ? 'Withdraw Both' : 'Reinstate Both';
        const warningMessage =
          (value ? 'Withdrawing' : 'Reinstating') +
          ' this registrant will also ' +
          (value ? 'withdraw' : 'reinstate') +
          ' their spouse.<br><br>';
        return { title, yesString, warningMessage };
      };

      $scope.withdrawRegistrant = function (registrant, value) {
        if (!hasPermission()) {
          return;
        }
        const isCouple = $scope.isRegistrantCouple(
          registrant,
          $scope.getRegistration(registrant.registrationId),
        );

        function handleWithdraw() {
          $rootScope.loadingMsg =
            (value ? 'Withdrawing ' : 'Reinstating ') + registrant.firstName;

          let registrantsToWithdraw = [registrant];
          if (isCouple) {
            registrantsToWithdraw = $scope.findCoupleRegistrants(
              registrant,
              $scope.getRegistration(registrant.registrationId),
            );
          }
          registrantsToWithdraw.forEach(function (registrantToWithdraw) {
            registrantToWithdraw.withdrawn = value;
            if (value) {
              //used to update front view only, backend generates its own timestamp
              registrantToWithdraw.withdrawnTimestamp = new Date();
            }

            $http
              .put(
                'registrants/' + registrantToWithdraw.id,
                registrantToWithdraw,
              )
              .catch(function (err) {
                // Revert change if error occurs
                registrantToWithdraw.withdrawn = !value;
                modalMessage.error({
                  message:
                    err.data && err.data.error
                      ? err.data.error.message
                      : 'An error occurred while withdrawing this registrant.',
                });
              })
              .finally(function () {
                $scope.refreshRegistrations();
                $rootScope.loadingMsg = '';
              });
          });
        }

        if (isCouple) {
          const { title, yesString, warningMessage } =
            $scope.buildCoupleWithdrawMessage(value);
          $scope
            .showModal(title, warningMessage, yesString)
            .then(handleWithdraw);
        } else {
          handleWithdraw();
        }
      };

      $scope.checkInRegistrant = function (registrant, value) {
        if (!hasPermission()) {
          return;
        }

        var originalValue = angular.copy(registrant.checkedInTimestamp);
        registrant.checkedInTimestamp = value ? new Date().toJSON() : null;

        $rootScope.loadingMsg =
          (value ? 'Checking in ' : 'Removing check-in for ') +
          registrant.firstName;
        $http
          .put('registrants/' + registrant.id, registrant)
          .catch(function (response) {
            registrant.checkedInTimestamp = originalValue;
            modalMessage.error(
              response.data && response.data.error
                ? response.data.error.message
                : 'An error occurred while checking in this registrant.',
            );
          })
          .finally(function () {
            $rootScope.loadingMsg = '';
          });
      };

      // Helper function to build warning message
      $scope.buildDeletionWarningMessage = function (isCouple) {
        let title = 'Delete Registrant';
        let yesString = 'Delete';
        let warningMessage = 'Are you sure you want to delete this registrant?';
        if (isCouple) {
          title = 'Delete Couple/Spouse Registrants';
          yesString = 'Delete Both';
          warningMessage =
            'Deleting this registrant will also delete their spouse and any associated registrations.<br><br>' +
            warningMessage;
        }
        return { title, yesString, warningMessage };
      };

      $scope.updateAfterDelete = function (registrantsToDelete) {
        registrantsToDelete.forEach(function (registrantToDelete) {
          _.remove($scope.registrants, function (registrant) {
            return registrant.id === registrantToDelete.id;
          });

          const reg = $scope.getRegistration(registrantToDelete.registrationId);
          if (angular.isDefined(reg)) {
            _.remove(reg.registrants, function (registrant) {
              return registrant.id === registrantToDelete.id;
            });
            _.remove(reg.groupRegistrants, function (registrant) {
              return registrant.id === registrantToDelete.id;
            });
          }
        });
        if (registrantsToDelete.length > 1) {
          const deletedCount = registrantsToDelete.length;
          modalMessage.info({
            message: `Successfully deleted ${deletedCount} related registrant(s).`,
          });
        }
      };

      $scope.deleteRegistrant = function (registrant) {
        if (!hasPermission()) {
          return;
        }
        const isCouple = $scope.isRegistrantCouple(
          registrant,
          $scope.getRegistration(registrant.registrationId),
        );
        const { title, yesString, warningMessage } =
          $scope.buildDeletionWarningMessage(isCouple);

        $scope
          .showModal(title, warningMessage, yesString)
          .then(function () {
            return $http.get('registrations/' + registrant.registrationId);
          })
          .then(function (response) {
            const registration = response.data;

            let registrantsToDelete = [registrant];
            if (isCouple) {
              registrantsToDelete = $scope.findCoupleRegistrants(
                registrant,
                registration,
              );
            }

            let url;

            if (registration.registrants.length > 1 && !isCouple) {
              url = 'registrants/' + registrant.id;
            } else {
              url = 'registrations/' + registration.id;
            }
            $http.delete(url).then(function () {
              $scope.refreshRegistrations();
              $scope.updateAfterDelete(registrantsToDelete);
            });
          });
      };
    },
  );
