'use strict';

angular.module('confRegistrationWebApp')
  .controller('FormDropAreaCtrl', function ($rootScope, $scope, $dialog, uuid) {
    $scope.$on('dragVars', function (event, x) {
      $scope.blockId = x.blockId;
      $scope.moveType = x.moveType;
    });

    function makePositionArray() {
      var tempPositionArray = [];
      $scope.conference.registrationPages.forEach(function (page, pageIndex) {
        page.blocks.forEach(function (block, blockIndex) {
          tempPositionArray[block.id] = {page: pageIndex, block: blockIndex};
        });
      });
      return tempPositionArray;
    }

    $scope.moveBlock = function (blockId, newPage, newPosition) {
      var tempPositionArray = makePositionArray();
      var newPageIndex = _.findIndex($scope.conference.registrationPages, { id: newPage });

      var origPageIndex = tempPositionArray[blockId].page;
      var origBlock = $scope.conference.registrationPages[origPageIndex].blocks[tempPositionArray[blockId].block];
      $scope.deleteBlock(blockId, false);
      origBlock.pageId = newPage;
      $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, origBlock);
    };

    $scope.insertBlock = function (blockType, newPage, newPosition) {
      var newPageIndex = _.findIndex($scope.conference.registrationPages, { id: newPage });

      var newBlock = {
        id: uuid(),
        content: '',
        pageId: newPage,
        required: false,
        title: 'New Question',
        type: blockType
      };

      $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, newBlock);
    };

    $scope.deleteBlock = function (blockId, confirmation) {
      if (confirmation) {
        $dialog.dialog({
          templateUrl: 'views/confirmDeleteBlock.html',
          controller: 'confirmCtrl'
        }).open().then(function (result) {
            if (result) {
              $scope.deleteBlockFromPage(blockId);
            }
          });
      } else {
        $scope.deleteBlockFromPage(blockId);
      }

    };

    $scope.deleteBlockFromPage = function (blockId) {
      var tempPositionArray = makePositionArray();
      $scope.conference.registrationPages[tempPositionArray[blockId].page].blocks.splice(
        tempPositionArray[blockId].block,
        1
      );
    };

    $scope.addNewPage = function () {
      $dialog.dialog({
        templateUrl: 'views/promptNewPage.html',
        controller: 'confirmPromptCtrl'
      }).open().then(function (pageTitle) {
          if (pageTitle !== null && pageTitle !== '' && !angular.isUndefined(pageTitle)) {
            $scope.conference.registrationPages.push({
              id: uuid(),
              conferenceId: $scope.conference.id,
              position: 0,
              title: pageTitle,
              blocks: []
            });
          }
        });

    };
  });
