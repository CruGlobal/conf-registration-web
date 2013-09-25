'use strict';

angular.module('confRegistrationWebApp')
  .directive('formElements', function () {
    return {
      restrict: 'A',
      controller: function ($rootScope, $scope) {
      },
      link: function postLink(scope, element) {
          var newDragBlock = '';
          $( ".connectedSortable" ).sortable({
            connectWith: ".connectedSortable",
            stop: function( event, ui ) {
              if(newDragBlock != ''){
                console.log('add block', newDragBlock, ui.item.parent().attr('id'),  ui.item.index());
                scope.insertBlock(newDragBlock, ui.item.parent().attr('id'), ui.item.index());
                ui.item.parent().find('li:last').remove();
              }else{
                console.log('move block', ui.item.find('.crsQuestion').attr('id'), ui.item.parent().attr('id'),  ui.item.index());
                scope.moveBlock(ui.item.find('.crsQuestion').attr('id'), ui.item.parent().attr('id'), ui.item.index());
              }
            }
          }).disableSelection();

        $(".crs-accordionSub li").draggable({
          connectToSortable: ".connectedSortable",
          helper: "clone",
          revert: "invalid",
          addClasses: false,
          appendTo: "body",
          start: function( event, ui ) {
            newDragBlock = $(event.target).attr("id");
          },
          stop: function( event, ui ) {
            newDragBlock = '';
          }
        }).disableSelection();
      }
    };
  });
