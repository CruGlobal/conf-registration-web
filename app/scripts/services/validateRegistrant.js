'use strict';

angular.module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant() {

    var blockVisibleRuleCheck = function (block, registrant) {
      var answers = registrant.answers;
      var ruleOperand = block.content && block.content.ruleoperand ? block.content.ruleoperand : 'AND';
      var validRuleCount = 0;

      for (var i = 0; i < block.rules.length; i++) {
        var rule = block.rules[i];
        var answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          if (rule.operator === '=' && answer.value === rule.value) {
            validRuleCount++;
          } else if (rule.operator === '!=' && answer.value !== rule.value) {
            validRuleCount++;
          } else if (rule.operator === '>' && answer.value > rule.value) {
            validRuleCount++;
          } else if (rule.operator === '<' && answer.value < rule.value) {
            validRuleCount++;
          }
        }
        if (ruleOperand === 'OR' && validRuleCount > 0) {
          break;
        }
      }

      if (block.rules.length == 0 || // If no rules are set
        (ruleOperand === 'OR' && validRuleCount > 0) ||
        (ruleOperand === 'AND' && validRuleCount === block.rules.length)) {
        return true;
      } else {
        return false;
      }
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
        if (!block.required || block.adminOnly || !blockVisibleRuleCheck(block, registrant) || !blockInRegistrantType(block, registrant)) { return; }

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
