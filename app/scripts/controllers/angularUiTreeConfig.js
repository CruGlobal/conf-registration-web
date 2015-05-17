'use strict';

angular.module('confRegistrationWebApp')
  .controller('AngularUiTreeConfig', function ($scope) {
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
      }
    };
  });
