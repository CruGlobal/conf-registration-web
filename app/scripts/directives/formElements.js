'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      link: function postLink(scope) {
        var newDragBlock = '';
        $('.connectedSortable').sortable({
          connectWith: '.connectedSortable',
          stop: function (event, ui) {
            if (newDragBlock !== '') {
              scope.insertBlock(newDragBlock, ui.item.parent().attr('id'), ui.item.index());
              ui.item.parent().find('li:last').remove();
            } else {
              scope.moveBlock(ui.item.find('.crsQuestion').attr('id'), ui.item.parent().attr('id'), ui.item.index());
            }
          }
        }).disableSelection();

        $('.crs-accordionSub li').draggable({
          connectToSortable: '.connectedSortable',
          helper: 'clone',
          revert: 'invalid',
          addClasses: false,
          appendTo: 'body',
          start: function () {
            newDragBlock = $(event.target).attr('id');
          },
          stop: function () {
            newDragBlock = '';
          }
        }).disableSelection();
      }
    };
  });
