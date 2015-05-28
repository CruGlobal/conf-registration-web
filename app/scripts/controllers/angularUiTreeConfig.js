'use strict';

angular.module('confRegistrationWebApp')
  .controller('AngularUiTreeConfig', function ($scope, modalMessage) {
    $scope.toolbarTreeConfig = {
      accept: function(sourceNodeScope, destNodesScope) {
        return sourceNodeScope.$treeScope === destNodesScope.$treeScope;
      },
      beforeDrop: function(event) {
        //cancel regular drop action
        event.source.nodeScope.$$apply = false;
        //insert block
        if(event.dest.nodesScope.$nodeScope){ //prevents error from dropping on source tree
          var block = event.source.nodeScope.$modelValue;
          var pageId = event.dest.nodesScope.$nodeScope.$modelValue.id;
          $scope.insertBlock(block.id, pageId, event.dest.index, block.defaultTitle);
        }
      }
    };
    $scope.pageTreeConfig = {
      accept: function (sourceNodeScope, destNodesScope) {
        var sourceType = sourceNodeScope.$modelValue.pageId || sourceNodeScope.$modelValue.defaultTitle ? 'block' : 'page';
        var destType = destNodesScope.$element.attr('drop-type');
        return (sourceType === destType); // only accept the same type
      },
      beforeDrop: function(event){
        var block = event.source.nodeScope.block;
        if(angular.isUndefined(block)){ //must be a block to continue
          return;
        }

        var conference = $scope.$parent.$parent.conference;
        var positionArray = [];
        conference.registrationPages.forEach(function (page, pageIndex) {
          page.blocks.forEach(function (block, blockIndex) {
            positionArray[block.id] = {page: pageIndex, block: blockIndex, title: block.title};
          });
        });

        var sourcePageId = event.source.nodesScope.$nodeScope.$modelValue.id;
        var sourcePageIndex = _.findIndex(conference.registrationPages, {'id':  sourcePageId});

        var destPageId = event.dest.nodesScope.$nodeScope.$modelValue.id;
        var destPageIndex = _.findIndex(conference.registrationPages, {'id':  destPageId});

        var rulesViolated = [];
        //check if any of current blocks rules will be violated
        angular.forEach(block.rules, function(rule){
          var parentBlockLocation = positionArray[rule.parentBlockId];
          if(parentBlockLocation.page > destPageIndex || (parentBlockLocation.page === destPageIndex && parentBlockLocation.block >= event.dest.index)){
            rulesViolated.push('"' + block.title + '" must be below "' + parentBlockLocation.title + '".');
          }
        });

        //check if any other blocks rules will be violated
        var allRules = _.flatten(_.flatten(conference.registrationPages, 'blocks'), 'rules');
        var rulesLinkedToBlock = _.where(allRules, {parentBlockId: block.id});
        angular.forEach(rulesLinkedToBlock, function(rule){
          var childBlockLocation = positionArray[rule.blockId];
          if(
              childBlockLocation.page < destPageIndex ||
              (childBlockLocation.page === destPageIndex && childBlockLocation.block < event.dest.index) ||
              (childBlockLocation.page === destPageIndex && sourcePageIndex === destPageIndex && childBlockLocation.block === event.dest.index)
          ){
            rulesViolated.push('"' + childBlockLocation.title + '" must be below "' + block.title + '".');
          }
        });

        if(rulesViolated.length){
          event.source.nodeScope.$$apply = false;
          modalMessage.error({
            'title': 'Error Moving Question',
            'message': '<p><strong>Rule violations:</strong></p><ul><li>' + rulesViolated.join('</li><li>') + '</li></ul>'
          });
        }
      }
    };
  });
