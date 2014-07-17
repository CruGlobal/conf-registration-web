'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventFormCtrl', function ($rootScope, $scope, $modal, $location, $sce, $http, conference, GrowlService, ConfCache, uuid, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'form-builder',
      bodyClass: '',
      title: conference.name,
      confId: conference.id,
      footer: true
    };
    if (permissions.permissionInt >= permissionConstants.UPDATE) {
      $scope.templateUrl = 'views/eventForm.html';
    } else {
      $scope.templateUrl = 'views/permissionError.html';
    }
    $scope.conference = conference;

    $scope.saveForm = function (preview) {
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

          if (preview) {
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
      var delPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
      if ($scope.conference.registrationPages[delPageIndex].blocks.length > 0) {
        $modal.open({
          templateUrl: 'views/modals/errorModal.html',
          controller: 'genericModal',
          resolve: {
            data: function () {
              return 'Please remove all questions from page before deleting.';
            }
          }
        });
        return;
      }
      if (growl) {
        var page = _.find($scope.conference.registrationPages, {id: pageId});
        var message = 'Page "' + page.title + '" has been deleted.';
        GrowlService.growl($scope, 'conference', $scope.conference, message);
      }
      $scope.conference.registrationPages.splice(delPageIndex, 1);
    };

    var makePositionArray = function () {
      var tempPositionArray = [];
      $scope.conference.registrationPages.forEach(function (page, pageIndex) {
        page.blocks.forEach(function (block, blockIndex) {
          tempPositionArray[block.id] = {page: pageIndex, block: blockIndex};
        });
      });
      return tempPositionArray;
    };

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

    $scope.copyBlock = function (blockId) {
      var tempPositionArray = makePositionArray();
      var origPageIndex = tempPositionArray[blockId].page;
      var newBlock = angular.copy($scope.conference.registrationPages[origPageIndex].blocks[tempPositionArray[blockId].block]);
      var newPosition = tempPositionArray[blockId].block + 1;
      newBlock.id = uuid();
      newBlock.profileType = null;
      newBlock.position = newPosition;
      newBlock.title = newBlock.title + ' (copy)';

      $scope.conference.registrationPages[origPageIndex].blocks.splice(newPosition, 0, newBlock);
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
        GrowlService.growl($scope, 'conference', $scope.conference, message);
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

    var hiddenPages = [];
    $scope.togglePage = function(id) {
      if(_.contains(hiddenPages, id)) {
        _.remove(hiddenPages, function(p) { return p === id ; });
      } else {
        hiddenPages.push(id);
      }
    };

    $scope.isPageHidden = function(id) {
      return _.contains(hiddenPages, id);
    };

    $scope.movePage = function (pageId, newPosition) {
      var origPageIndex = _.findIndex($scope.conference.registrationPages, { id: pageId });
      var origPage = $scope.conference.registrationPages[origPageIndex];

      $scope.$apply(function (scope) {
        scope.conference.registrationPages.splice(origPageIndex, 1);
        scope.conference.registrationPages.splice(newPosition, 0, origPage);
      });
    };
  });
