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

      var blockTypeFriendly = '';
      switch (blockType) {
        case 'paragraphContent':
          blockTypeFriendly = 'Information';
          break;
        case 'textQuestion':
          blockTypeFriendly = 'Text Field';
          break;
        case 'radioQuestion':
          blockTypeFriendly = 'Multiple choice block';
          break;
        case 'checkboxQuestion':
          blockTypeFriendly = 'Checkbox block';
          break;
        case 'selectQuestion':
          blockTypeFriendly = 'Dropdown select block';
          break;
        case 'emailQuestion':
          blockTypeFriendly = 'Email';
          break;
        case 'nameQuestion':
          blockTypeFriendly = 'Name';
          break;
        case 'phoneQuestion':
          blockTypeFriendly = 'Phone';
          break;
        default:
          blockTypeFriendly = 'New ' + blockType + ' Block';
      }

      var newBlock = {
        id: uuid(),
        content: '',
        pageId: newPage,
        required: false,
        title: blockTypeFriendly,
        type: blockType
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
