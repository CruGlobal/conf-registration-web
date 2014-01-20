'use strict';

angular.module('confRegistrationWebApp')
  .controller('FormDropAreaCtrl', function ($rootScope, $scope, $modal, uuid, GrowlService) {
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
      origBlock.pageId = newPage;
      $scope.$apply(function (scope) {
        scope.deleteBlock(blockId, false);
        scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, origBlock);
      });
    };

    $scope.insertBlock = function (blockType, newPage, newPosition) {
      var newPageIndex = _.findIndex($scope.conference.registrationPages, { id: newPage });
      var profileType = null;

      if(blockType.indexOf("-profile") != -1){
        blockType = blockType.split("-");
        profileType = blockType[2];
        blockType = blockType[0];
      }

      if (profileType !== '') {
        var blockArray = new Array();
        $scope.conference.registrationPages.forEach(function (page, pageIndex) {
          page.blocks.forEach(function (block) {
            blockArray.push(block.profileType);
          });
        });
        if (blockArray.indexOf(profileType) != -1) {
          alert('Only one ' + profileType.charAt(0).toUpperCase() + profileType.slice(1).toLowerCase() + ' profile block can be used per form.');
          profileType = null;
        }
      }

      var newBlock = {
        id: uuid(),
        content: '',
        pageId: newPage,
        required: false,
        title: 'New ' + blockType + ' Block',
        type: blockType,
        profileType: profileType
      };

      $scope.$apply(function (scope) {
        scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, newBlock);
      });
    };

    $scope.deleteBlock = function (blockId, growl) {
      if (growl) {
        var t = makePositionArray();
        var block = $scope.conference.registrationPages[t[blockId].page].blocks[t[blockId].block];
        var message = '"' + block.title + '" has been deleted.';
        GrowlService.growl('conferences/' + $scope.conference.id, $scope.conference, message);
      }
      $scope.deleteBlockFromPage(blockId);
    };

    $scope.deleteBlockFromPage = function (blockId) {
      var tempPositionArray = makePositionArray();
      $scope.conference.registrationPages[tempPositionArray[blockId].page].blocks.splice(
        tempPositionArray[blockId].block,
        1
      );
    };

    $scope.addNewPage = function () {
      $modal.open({
        templateUrl: 'views/promptNewPage.html',
        controller: 'confirmPromptCtrl'
      }).result.then(function (pageTitle) {
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
