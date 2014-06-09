'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventFormCtrl', function ($rootScope, $scope, $modal, $location, $sce, $http, conference, GrowlService, ConfCache, uuid) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'form-builder',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };

    $scope.conference = conference;
    //Model.subscribe($scope, 'conference', 'conferences/' + conference.id);


    $scope.saveForm = function(preview){
      $scope.notify = {
        class: 'alert-warning',
        message: $sce.trustAsHtml('Saving...')
      };

      $http({
          method: 'PUT',
          url: 'conferences/' + conference.id,
          data: $scope.conference
        }).success(function () {
          $scope.notify = {
            class: 'alert-success',
            message: $sce.trustAsHtml('<strong>Saved!</strong> Your form has been saved.')
          };

          //Update cache
          if (angular.isDefined($scope.conference)) {
            ConfCache.update(conference.id, $scope.conference);
          }

          if(preview){
            $location.path('/preview/' + conference.id + '/page/');
          }
        }).error(function (data) {
          $scope.notify = {
            class: 'alert-danger',
            message: $sce.trustAsHtml('<strong>Error</strong> ' + data)
          };
        });
    };

    $scope.deletePage = function (pageId, growl) {
      if (growl) {
        var page = _.find($scope.conference.registrationPages, {id: pageId});
        var message = 'Page "' + page.title + '" has been deleted.';
        GrowlService.growl('conferences/' + $scope.conference.id, $scope.conference, message);
      }
      $scope.deletePageFromConf(pageId);
    };

    $scope.deletePageFromConf = function (pageId) {
      var delPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
      $scope.conference.registrationPages.splice(delPageIndex, 1);
    };




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


    $scope.insertBlock = function (blockType, newPage, newPosition, title, defaultProfile) {
      var newPageIndex = _.findIndex($scope.conference.registrationPages, { id: newPage });

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
        profileType: profileType
      };

      $scope.$apply(function () {
        $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, newBlock);
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
        templateUrl: 'views/modals/promptNewPage.html',
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
