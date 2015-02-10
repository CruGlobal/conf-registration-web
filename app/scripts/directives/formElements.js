'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      link: function dragAndDropInterface(scope) {
        scope.toolbarTreeConfig = {
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
              scope.insertBlock(block.id, pageId, event.dest.index, block.defaultTitle);
            }
          }
        };
        scope.pageTreeConfig = {
          accept: function (sourceNode, destNodes) {
            var sourceType = sourceNode.$modelValue.pageId || sourceNode.$modelValue.defaultTitle ? 'block' : 'page';
            var destType = destNodes.$element.attr('drop-type');
            return (sourceType === destType); // only accept the same type
          }
        };

        //Debouncing plugin for jQuery from http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
        (function($,sr){
          // debouncing function from John Hann
          // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
          var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced () {
              var obj = this, args = arguments;
              function delayed () {
                if (!execAsap) {
                  func.apply(obj, args);
                }
                timeout = null;
              }

              if (timeout) {
                clearTimeout(timeout);
              }else if (execAsap) {
                func.apply(obj, args);
              }
              timeout = setTimeout(delayed, threshold || 500);
            };
          };
          // smartresize
          jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

        })(jQuery,'smartresize');

        //keep placeholder the same size when the toolbar is affixed
        function setQuestionToolbarSize(){
          var container = $('.questions-toolbar-container');
          if(container.length){
            $('.questions-toolbar').data('bs.affix').options.offset.top = container.offset().top;
            container.css('min-height', function(){
              return $('.questions-toolbar').height();
            });
          }
        }
        $(document).ready(function () {
          $('.questions-toolbar').affix({
            offset: {
              top: function () {
                return (this.top = $('.questions-toolbar-container').offset().top);
              }
            }
          });
          setQuestionToolbarSize();
          $(window).smartresize(function(){
            setQuestionToolbarSize();
          });
        });
      }
    };
  });
