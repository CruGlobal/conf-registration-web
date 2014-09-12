'use strict';

angular.module('confRegistrationWebApp')
  .service('RegistrationsViewService', function RegistrationsViewService(ConferenceHelper, U) {

    this.getTable = function (conference, registrations, onlyCompleted) {

      var table = [];
      var header = getHeader(conference);
      table.push(header);
      var rows = getRows(conference, registrations, onlyCompleted);

      // sort rows by last name
      U.sortArrayByIndex(rows, _.findIndex(header, function (string) {
        return angular.equals(string, 'Last');
      }));

      table.push.apply(table, rows);

      return table;
    };

    var getHeader = function (conference) {
      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      // header row of block titles
      var header = getBlockTitles(blocks);

      return header;
    };

    var getRows = function (conference, registrations, onlyCompleted) {
      var rows = [];

      var blocks = ConferenceHelper.getPageBlocks(conference.registrationPages);

      // rows of answers
      ConferenceHelper.getRegistrations(registrations, onlyCompleted).forEach(function (registration) {
        angular.forEach(registration.registrants, function(r) {
          var row = [];

          angular.forEach(blocks, function (block) {
            var answer = ConferenceHelper.findAnswerByBlockId(r.answers, block.id);
            var content = ConferenceHelper.getContentByBlockType(U.isEmpty(answer) ? answer : answer.value, block.type);
            row.push.apply(row, content);
          });

          rows.push(row);
        });
      });

      return rows;
    };

    var getBlockTitles = function (blocks) {
      var titles = [];

      angular.forEach(blocks, function (block) {
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
          titles.push(block.title);
        }
      });

      return titles;
    };
  });
