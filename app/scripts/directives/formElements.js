'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      link: function questionsToolbarInterface(scope) {
        window.setTimeout(function () {
          $(".questions-toolbar").affix({
            offset: {
              top: 240
            }
          });
          $(window).on('resize', function() {
            $(".questions-toolbar-container").css("min-height", function(){
              return $(".questions-toolbar").height();
            });
          });
        }, 500);
      }
    };
  });
