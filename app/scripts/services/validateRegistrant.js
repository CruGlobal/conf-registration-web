angular
  .module('confRegistrationWebApp')
  .service('validateRegistrant', function validateRegistrant(
    $window,
    ruleTypeConstants,
    $filter,
  ) {
    const blockVisibleRuleCheck = (block, registrant, ruleType) => {
      const answers = registrant.answers;
      let ruleOperand = '';
      let validRuleCount = 0;
      let blockTypeSpecificRules = [];

      switch (ruleType) {
        case ruleTypeConstants.SHOW_QUESTION: {
          blockTypeSpecificRules = $filter('showQuestionFilter')(block.rules);
          ruleOperand =
            block.content && block.content.ruleoperand
              ? block.content.ruleoperand
              : 'AND';
          break;
        }
        case ruleTypeConstants.FORCE_SELECTION: {
          blockTypeSpecificRules = _.filter(block.rules, {
            ruleType: ruleType,
          });
          ruleOperand =
            block.content && block.content.forceSelectionRuleOperand
              ? block.content.forceSelectionRuleOperand
              : 'AND';
          break;
        }
        default: {
          if ($window.Rollbar) {
            $window.Rollbar.error(
              'blockVisibleRuleCheck was called with an unknown rule type: ',
              ruleType,
            );
          }
          ruleOperand = 'AND';
          break;
        }
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

      _.forEach(blockTypeSpecificRules, (rule, i) => {
        const answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          let answerValue;
          let ruleValue;
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

    const choiceVisibleRuleCheck = (block, choice, registrant, ruleType) => {
      const answers = registrant.answers;
      let ruleOperand = '';
      let validRuleCount = 0;
      let blockTypeSpecificRules = [];

      switch (ruleType) {
        case ruleTypeConstants.SHOW_OPTION: {
          blockTypeSpecificRules = _.filter(block.rules, {
            ruleType: ruleType,
            blockEntityOption: choice.value,
          });

          ruleOperand = choice.operand ? choice.operand : 'OR';
          break;
        }
        default: {
          if ($window.Rollbar) {
            $window.Rollbar.error(
              'choiceVisibleRuleCheck was called with an unknown rule type: ',
              ruleType,
            );
          }
          ruleOperand = 'AND';
          break;
        }
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

      _.forEach(blockTypeSpecificRules, (rule, i) => {
        const answer = _.find(answers, { blockId: rule.parentBlockId });
        if (angular.isDefined(answer) && answer.value !== '') {
          let answerValue;
          let ruleValue;
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

    const blockInRegistrantType = (block, registrant) => {
      return !_.includes(block.registrantTypes, registrant.registrantTypeId);
    };

    this.isAnyChoiceVisible = (block, registrant) => {
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

    this.blockVisible = (block, registrant, isAdmin) => {
      const visible =
        angular.isDefined(registrant) &&
        blockVisibleRuleCheck(
          block,
          registrant,
          ruleTypeConstants.SHOW_QUESTION,
        ) &&
        blockInRegistrantType(block, registrant) &&
        this.isAnyChoiceVisible(block, registrant);

      return block.adminOnly && !isAdmin ? false : visible;
    };

    this.choiceVisible = (block, choice, registrant) => {
      return (
        angular.isDefined(registrant) &&
        choiceVisibleRuleCheck(
          block,
          choice,
          registrant,
          ruleTypeConstants.SHOW_OPTION,
        )
      );
    };

    this.checkboxDisable = (block, registrant) => {
      return blockVisibleRuleCheck(
        block,
        registrant,
        ruleTypeConstants.FORCE_SELECTION,
      );
    };

    this.validate = (conference, registrant, page) => {
      let invalidBlocks = [];

      conference = angular.copy(conference);
      const blocks = page
        ? _.find(conference.registrationPages, { id: page }).blocks
        : _.flatten(_.map(conference.registrationPages, 'blocks'));

      _.map(blocks, block => {
        if (
          !block.required ||
          block.adminOnly ||
          !blockVisibleRuleCheck(
            block,
            registrant,
            ruleTypeConstants.SHOW_QUESTION,
          ) ||
          !blockInRegistrantType(block, registrant)
        ) {
          return;
        }

        let answer = _.find(registrant.answers, { blockId: block.id });
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
              this.isAnyChoiceVisible(block, registrant) &&
              (_.isEmpty(answer) || _.isEmpty(_.pickBy(answer)))
            ) {
              invalidBlocks.push(block.id);
              return;
            }
            break;
          case 'selectQuestion':
          case 'radioQuestion':
            if (
              this.isAnyChoiceVisible(block, registrant) &&
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
