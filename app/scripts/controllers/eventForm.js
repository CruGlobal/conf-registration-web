'use strict';

angular.module('confRegistrationWebApp')
  .controller('eventFormCtrl', function ($rootScope, $scope, $modal, $location, $anchorScroll, $sce, $http, $timeout, conference, GrowlService, ConfCache, uuid, permissions, permissionConstants) {
    $rootScope.globalPage = {
      type: 'admin',
      mainClass: 'container event-questions',
      bodyClass: 'small-footer',
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
    $scope.$watch('conference', function (newObject, oldObject) {
      if (angular.isDefined(newObject) && angular.isDefined(oldObject)) {
        if(!_.isEqual(newObject, oldObject)){
          saveForm();
        }
      }
    }, true);

    var formSaving = false;
    var formSavingTimeout;
    var formSavingNotifyTimeout;

    var saveForm = function () {
      if (formSaving) {
        $timeout.cancel(formSavingTimeout);
        formSavingTimeout = $timeout(function() { saveForm(); }, 600);
        return;
      }
      $timeout.cancel(formSavingTimeout);

      formSaving = true;
      /*$scope.notify = {
        class: 'alert-warning',
        message: $sce.trustAsHtml('Saving...')
      };*/

      $http({
        method: 'PUT',
        url: 'conferences/' + conference.id,
        data: $scope.conference
      }).success(function () {
        formSaving = false;
        $scope.notify = {
          class: 'alert-success',
          message: $sce.trustAsHtml('<strong>Saved!</strong> Your form has been saved.')
        };

        //Update cache
        if (angular.isDefined($scope.conference)) {
          ConfCache.update(conference.id, $scope.conference);
        }

        $timeout.cancel(formSavingNotifyTimeout);
        formSavingNotifyTimeout = $timeout(function () {
          $scope.notify = {};
        }, 2000);
      }).error(function (data) {
        formSaving = false;
        $scope.notify = {
          class: 'alert-danger',
          message: $sce.trustAsHtml('<strong>Error</strong> ' + data)
        };
      });
    };

    $scope.previewForm = function () {
      $location.path('/preview/' + conference.id + '/page/');
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

      var origBlock = angular.copy($scope.conference.registrationPages[origPageIndex].blocks[tempPositionArray[blockId].block]);
      origBlock.pageId = newPage;

      deleteBlockFromPage(blockId);
      $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, origBlock);
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

      $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition, 0, newBlock);
    };

    $scope.deleteBlock = function (blockId, growl) {
      if (growl) {
        var t = makePositionArray();
        var block = $scope.conference.registrationPages[t[blockId].page].blocks[t[blockId].block];
        var message = '"' + block.title + '" has been deleted.';
        GrowlService.growl($scope, 'conference', $scope.conference, message);
      }
      deleteBlockFromPage(blockId);
    };

    var deleteBlockFromPage = function (blockId) {
      var tempPositionArray = makePositionArray();
      _.remove($scope.conference.registrationPages[tempPositionArray[blockId].page].blocks, function(b) { return b.id === blockId; });
    };

    $scope.addNewPage = function () {
      $scope.conference.registrationPages.push({
        id: uuid(),
        conferenceId: $scope.conference.id,
        position: 0,
        title: 'Page ' + ($scope.conference.registrationPages.length + 1),
        blocks: []
      });
      $location.hash('page' + $scope.conference.registrationPages.length);
      $anchorScroll.yOffset = 250;
      $anchorScroll();
    };

    $scope.questions = [
      {
        'id': 'paragraphContent',
        'defaultTitle': 'Information',
        'iconClass': 'fa-plus-circle',
        'name': 'Information Box'
      },
      {
        'id': 'textQuestion',
        'defaultTitle': 'Question',
        'iconClass': 'fa-pencil-square-o',
        'name': 'Single Line Text'
      },
      {
        'id': 'textareaQuestion',
        'defaultTitle': 'Question',
        'iconClass': 'fa-text-height',
        'name': 'Multi Line Text'
      },
      {
        'id': 'radioQuestion',
        'defaultTitle': 'Multiple Choice Question',
        'iconClass': 'fa-list',
        'name': 'Multiple Choice (choose one)'
      },
      {
        'id': 'checkboxQuestion',
        'defaultTitle': 'Checkbox Question',
        'iconClass': 'fa-check-square-o',
        'name': 'Checkbox (choose one or more)'
      },
      {
        'id': 'selectQuestion',
        'defaultTitle': 'Dropdown Question',
        'iconClass': 'fa-chevron-down',
        'name': 'Dropdown'
      },
      {
        'id': 'numberQuestion',
        'defaultTitle': 'Number',
        'iconClass': 'fa-superscript',
        'name': 'Number'
      },
      {
        'id': 'dateQuestion',
        'defaultTitle': 'Date',
        'iconClass': 'fa-calendar',
        'name': 'Date'
      },
      {
        'id': 'nameQuestion',
        'defaultTitle': 'Name',
        'iconClass': 'fa-user',
        'name': 'Name'
      },
      {
        'id': 'emailQuestion',
        'defaultTitle': 'Email',
        'iconClass': 'fa-envelope-o',
        'name': 'Email'
      },
      {
        'id': 'phoneQuestion',
        'defaultTitle': 'Telephone',
        'defaultProfile': 'PHONE',
        'iconClass': 'fa-phone-square',
        'name': 'Telephone'
      },
      {
        'id': 'addressQuestion',
        'defaultTitle': 'Address',
        'defaultProfile': 'ADDRESS',
        'iconClass': 'fa-home',
        'name': 'Address'
      },
      {
        'id': 'genderQuestion',
        'defaultTitle': 'Gender',
        'defaultProfile': 'GENDER',
        'iconClass': 'fa-male',
        'name': 'Gender'
      },
      {
        'id': 'yearInSchoolQuestion',
        'defaultTitle': 'Year in School',
        'defaultProfile': 'YEAR_IN_SCHOOL',
        'iconClass': 'fa-graduation-cap',
        'name': 'Year in School'
      }];

    $scope.questionsToolbarVisible = true;
    $scope.toggleQuestionsToolbar = function() {
      $scope.questionsToolbarVisible = !$scope.questionsToolbarVisible;
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
