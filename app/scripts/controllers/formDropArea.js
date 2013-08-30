'use strict';

angular.module('confRegistrationWebApp')
  .controller('FormDropAreaCtrl', function ($rootScope, $scope, uuid) {
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
        var r = confirm('Are you sure you want to delete this question?');
        if (!r) {
          return;
        }
      }
      var tempPositionArray = makePositionArray();
      $scope.conference.registrationPages[tempPositionArray[blockId].page].blocks.splice(
        tempPositionArray[blockId].block,
        1
      );
    };

    $scope.addNewPage = function () {
      var pageTitle = prompt('Please enter a page title:', '');
      if (pageTitle !== null && pageTitle !== '') {
        $scope.conference.registrationPages.push({
          id: uuid(),
          conferenceId: $scope.conference.id,
          position: 0,
          title: pageTitle,
          blocks: []
        });
      }
    };
  });
