'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        var newDragBlock = '';
        window.setTimeout(function(){
          jQuery('.connectedSortable').sortable({
            connectWith: '.connectedSortable',
            //placeholder: 'crs-dragBack',
            //helper: 'clone',
            stop: function (event, ui) {
              if (newDragBlock !== '') {
                console.log(newDragBlock, ui.item.parent().attr('id'), ui.item.index(), ui.item.attr('default-title'), ui.item.attr('default-profile'));
                scope.insertBlock(newDragBlock, ui.item.parent().attr('id'), ui.item.index(), ui.item.attr('default-title'), ui.item.attr('default-profile'));
                ui.item.remove();
              } else {
                console.log(ui.item.find('.crsQuestion').attr('id'), ui.item.parent().attr('id'), ui.item.index());
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
            }
          }).disableSelection();

          jQuery(window).scroll(function() {
            var yOffset = jQuery(window).scrollTop();
            var elementlist = jQuery('.waypoint1').offset().top;
            if (yOffset - elementlist > 0) {
              $('.elements-list').css('position', 'fixed');
            }
            else {
              $('.elements-list').css('position', 'relative');
            }
          });
        }, 500);
      }
    };
  });
