import { Rollbar } from 'scripts/errorNotify.js';

angular
  .module('confRegistrationWebApp')
  .controller(
    'eventFormCtrl',
    function (
      $rootScope,
      $scope,
      modalMessage,
      $location,
      $anchorScroll,
      $sce,
      $sanitize,
      $http,
      $timeout,
      conference,
      GrowlService,
      ConfCache,
      uuid,
      blockTagTypeService,
    ) {
      $rootScope.globalPage = {
        type: 'admin',
        mainClass: 'event-questions',
        bodyClass: '',
        confId: conference.id,
        footer: true,
      };

      $scope.conference = conference;
      $scope.$watch(
        'conference',
        function (newObject, oldObject) {
          if (
            angular.isDefined(newObject) &&
            angular.isDefined(oldObject) &&
            !_.isEqual(newObject, oldObject)
          ) {
            scheduleSave();
          }
        },
        true,
      );
      $scope.blockTagTypes = blockTagTypeService.blockTagTypes() || [];

      // angular-ui-tree applies a drag as a remove in one $timeout and an
      // insert in a second $timeout, with a full digest in between. Saving
      // synchronously on the watch sent that in-between state (the dragged
      // block on no page) to the API, which deleted the block's answers.
      // Debouncing the save makes sure only the final state is sent.
      var SAVE_DEBOUNCE_MS = 500;
      var formSaving = false;
      var savePending = false;
      var formSavingTimeout;
      var formSavingNotifyTimeout;

      // Guard: never send a payload that silently drops a question. A block
      // missing from the PUT is treated by the API as a delete, and its
      // answers are gone for good. Only deleteBlock and deletePage may remove
      // blocks; they mark the ids as intentional.
      var lastSavedBlockIds = blockIds(conference);
      var intentionallyRemovedBlockIds = [];

      function blockIds(conf) {
        return _.map(_.flatMap(conf.registrationPages, 'blocks'), 'id');
      }

      function scheduleSave() {
        $timeout.cancel(formSavingTimeout);
        savePending = true;
        formSavingTimeout = $timeout(saveForm, SAVE_DEBOUNCE_MS);
      }

      // Send a debounced save right away so in-app navigation does not
      // leave the last edit sitting in memory. If a PUT is in flight,
      // saveForm re-schedules itself; $timeout is not scope-bound, so the
      // queued save still runs after this scope is gone.
      function flushPendingSave() {
        if (savePending) {
          $timeout.cancel(formSavingTimeout);
          saveForm();
        }
      }

      function saveForm() {
        $timeout.cancel(formSavingTimeout);
        savePending = false;
        if (formSaving) {
          // A PUT is in flight; try again once it settles
          scheduleSave();
          return;
        }

        let conferenceWithoutImage = angular.copy($scope.conference);
        conferenceWithoutImage.image = null;

        var payloadBlockIds = blockIds(conferenceWithoutImage);
        var missingBlockIds = _.difference(
          lastSavedBlockIds,
          payloadBlockIds,
          intentionallyRemovedBlockIds,
        );
        if (missingBlockIds.length) {
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml(
              '<strong>Not saved.</strong> This change would have removed a question and its answers. Please reload the page and try again.',
            ),
          };
          // Keep the banner up: a 2s "Saved!" timer from an earlier success
          // would otherwise clear it.
          $timeout.cancel(formSavingNotifyTimeout);
          Rollbar.error(
            'eventForm: refused to save conference missing blocks',
            {
              conferenceId: conference.id,
              missingBlockIds: missingBlockIds,
            },
          );
          return;
        }

        formSaving = true;
        $http({
          method: 'PUT',
          url: 'conferences/' + conference.id,
          data: conferenceWithoutImage,
        })
          .then(function () {
            formSaving = false;
            lastSavedBlockIds = payloadBlockIds;
            // Drop marks the API has now acknowledged, and marks for blocks
            // that are back in the form (growl Undo). Keep marks for blocks
            // deleted while this PUT was in flight: they are still in this
            // payload, so the next save must still be allowed to omit them.
            intentionallyRemovedBlockIds = _.difference(
              _.intersection(intentionallyRemovedBlockIds, payloadBlockIds),
              blockIds($scope.conference),
            );
            $scope.notify = {
              class: 'alert-success',
              message: $sce.trustAsHtml(
                '<strong>Saved!</strong> Your form has been saved.',
              ),
            };

            //Update cache
            if (angular.isDefined($scope.conference)) {
              ConfCache.update(conference.id, $scope.conference);
            }

            $timeout.cancel(formSavingNotifyTimeout);
            formSavingNotifyTimeout = $timeout(function () {
              $scope.notify = {};
            }, 2000);
          })
          .catch(function (response) {
            formSaving = false;
            $scope.notify = {
              class: 'alert-danger',
              message: $sce.trustAsHtml(
                '<strong>Error</strong> ' +
                  (response.data && response.data.error
                    ? response.data.error.message
                    : 'Update failed.'),
              ),
            };
          });
      }

      $scope.previewForm = function () {
        $location.path('/preview/' + conference.id + '/page/');
      };

      $scope.deletePage = function (pageId, growl) {
        var delPageIndex = _.findIndex($scope.conference.registrationPages, {
          id: pageId,
        });
        var page = $scope.conference.registrationPages[delPageIndex];

        if (_.some(page.blocks, 'profileType', ['EMAIL', 'NAME'])) {
          modalMessage.error({
            title: 'Error Deleting Page',
            message:
              'This page contains required profile questions and cannot be deleted.',
          });
          return;
        }

        if (_.some(page.blocks, 'tag', ['EFORM'])) {
          modalMessage.error({
            title: 'Error Deleting Page',
            message:
              'This page contains required liability questions and cannot be deleted.',
          });
          return;
        }

        var blocksOnPage = _.filter(
          _.flatten(_.map($scope.conference.registrationPages, 'blocks')),
          { pageId: page.id },
        );
        var blocksNotOnPage = _.filter(
          _.flatten(_.map($scope.conference.registrationPages, 'blocks')),
          function (block) {
            return block.pageId !== page.id;
          },
        );
        var rulesToBeRemoved = _.filter(
          _.flatten(_.map(blocksNotOnPage, 'rules')),
          function (rule) {
            return _.includes(_.map(blocksOnPage, 'id'), rule.parentBlockId);
          },
        );

        var pageBlockIds = _.map(page.blocks, 'id');

        var confirmMessage =
          '<p>Are you sure you want to delete <strong>' +
          page.title +
          '</strong>?' +
          (page.blocks.length
            ? ' All questions on this page will be deleted.</p>'
            : '</p>');
        if (rulesToBeRemoved.length) {
          confirmMessage +=
            '<p>The following rules will also be deleted:</p><ul>';
          angular.forEach(rulesToBeRemoved, function (rule) {
            var parentBlock = _.find(blocksOnPage, { id: rule.parentBlockId });
            var block = _.find(blocksNotOnPage, { id: rule.blockId });

            confirmMessage +=
              '<li><strong>' +
              $sanitize(parentBlock.title) +
              '</strong> ' +
              rule.operator +
              ' <strong>' +
              rule.value +
              '</strong> on <strong>' +
              $sanitize(block.title) +
              '</strong>.</li>';
          });
          confirmMessage += '</ul>';
        }
        modalMessage
          .confirm({
            title: 'Delete Page',
            question: confirmMessage,
            normalSize: true,
          })
          .then(function () {
            if (growl) {
              var page = _.find($scope.conference.registrationPages, {
                id: pageId,
              });
              var message = 'Page "' + page.title + '" has been deleted.';
              GrowlService.growl(
                $scope,
                'conference',
                $scope.conference,
                message,
              );
            }

            if (rulesToBeRemoved.length) {
              //remove rules
              angular.forEach(
                $scope.conference.registrationPages,
                function (page, pageIndex) {
                  angular.forEach(page.blocks, function (block, blockIndex) {
                    angular.forEach(block.rules, function (rule, ruleIndex) {
                      if (_.includes(_.map(rulesToBeRemoved, 'id'), rule.id)) {
                        $scope.conference.registrationPages[pageIndex].blocks[
                          blockIndex
                        ].rules.splice(ruleIndex, 1);
                      }
                    });
                  });
                },
              );
            }
            intentionallyRemovedBlockIds = _.union(
              intentionallyRemovedBlockIds,
              pageBlockIds,
            );
            $scope.conference.registrationPages.splice(delPageIndex, 1);
          });
      };

      // Generate a map of blockIds to their page and index within the page
      var makeBlockPositionMap = function () {
        var positionMap = {};
        $scope.conference.registrationPages.forEach(function (page, pageIndex) {
          page.blocks.forEach(function (block, blockIndex) {
            positionMap[block.id] = {
              pageIndex,
              blockIndex,
            };
          });
        });
        return positionMap;
      };

      $scope.copyBlock = function (blockId) {
        var previousBlockPositions = makeBlockPositionMap();
        var origPageIndex = previousBlockPositions[blockId].pageIndex;
        var newBlock = angular.copy(
          $scope.conference.registrationPages[origPageIndex].blocks[
            previousBlockPositions[blockId].blockIndex
          ],
        );
        var newPosition = previousBlockPositions[blockId].blockIndex + 1;
        newBlock.id = uuid();
        newBlock.profileType = null;
        newBlock.position = newPosition;
        newBlock.title = newBlock.title + ' (copy)';
        newBlock.blockTagType = null;

        //update rules
        angular.forEach(newBlock.rules, function (r) {
          r.id = uuid();
          r.blockId = newBlock.id;
        });

        $scope.conference.registrationPages[origPageIndex].blocks.splice(
          newPosition,
          0,
          newBlock,
        );
      };

      $scope.insertBlock = function (
        blockType,
        newPage,
        newPosition,
        title,
        defaultProfile,
        defaultExportFieldTitle,
      ) {
        // Enforce one campus question per form so the school name resolves correctly
        // (a null profile shows the raw connection id). Reject the insert and show
        // an error message.
        if (
          blockType === 'campusV2Question' &&
          _.some(_.flatMap($scope.conference.registrationPages, 'blocks'), {
            type: 'campusV2Question',
          })
        ) {
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml(
              '<strong>Only one campus question is allowed per form.</strong>',
            ),
          };
          $timeout.cancel(formSavingNotifyTimeout);
          formSavingNotifyTimeout = $timeout(function () {
            $scope.notify = {};
          }, 2000);
          return;
        }

        var newPageIndex = _.findIndex($scope.conference.registrationPages, {
          id: newPage,
        });

        var profileType = null;
        if (angular.isDefined(defaultProfile)) {
          // Check whether a block with this profile type exists already on any page
          var profileCount = 0;
          $scope.conference.registrationPages.forEach(function (page) {
            page.blocks.forEach(function (block) {
              if (defaultProfile === block.profileType) {
                profileCount++;
              }
            });
          });
          if (profileCount === 0) {
            profileType = defaultProfile;
          }
        }

        var newBlock = {
          id: uuid(),
          content: '',
          pageId: newPage,
          required: false,
          title: title,
          type: blockType,
          profileType: profileType,
          registrantTypes: [],
          rules: [],
          exportFieldTitle: defaultExportFieldTitle,
        };

        $scope.conference.registrationPages[newPageIndex].blocks.splice(
          newPosition,
          0,
          newBlock,
        );
      };

      $scope.deleteBlock = function (blockId, growl) {
        //check if block is parent for any rules
        var allBlocks = _.flatten(
          _.map($scope.conference.registrationPages, 'blocks'),
        );
        var childRules = _.filter(_.flatten(_.map(allBlocks, 'rules')), {
          parentBlockId: blockId,
        });
        if (childRules.length !== 0) {
          var questions = _(childRules)
            .map(function (rule) {
              var block = _.find(allBlocks, { id: rule.blockId });
              return '<li>' + $sanitize(block.title) + '</li>';
            })
            .uniq()
            .value();
          var pluralize = 'question has';
          if (questions.length > 1) {
            pluralize = 'questions have';
          }
          modalMessage.error({
            title: 'Error Removing Question',
            message:
              'The following ' +
              pluralize +
              ' at least one rule that depends on this question:<ul>' +
              questions.join('') +
              '</ul>Please remove the rules that depend on this question and then try deleting it again.',
          });
          return;
        }

        var previousBlockPositions = makeBlockPositionMap();
        if (growl) {
          var block =
            $scope.conference.registrationPages[
              previousBlockPositions[blockId].pageIndex
            ].blocks[previousBlockPositions[blockId].blockIndex];
          var message = '"' + block.title + '" has been deleted.';
          GrowlService.growl($scope, 'conference', $scope.conference, message);
        }

        intentionallyRemovedBlockIds = _.union(intentionallyRemovedBlockIds, [
          blockId,
        ]);
        _.remove(
          $scope.conference.registrationPages[
            previousBlockPositions[blockId].pageIndex
          ].blocks,
          { id: blockId },
        );
      };

      $scope.addNewPage = function () {
        $scope.conference.registrationPages.push({
          id: uuid(),
          conferenceId: $scope.conference.id,
          position: 0,
          title: 'Page ' + ($scope.conference.registrationPages.length + 1),
          blocks: [],
        });
        $location.hash('page' + $scope.conference.registrationPages.length);
        $anchorScroll.yOffset = 250;
        $anchorScroll();
      };

      //Logic to handle collapsing pages
      var hiddenPages = [];
      $scope.togglePage = function (id) {
        if (_.includes(hiddenPages, id)) {
          _.remove(hiddenPages, function (p) {
            return p === id;
          });
        } else {
          hiddenPages.push(id);
        }
      };

      $scope.buildBlockTagTypeMappings = function () {
        $scope.blockTagTypeMapping = [];
        $scope.conference.registrationPages.forEach(function (page) {
          page.blocks.forEach(function (block) {
            // Partition registrant types in a single pass
            var partitioned = $scope.conference.registrantTypes.reduce(
              function (acc, registrantType) {
                if (_.includes(block.registrantTypes, registrantType.id)) {
                  acc.hidden.push({
                    id: registrantType.id,
                    name: registrantType.name,
                  });
                } else {
                  acc.included.push({
                    id: registrantType.id,
                    name: registrantType.name,
                  });
                }
                return acc;
              },
              { hidden: [], included: [] },
            );
            $scope.blockTagTypeMapping.push({
              blockId: block.id,
              title: block.title,
              blockTagTypeId: block.blockTagType ? block.blockTagType.id : null,
              hiddenFromRegistrantTypes: partitioned.hidden,
              includedInRegistrantTypes: partitioned.included,
            });
          });
        });
      };

      $scope.fetchBlockTagTypeMapping = function () {
        // Request block tag types, so we only do 1 HTTP request for them
        // Then we can use them in the $child controller blockEditor.js
        blockTagTypeService
          .loadBlockTagTypes($scope.conference.id, $scope.conference.ministry)
          .then(function (types) {
            $scope.blockTagTypes = types;
            $scope.buildBlockTagTypeMappings();
          });
      };

      $scope.fetchBlockTagTypeMapping();

      $scope.isPageHidden = function (id) {
        return _.includes(hiddenPages, id);
      };

      // The event overview route resolve re-fetches the conference before
      // $destroy fires, so the pending save must already be on the wire.
      $scope.$on('$locationChangeStart', function () {
        flushPendingSave();
      });

      // Clear block tag types service cache when controller is destroyed (e.g., navigating away)
      $scope.$on('$destroy', function () {
        flushPendingSave();
        $timeout.cancel(formSavingNotifyTimeout);
        blockTagTypeService.clearCache();
      });
    },
  );
