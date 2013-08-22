'use strict';

angular.module('confRegistrationWebApp')
  .controller('FormDropAreaCtrl', function ($rootScope, $scope, uuid) {
    $scope.$on('dragVars', function (event, x) {
      $scope.blockId = x.blockId;
      $scope.moveType = x.moveType;
    });

    $scope.moveBlock = function (blockId, newPage, newPosition) {
      var tempPositionArray = [];
      var newPageIndex;
      $scope.conference.registrationPages.forEach(function (page, pageIndex) {
        if (newPage === page.id) {
          newPageIndex = pageIndex;
        }
        page.blocks.forEach(function (block, blockIndex) {
          tempPositionArray[block.id] = {page: pageIndex, block: blockIndex};
        });
      });
      //console.log('=======MOVE BLOCK==========',blockId, newPageIndex, newPosition);
      var origPage = tempPositionArray[blockId].page;
      var origBlock = $scope.conference.registrationPages[origPage].blocks[tempPositionArray[blockId].block];
      $scope.deleteBlock(blockId);
      origBlock.pageId = newPage;  //Update page id
      $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, origBlock);
    };

    $scope.insertBlock = function (blockType, newPage, newPosition) {
      var tempPositionArray = [];
      var newPageIndex;
      $scope.conference.registrationPages.forEach(function (page, pageIndex) {
        if (newPage === page.id) {
          newPageIndex = pageIndex;
        }
        page.blocks.forEach(function (block, blockIndex) {
          tempPositionArray[block.id] = {page: pageIndex, block: blockIndex};
        });
      });
      //console.log('=======NEW BLOCK==========',blockType, newPageIndex, newPosition);

      var newBlock = {
        id: uuid(),
        content: '',
        pageId: newPage,
        required: false,
        title: 'New Question',
        type: blockType
      };

      $scope.$apply(function (scope) {
        scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, newBlock);
      });

    };

    $scope.deleteBlock = function (blockId) {
      var tempPositionArray = [];
      $scope.conference.registrationPages.forEach(function (page, pageIndex) {
        page.blocks.forEach(function (block, blockIndex) {
          tempPositionArray[block.id] = {page: pageIndex, block: blockIndex};
        });
      });
      $scope.conference.registrationPages[tempPositionArray[blockId].page].blocks.splice(
        tempPositionArray[blockId].block,
        1
      );
    };
  });
