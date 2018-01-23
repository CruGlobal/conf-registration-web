
angular.module('confRegistrationWebApp')
  .controller('AngularUiTreeConfig', function ($scope, modalMessage, $sanitize, gettextCatalog) {
    $scope.toolbarTreeConfig = {
      accept: function(sourceNodeScope, destNodesScope) {
        return sourceNodeScope.$treeScope === destNodesScope.$treeScope;
      },
      beforeDrop: function(event) {
        //insert block
        if(event.dest.nodesScope.$nodeScope){ //prevents error from dropping on source tree
          var block = event.source.nodeScope.$modelValue;
          var pageId = event.dest.nodesScope.$nodeScope.$modelValue.id;
          $scope.insertBlock(block.id, pageId, event.dest.index, block.defaultTitle, block.defaultProfile);
        }
        return false; //cancel regular drop action
      }
    };
    $scope.pageTreeConfig = {
      accept: function (sourceNodeScope, destNodesScope) {
        var sourceType = sourceNodeScope.$modelValue.pageId || sourceNodeScope.$modelValue.defaultTitle ? 'block' : 'page';
        var destType = destNodesScope.$element.attr('drop-type');
        return (sourceType === destType); // only accept the same type
      },
      beforeDrop: function(event){
        /** Check for rule violations. Blocks with rules must be below the blocks they depend on. **/

        var block = event.source.nodeScope.block;
        if(angular.isUndefined(block)){ //must be a block to continue
          return;
        }

        var conference = $scope.$parent.conference;
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
            rulesViolated.push('<strong>' + $sanitize(block.title) + '</strong> ' + gettextCatalog.getString('must be below') + ' <strong>' + $sanitize(parentBlockLocation.title) + '</strong>.');
          }
        });

        //check if any other blocks rules will be violated
        var allRules = _.flatten(_.map(_.flatten(_.map(conference.registrationPages, 'blocks')), 'rules'));
        var rulesLinkedToBlock = _.filter(allRules, {parentBlockId: block.id});
        angular.forEach(rulesLinkedToBlock, function(rule){
          var childBlockLocation = positionArray[rule.blockId];
          if(
              childBlockLocation.page < destPageIndex ||
              (childBlockLocation.page === destPageIndex && childBlockLocation.block < event.dest.index) ||
              (childBlockLocation.page === destPageIndex && sourcePageIndex === destPageIndex && childBlockLocation.block === event.dest.index)
          ){
            rulesViolated.push('<strong>' + $sanitize(childBlockLocation.title) + '</strong> ' + gettextCatalog.getString('must be below') + ' <strong>' + $sanitize(block.title) + '</strong>.');
          }
        });

        if(rulesViolated.length){
          modalMessage.error({
            'title': gettextCatalog.getString('Error Moving Question'),
            'message': '<p><strong>' + gettextCatalog.getString('Rule violations:') + '</strong></p><ul><li>' + rulesViolated.join('</li><li>') + '</li></ul>'
          });
          return false; //cancel regular drop action
        }
      }
    };
  });
