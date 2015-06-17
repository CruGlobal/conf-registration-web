'use strict';

angular.module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant() {

    var blockVisibleRuleCheck = function(block, registrant){
      var returnValue = true;
      var answers = registrant.answers;
      angular.forEach(block.rules, function(rule){
        var answer = _.find(answers, {blockId: rule.parentBlockId});
        if(angular.isUndefined(answer)){
          returnValue = false;
        }else{
          if(rule.operator === '=' && answer.value !== rule.value) {
            returnValue = false;
          }else if(rule.operator === '!=' && answer.value === rule.value){
            returnValue = false;
          }else if(rule.operator === '>' && answer.value <= rule.value){
            returnValue = false;
          }else if(rule.operator === '<' && answer.value >= rule.value){
            returnValue = false;
          }
        }
      });

      return returnValue;
    };

    var blockInRegistrantType = function(block, registrant){
      return !_.contains(block.registrantTypes, registrant.registrantTypeId);
    };

    this.blockVisible = function(block, registrant){
      return blockVisibleRuleCheck(block, registrant) && blockInRegistrantType(block, registrant);
    };

    this.validate = function(conference, registrant) {
      var invalidBlocks = [];
      conference = angular.copy(conference);

      angular.forEach(_.flatten(conference.registrationPages, 'blocks'), function(block){
        if (!block.required || !blockVisibleRuleCheck(block, registrant) || !blockInRegistrantType(block, registrant)) { return; }

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
