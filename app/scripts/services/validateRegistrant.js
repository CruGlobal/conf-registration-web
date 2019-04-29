angular
  .module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant(
    $window,
    ruleTypeConstants,
    $filter,
  ) {
    var blockVisibleRuleCheck = function(block, registrant, ruleType) {
      var answers = registrant.answers;
      var ruleOperand = '';
      var validRuleCount = 0;
      var blockTypeSpecificRules = [];

      if (ruleType === ruleTypeConstants.SHOW_QUESTION) {
        blockTypeSpecificRules = $filter('showQuestionFilter')(block.rules);
        ruleOperand =
          block.content && block.content.ruleoperand
            ? block.content.ruleoperand
            : 'AND';
      } else if (ruleType === ruleTypeConstants.FORCE_SELECTION) {
        blockTypeSpecificRules = _.filter(block.rules, { ruleType: ruleType });
        ruleOperand =
          block.content && block.content.forceSelectionRuleOperand
            ? block.content.forceSelectionRuleOperand
            : 'AND';
      } else {
        if ($window.Rollbar) {
          $window.Rollbar.error(
            'blockVisibleRuleCheck was called with an unknown rule type: ',
            ruleType,
          );
        }
        ruleOperand = 'AND';
      }

      if ($window.Rollbar && !_.isArray(blockTypeSpecificRules)) {
        $window.Rollbar.info(
          'Block rules value in blockVisibleRuleCheck, ruleType: ' +
            ruleType +
            ', typeof: ' +
            typeof blockTypeSpecificRules +
            ', JSON.stringify: ' +
            JSON.stringify(blockTypeSpecificRules),
        );
      }

      _.forEach(blockTypeSpecificRules, function(rule, i) {
        var answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          var answerValue;
          var ruleValue;
          if (angular.isObject(answer.value)) {
            //answer of checkboxquestion will be an object
            answerValue = angular.isDefined(answer.value[rule.value])
              ? answer.value[rule.value]
              : false;
            ruleValue = true;
          } else {
            //If string is a number, parse it as a float for numerical comparison
            answerValue = !isNaN(answer.value)
              ? parseFloat(answer.value)
              : answer.value;
            ruleValue = !isNaN(rule.value)
              ? parseFloat(rule.value)
              : rule.value;
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
        if (
          (ruleOperand === 'OR' && validRuleCount > 0) ||
          (ruleOperand === 'AND' && validRuleCount <= i)
        ) {
          return false; // Exit lodash foreach as we found a case which determines the whole outcome of this function
        }
      });

      return (
        !blockTypeSpecificRules ||
        blockTypeSpecificRules.length === 0 || // If no rules are set
        (ruleOperand === 'OR' && validRuleCount > 0) ||
        (ruleOperand === 'AND' &&
          validRuleCount === blockTypeSpecificRules.length)
      );
    };

    var choiceVisibleRuleCheck = function(block, choice, registrant, ruleType) {
      var answers = registrant.answers;
      var ruleOperand = '';
      var validRuleCount = 0;
      var blockTypeSpecificRules = [];

      if (ruleType === ruleTypeConstants.SHOW_OPTION) {
        blockTypeSpecificRules = _.filter(block.rules, {
          ruleType: ruleType,
          blockEntityOption: choice.value,
        });
        ruleOperand = choice.operand ? choice.operand : 'OR';
      } else {
        if ($window.Rollbar) {
          $window.Rollbar.error(
            'choiceVisibleRuleCheck was called with an unknown rule type: ',
            ruleType,
          );
        }
        ruleOperand = 'AND';
      }

      if ($window.Rollbar && !_.isArray(blockTypeSpecificRules)) {
        $window.Rollbar.info(
          'Block rules value in blockVisibleRuleCheck, ruleType: ' +
            ruleType +
            ', typeof: ' +
            typeof blockTypeSpecificRules +
            ', JSON.stringify: ' +
            JSON.stringify(blockTypeSpecificRules),
        );
      }

      _.forEach(blockTypeSpecificRules, function(rule, i) {
        var answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          var answerValue;
          var ruleValue;
          if (angular.isObject(answer.value)) {
            //answer of checkboxquestion will be an object
            answerValue = angular.isDefined(answer.value[rule.value])
              ? answer.value[rule.value]
              : false;
            ruleValue = true;
          } else {
            //If string is a number, parse it as a float for numerical comparison
            answerValue = !isNaN(answer.value)
              ? parseFloat(answer.value)
              : answer.value;
            ruleValue = !isNaN(rule.value)
              ? parseFloat(rule.value)
              : rule.value;
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
        if (
          (ruleOperand === 'OR' && validRuleCount > 0) ||
          (ruleOperand === 'AND' && validRuleCount <= i)
        ) {
          return false; // Exit lodash foreach as we found a case which determines the whole outcome of this function
        }
      });

      return (
        !blockTypeSpecificRules ||
        blockTypeSpecificRules.length === 0 || // If no rules are set
        (ruleOperand === 'OR' && validRuleCount > 0) ||
        (ruleOperand === 'AND' &&
          validRuleCount === blockTypeSpecificRules.length)
      );
    };

    this.blockInRegistrantType = function(block, registrant) {
      return !_.includes(block.registrantTypes, registrant.registrantTypeId);
    };

    this.isAnyChoiceVisible = function(block, registrant) {
      if (
        block.type !== 'checkboxQuestion' &&
        block.type !== 'selectQuestion' &&
        block.type !== 'radioQuestion'
      ) {
        return true;
      }

      for (let i = 0, len = block.content.choices.length; i < len; i++) {
        if (this.choiceVisible(block, block.content.choices[i], registrant)) {
          return true;
        }
      }
      return false;
    };

    this.blockVisible = function(block, registrant, isAdmin) {
      let visible =
        angular.isDefined(registrant) &&
        blockVisibleRuleCheck(
          block,
          registrant,
          ruleTypeConstants.SHOW_QUESTION,
        ) &&
        this.blockInRegistrantType(block, registrant) &&
        this.isAnyChoiceVisible(block, registrant);

      return block.adminOnly && !isAdmin ? false : visible;
    };

    this.choiceVisible = function(block, choice, registrant) {
      return (
        angular.isDefined(registrant) &&
        choiceVisibleRuleCheck(
          block,
          choice,
          registrant,
          ruleTypeConstants.SHOW_OPTION,
        ) &&
        this.blockInRegistrantType(block, registrant)
      );
    };

    this.checkboxDisable = function(block, registrant) {
      return blockVisibleRuleCheck(
        block,
        registrant,
        ruleTypeConstants.FORCE_SELECTION,
      );
    };

    this.validate = function(conference, registrant, page) {
      var invalidBlocks = [];
      conference = angular.copy(conference);
      var blocks = page
        ? _.find(conference.registrationPages, { id: page }).blocks
        : _.flatten(_.map(conference.registrationPages, 'blocks'));
      var that = this;
      angular.forEach(blocks, function(block) {
        if (
          !block.required ||
          block.adminOnly ||
          !blockVisibleRuleCheck(
            block,
            registrant,
            ruleTypeConstants.SHOW_QUESTION,
          ) ||
          !that.blockInRegistrantType(block, registrant)
        ) {
          return;
        }

        var answer = _.find(registrant.answers, { blockId: block.id });
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
            if (_.isEmpty(answer) || _.isNull(answer.match(/^.+@.+$/))) {
              //Contains an @ sign surrounded by at least one character
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
            if (
              _.isNull(answer) ||
              _.isNull(answer.match(/^(\D*\d\D*){10,15}$/))
            ) {
              //Contains 10-15 digits
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'checkboxQuestion':
            if (
              that.isAnyChoiceVisible(block, registrant) &&
              (_.isEmpty(answer) || _.isEmpty(_.pickBy(answer)))
            ) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'selectQuestion':
          case 'radioQuestion':
            if (
              that.isAnyChoiceVisible(block, registrant) &&
              _.isEmpty(answer)
            ) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'addressQuestion':
            if (
              _.isEmpty(answer.address1) ||
              _.isEmpty(answer.state) ||
              _.isEmpty(answer.city) ||
              _.isEmpty(answer.zip)
            ) {
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
