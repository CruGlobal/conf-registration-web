'use strict';

angular.module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant(util) {

    var blockVisibleRuleCheck = function (block, registrant) {
      var returnValue = true;
      var answers = registrant.answers;
      angular.forEach(block.rules, function (rule) {
        var answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isUndefined(answer) || answer.value === '') {
          returnValue = false;
        } else {
          if (rule.operator === '=' && answer.value !== rule.value) {
            returnValue = false;
          } else if (rule.operator === '!=' && answer.value === rule.value) {
            returnValue = false;
          } else if (rule.operator === '>' && answer.value <= rule.value) {
            returnValue = false;
          } else if (rule.operator === '<' && answer.value >= rule.value) {
            returnValue = false;
          }
        }
      });

      return returnValue;
    };

    var blockInRegistrantType = function (block, registrant) {
      return !_.contains(block.registrantTypes, registrant.registrantTypeId);
    };

    this.blockVisible = function (block, registrant, isAdmin) {
      var visible = angular.isDefined(registrant) && blockVisibleRuleCheck(block, registrant) && blockInRegistrantType(block, registrant);
      return (block.adminOnly && !isAdmin) ? false : visible;
    };

    this.validate = function (conference, registrant, page) {
      var invalidBlocks = [];
      conference = angular.copy(conference);
      var blocks = page ? _.find(conference.registrationPages, { id: page }).blocks : _.flatten(conference.registrationPages, 'blocks');

      angular.forEach(blocks, function (block) {
        var answer = _.find(registrant.answers, { 'blockId': block.id });

        if (!block.required || block.adminOnly || !blockVisibleRuleCheck(block, registrant) || !blockInRegistrantType(block, registrant)) {
          return;
        }

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
            if (!util.isNumber((answer))) {
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
            if (_.isEmpty(answer)) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
        }
      });

      return invalidBlocks;
    };

  });
