'use strict';

angular.module('confRegistrationWebApp')
  .directive('questionToolbar', function ($document, $timeout) {
    return {
      restrict: 'A',
      link: function($scope) {
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
          var placeholder = $('.questions-toolbar-placeholder');
          if(placeholder.length){
            $('.questions-toolbar').data('bs.affix').options.offset.top = placeholder.offset().top;
            placeholder.css('min-height', function(){
              return $('.questions-toolbar').outerHeight(true);
            });
          }
        }

        $scope.questionsToolbarVisible = true;
        $scope.toggleQuestionsToolbar = function() {
          $scope.questionsToolbarVisible = !$scope.questionsToolbarVisible;
          $timeout(setQuestionToolbarSize, 0);
        };

        $document.ready(function () {
          $('.questions-toolbar').affix({
            offset: {
              top: function () {
                return (this.top = $('.questions-toolbar-placeholder').offset().top);
              }
            }
          });
          $timeout(setQuestionToolbarSize, 0);
          $(window).smartresize(function(){
            setQuestionToolbarSize();
          });
        });
      }
    };
  });
