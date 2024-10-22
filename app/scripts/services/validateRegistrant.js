import { allCountries } from 'country-region-data';

angular
  .module('confRegistrationWebApp')
  .service(
    'validateRegistrant',
    function validateRegistrant($window, ruleTypeConstants, $filter) {
      const blockVisibleRuleCheck = (
        block,
        registrant,
        ruleType,
        conference,
      ) => {
        const blocks = conference
          ? _.flatten(_.map(conference.registrationPages, 'blocks'))
          : undefined;

        let answers = registrant.answers;
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
          let answer = _.find(answers, { blockId: rule.parentBlockId });
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
            if (
              conference &&
              blockVisibleRuleCheck(
                _.find(blocks, { id: rule.parentBlockId }),
                registrant,
                ruleType,
                conference,
              )
            ) {
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
        let answers = registrant.answers;
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
          let answer = _.find(answers, { blockId: rule.parentBlockId });
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

        // If a block has no content choices because the user forgot to add them, automatically return false.
        if (!block.content.choices) {
          return false;
        }

        for (let i = 0, len = block.content.choices.length; i < len; i++) {
          if (this.choiceVisible(block, block.content.choices[i], registrant)) {
            return true;
          }
        }
        return false;
      };

      this.blockVisible = (block, registrant, isAdmin, conference) => {
        const visible =
          angular.isDefined(registrant) &&
          blockVisibleRuleCheck(
            block,
            registrant,
            ruleTypeConstants.SHOW_QUESTION,
            conference,
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

        _.forEach(blocks, (block) => {
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
              if (
                _.isEmpty(answer) ||
                _.isNull(
                  answer.match(
                    // pulled from https://github.com/jquense/yup/blob/acbb8b4f3c24ceaf65eab09abaf8e086a9f11a73/src/string.ts#L9
                    // eslint-disable-next-line no-control-regex
                    /^((([A-Za-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([A-Za-z|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([A-Za-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([A-Za-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([A-Za-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([A-Za-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/,
                  ),
                )
              ) {
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
            case 'campusQuestion':
              if (_.isEmpty(answer)) {
                invalidBlocks.push(block.id);
                return;
              }
              break;
            case 'addressQuestion':
              if (
                answer.country !== 'US' &&
                (_.isEmpty(answer.address1) ||
                  _.isEmpty(answer.city) ||
                  _.isEmpty(answer.country) ||
                  (allCountries.find((c) => c[1] === answer.country)[2].length >
                    1 &&
                    !allCountries
                      .find((c) => c[1] === answer.country)[2]
                      .map((r) => r[1])
                      .includes(answer.state)))
              ) {
                invalidBlocks.push(block.id);
                return;
              }
              if (
                answer.country === 'US' &&
                (_.isEmpty(answer.address1) ||
                  _.isEmpty(answer.state) ||
                  !allCountries[235][2]
                    .map((r) => r[1])
                    .includes(answer.state) ||
                  _.isEmpty(answer.city) ||
                  _.isEmpty(answer.zip) ||
                  _.isEmpty(answer.country))
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
    },
  );
