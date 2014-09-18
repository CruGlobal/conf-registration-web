'use strict';

angular.module('confRegistrationWebApp')
  .service('RegistrationsViewService', function RegistrationsViewService(ConferenceHelper, U) {

    this.getTable = function (conference, registrations, onlyCompleted, visibleBlockIds) {

      var table = [];
      var header = getHeader(conference, visibleBlockIds);
      table.push(header);
      var rows = getRows(conference, registrations, onlyCompleted, visibleBlockIds);

      // sort rows by last name
      U.sortArrayByIndex(rows, _.findIndex(header, function (string) {
        return angular.equals(string, 'Last');
      }));

      table.push.apply(table, rows);

      return table;
    };

    var getHeader = function (conference, visibleBlockIds) {
      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      // header row of block titles
      var header = getBlockTitles(blocks, visibleBlockIds);

      return header;
    };

    var getRows = function (conference, registrations, onlyCompleted, visibleBlockIds) {
      var rows = [];

      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      // rows of answers
      ConferenceHelper.getRegistrations(registrations, onlyCompleted).forEach(function (registration) {
        angular.forEach(registration.registrants, function (r) {
          var row = [];

          angular.forEach(blocks, function (block) {
            if (angular.isUndefined(visibleBlockIds) || _.indexOf(visibleBlockIds, block.id) > -1) {
              var answer = ConferenceHelper.findAnswerByBlockId(r.answers, block.id);
              var answerContent = ConferenceHelper.getContentByBlockType(U.isEmpty(answer) ? answer : answer.value, block.type);
              row.push.apply(row, answerContent);
            }
          });

          rows.push(row);
        });
      });

      return rows;
    };

    var getBlockTitles = function (blocks, visibleBlockIds) {
      var titles = [];

      angular.forEach(blocks, function (block) {
        if (angular.isUndefined(visibleBlockIds) || _.indexOf(visibleBlockIds, block.id) > -1) {
          if (block.type === 'nameQuestion') {
            titles.push('First');
            titles.push('Last');
          }
          else if (block.type === 'addressQuestion') {
            titles.push('Address1');
            titles.push('Address2');
            titles.push('City');
            titles.push('State');
            titles.push('Zip');
          }
          else {
            titles.push(block.title.replace(/,/g, ''));
          }
        }
      });
      return titles;
    };
  });
