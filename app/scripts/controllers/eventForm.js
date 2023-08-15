angular
  .module('confRegistrationWebApp')
  .controller(
    'eventFormCtrl',
    function (
      $rootScope,
      $scope,
      $uibModal,
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
            saveForm();
          }
        },
        true,
      );

      var formSaving = false;
      var formSavingTimeout;
      var formSavingNotifyTimeout;

      function saveForm() {
        if (formSaving) {
          $timeout.cancel(formSavingTimeout);
          formSavingTimeout = $timeout(function () {
            saveForm();
          }, 600);
          return;
        }
        $timeout.cancel(formSavingTimeout);

        formSaving = true;
        let conferenceWithoutImage = angular.copy($scope.conference);
        conferenceWithoutImage.image = null;

        $http({
          method: 'PUT',
          url: 'conferences/' + conference.id,
          data: conferenceWithoutImage,
        })
          .then(function () {
            formSaving = false;
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
            $scope.conference.registrationPages.splice(delPageIndex, 1);
          });
      };

      var makePositionArray = function () {
        var tempPositionArray = [];
        $scope.conference.registrationPages.forEach(function (page, pageIndex) {
          page.blocks.forEach(function (block, blockIndex) {
            tempPositionArray[block.id] = {
              page: pageIndex,
              block: blockIndex,
            };
          });
        });
        return tempPositionArray;
      };

      $scope.copyBlock = function (blockId) {
        var tempPositionArray = makePositionArray();
        var origPageIndex = tempPositionArray[blockId].page;
        var newBlock = angular.copy(
          $scope.conference.registrationPages[origPageIndex].blocks[
            tempPositionArray[blockId].block
          ],
        );
        var newPosition = tempPositionArray[blockId].block + 1;
        newBlock.id = uuid();
        newBlock.profileType = null;
        newBlock.position = newPosition;
        newBlock.title = newBlock.title + ' (copy)';

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
        var newPageIndex = _.findIndex($scope.conference.registrationPages, {
          id: newPage,
        });

        var profileType = null;
        if (angular.isDefined(defaultProfile)) {
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

        if (growl) {
          var t = makePositionArray();
          var block =
            $scope.conference.registrationPages[t[blockId].page].blocks[
              t[blockId].block
            ];
          var message = '"' + block.title + '" has been deleted.';
          GrowlService.growl($scope, 'conference', $scope.conference, message);
        }

        var tempPositionArray = makePositionArray();
        _.remove(
          $scope.conference.registrationPages[tempPositionArray[blockId].page]
            .blocks,
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

      $scope.isPageHidden = function (id) {
        return _.includes(hiddenPages, id);
      };
    },
  );
