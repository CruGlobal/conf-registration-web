'use strict';

angular.module('confRegistrationWebApp')
  .directive('formDropArea', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope, uuid) {
        $scope.$on('dragVars', function (event, x) {
          $scope.blockId = x.blockId;
          $scope.moveType = x.moveType;
        });

        $scope.moveBlock = function(blockId, newPage, newPosition) {
          var tempPositionArray=new Array();
          var newPageIndex;
          $scope.conference.registrationPages.forEach(function(page, pageIndex){
            if(newPage==page.id){
              newPageIndex=pageIndex;
            }
            page.blocks.forEach(function(block, blockIndex){
              tempPositionArray[block.id]=new Object({page:pageIndex,block:blockIndex});
            });
          });
          console.log('=======MOVE BLOCK==========',blockId, newPageIndex, newPosition);

          var origBlock=$scope.conference.registrationPages[tempPositionArray[blockId].page].blocks[tempPositionArray[blockId].block];

          $scope.deleteBlock(blockId);
          origBlock.pageId=newPage;  //Update page id
          $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition,0,origBlock);

          console.log($scope.conference.registrationPages);
        };

        $scope.insertBlock = function(blockType, newPage, newPosition) {
          var tempPositionArray=new Array();
          var newPageIndex;
          $scope.conference.registrationPages.forEach(function(page, pageIndex){
            if(newPage==page.id){
              newPageIndex=pageIndex;
            }
            page.blocks.forEach(function(block, blockIndex){
              tempPositionArray[block.id]=new Object({page:pageIndex,block:blockIndex});
            });
          });
          console.log('=======NEW BLOCK==========',blockType, newPageIndex, newPosition);

          var newBlock=new Object({
            id: uuid(),
            content: "",
            pageId: newPage,
            required: false,
            title: "",
            type: blockType
          });
          $scope.conference.registrationPages[newPageIndex].blocks.splice(newPosition,0,newBlock);
        };

        $scope.deleteBlock = function(blockId) {
          var tempPositionArray=new Array();
          $scope.conference.registrationPages.forEach(function(page, pageIndex){
            page.blocks.forEach(function(block, blockIndex){
              tempPositionArray[block.id]=new Object({page:pageIndex,block:blockIndex});
            });
          });
          $scope.conference.registrationPages[tempPositionArray[blockId].page].blocks.splice(tempPositionArray[blockId].block,1);
        };
      },
      link: function postLink(scope, element, uuid) {
        element.bind('drop', function (ev) {
          ev.preventDefault();
          var pageId = $(ev.target).closest('.crs-formElements').attr('data-page-id');
          var position = $(ev.target).closest('block').prevAll().length + scope.crsPositionAdd;
          if (scope.moveType === 'new') {
            var blockType = scope.blockId;
            var li = document.createElement('div');
            li.innerHTML = '<label>' + blockType + '</label>';
            $('#crsDropZone').before(li);
            scope.insertBlock(blockType, pageId, position);
          } else if (scope.moveType === 'move') {
            $('#' + scope.blockId).insertBefore($('#crsDropZone'));
            scope.moveBlock(scope.blockId, pageId, position);
          }
        });



        element.bind('dragover', function (ev) {
          ev.preventDefault();
          function isNear(element) {
            if ($(element).length === 0) {
              return;
            }
            var Y = event.pageY - $(element).offset().top;
            if (Y >= (element.height() / 2)) {
              return 'bottom';
            } else {
              return 'top';
            }
          }
          if (isNear($(ev.target).closest('.crs-question-default')) === 'bottom') {
            $('#crsDropZone').insertAfter($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 1;
          } else if (isNear($(ev.target).closest('.crs-question-default')) === 'top') {
            $('#crsDropZone').insertBefore($(ev.target).closest('.crsQuestion'));
            scope.crsPositionAdd = 0;
          }
          $('#crsDropZone').css('height', '120px');
          $('#crsDropZone').css('display', 'block');
        });

      }
    };
  });
