'use strict';

angular.module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant() {

    this.validate = function(conference, registrant) {
      var invalidBlocks = [];
      conference = angular.copy(conference);

      //remove blocks not applicable to registrant type
      angular.forEach(conference.registrationPages, function(page) {
        var pageIndex = _.findIndex(conference.registrationPages, { 'id': page.id });
        angular.forEach(angular.copy(page.blocks), function (block) {
          if (_.contains(block.registrantTypes, registrant.registrantTypeId)) {
            _.remove(conference.registrationPages[pageIndex].blocks, function (b) {
              return b.id === block.id;
            });
          }
        });
      });

      angular.forEach(_.flatten(conference.registrationPages, 'blocks'), function(block){
        if (!block.required) { return; }

        var answer = _.find(registrant.answers, { 'blockId': block.id });
        if (angular.isUndefined(answer)) {
          invalidBlocks.push(block.id);
          return;
        }
        answer = answer.value;

        switch (block.type) {
          case 'nameQuestion':
            if (_.isEmpty(answer.firstName) || _.isEmpty(answer.lastName)) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'emailQuestion':
            if (_.isEmpty(answer) || _.isNull(answer.match(/^.+@.+$/))) { //Contains an @ sign surrounded by at least one character
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'numberQuestion':
            if (!_.isNumber(answer)) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'phoneQuestion':
            if (_.isNull(answer) || _.isNull(answer.match(/^(\D*\d\D*){10,15}$/))) { //Contains 10-15 digits
              invalidBlocks.push(block.id);
              return;
            }
            break;
          default:
            if(_.isEmpty(answer)){
              invalidBlocks.push(block.id);
              return;
            }
            break;
        }
      });

      return invalidBlocks;
    };
  });
