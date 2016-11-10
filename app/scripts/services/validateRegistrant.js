'use strict';

angular.module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant($window, ruleTypeConstants, $filter) {

    var blockVisibleRuleCheck = function(block, registrant, ruleType){
      var answers = registrant.answers;
      var ruleOperand = '';
      var validRuleCount = 0;
      var blockTypeSpecificRules = [];

      if (ruleType === ruleTypeConstants.SHOW_QUESTION) {
        blockTypeSpecificRules = $filter('showQuestionFilter')(block.rules);
        ruleOperand = block.content && block.content.ruleoperand ? block.content.ruleoperand : 'AND';
      } else if (ruleType === ruleTypeConstants.FORCE_SELECTION) {
        blockTypeSpecificRules = _.filter(block.rules, { 'ruleType': ruleType });
        ruleOperand = block.content && block.content.forceSelectionRuleOperand ? block.content.forceSelectionRuleOperand : 'AND';
      } else {
        if($window.Rollbar){
          $window.Rollbar.error('blockVisibleRuleCheck was called with an unknown rule type: ', ruleType);
        }
        ruleOperand = 'AND';
      }

      if($window.Rollbar && !_.isArray(blockTypeSpecificRules)) {
        $window.Rollbar.info('Block rules value in blockVisibleRuleCheck, ruleType: ' + ruleType + ', typeof: ' + typeof(blockTypeSpecificRules) + ', JSON.stringify: ' + JSON.stringify(blockTypeSpecificRules));
      }

      _.forEach(blockTypeSpecificRules, function (rule, i) {
        var answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          var answerValue;
          var ruleValue;
          if (angular.isObject(answer.value)) {//answer of checkboxquestion will be an object                       
            answerValue = angular.isDefined(answer.value[rule.value]) ? answer.value[rule.value] : false;
            ruleValue = true;
          } else {
            //If string is a number, parse it as a float for numerical comparison
            answerValue = !isNaN(answer.value) ? parseFloat(answer.value) : answer.value;
            ruleValue = !isNaN(rule.value) ? parseFloat(rule.value) : rule.value;
          }        

          if (rule.operator === '=' && answerValue === ruleValue) {
            validRuleCount++;
          } else if (rule.operator === '!=' && answerValue !== ruleValue) {
            validRuleCount++;
          } else if (rule.operator === '>' && answerValue > ruleValue) {
            validRuleCount++;
          } else if (rule.operator === '<' && answerValue < ruleValue) {
            validRuleCount++;
          }
        }
        if ((ruleOperand === 'OR' && validRuleCount > 0) || (ruleOperand === 'AND' && validRuleCount <= i)) {
          return false; // Exit lodash foreach as we found a case which determines the whole outcome of this function
        }
      });

      return !blockTypeSpecificRules || blockTypeSpecificRules.length === 0 || // If no rules are set
        (ruleOperand === 'OR' && validRuleCount > 0) ||
        (ruleOperand === 'AND' && validRuleCount === blockTypeSpecificRules.length);
    };

    var blockInRegistrantType = function(block, registrant){
      return !_.contains(block.registrantTypes, registrant.registrantTypeId);
    };

    this.blockVisible = function(block, registrant, isAdmin){
      var visible = angular.isDefined(registrant) && blockVisibleRuleCheck(block, registrant, ruleTypeConstants.SHOW_QUESTION) && blockInRegistrantType(block, registrant);
      return (block.adminOnly && !isAdmin) ? false : visible;
    };

    this.checkboxDisable = function(block, registrant){
      return blockVisibleRuleCheck(block, registrant, ruleTypeConstants.FORCE_SELECTION);
    };

    this.validate = function(conference, registrant, page) {
      var invalidBlocks = [];
      conference = angular.copy(conference);
      var blocks = page ? _.find(conference.registrationPages, {id: page}).blocks : _.flatten(conference.registrationPages, 'blocks');

      angular.forEach(blocks, function(block){
        if (!block.required || block.adminOnly || !blockVisibleRuleCheck(block, registrant, ruleTypeConstants.SHOW_QUESTION) || !blockInRegistrantType(block, registrant)) { return; }

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
