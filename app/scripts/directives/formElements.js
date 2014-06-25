'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        var newDragBlock = '';
        window.setTimeout(function () {
          jQuery('.connectedSortable').sortable({
            connectWith: '.connectedSortable',
            //placeholder: 'crs-dragBack',
            //helper: 'clone',
            stop: function (event, ui) {
              if (newDragBlock !== '') {
                scope.insertBlock(newDragBlock,
                  ui.item.parent().attr('id'),
                  ui.item.index(),
                  ui.item.attr('default-title'),
                  ui.item.attr('default-profile'));
                ui.item.remove();
              } else {
                scope.moveBlock(ui.item.find('.crsQuestion').attr('id'), ui.item.parent().attr('id'), ui.item.index());
              }
            }
          });

          jQuery('.crsFormElements li').draggable({
            connectToSortable: '.connectedSortable',
            helper: 'clone',
            revert: 'invalid',
            //addClasses: false,
            //appendTo: 'main',
            start: function () {
              newDragBlock = $(this).attr('id');
            },
            stop: function () {
              newDragBlock = '';
              formElementsScroll();
            }
          }).disableSelection();

          var formElementsScroll = function() {
            var yOffset = jQuery(window).scrollTop();
            var elementlist = jQuery('.waypoint1').offset().top;

            var windowHeight = jQuery(window).height();
            var crsFormElementsHeight = jQuery('.elements-list').height() + 60;

            var footerHeight = jQuery('#pagefooter').height();
            var remainingDocToScroll = jQuery(document).height() - (yOffset + jQuery(window).height()) - footerHeight;

            if (yOffset - elementlist > 0 && windowHeight + remainingDocToScroll > crsFormElementsHeight && crsFormElementsHeight < windowHeight) {
              jQuery('.elements-list, .functions-header').css('position', 'fixed');
              jQuery('.form-page').css('margin-top', jQuery('.functions-header').css('height'));
            } else {
              jQuery('.elements-list, .functions-header').css('position', 'relative');
              jQuery('.form-page').css('margin-top', '0');
            }
          };

          jQuery(window).scroll(function () {
            if (!jQuery('.waypoint1').length) {
              jQuery(window).unbind('scroll');
              return;
            }
            formElementsScroll();
          });

          jQuery(window).resize(function () {
            if (!jQuery('.waypoint1').length) {
              jQuery(window).unbind('resize');
              return;
            }
            formElementsScroll();
          });
        }, 500);
      }
    };
  });
