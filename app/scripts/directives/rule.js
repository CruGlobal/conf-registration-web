'use strict';

angular.module('confRegistrationWebApp')
    .directive('rule', function () {
        return {
            templateUrl: 'views/components/rule.html',
            restrict: 'E',
            scope: {
                ruleType: '@',
                ruleTypeMessage: '@',
                ruleOperandMessage: '@',
                block: '=',
                conference: '='
            },
            controller: function ($scope, modalMessage, uuid, validateRegistrant, ruleTypeConstants, $filter) {
                $scope.rule = {};
                $scope.rule.operand = '';

                //Initializing ruleoperand 
                if ($scope.ruleType === ruleTypeConstants.SHOW_QUESTION) {
                    $scope.rule.operand = $scope.block.content.ruleoperand;
                } else if ($scope.ruleType === ruleTypeConstants.FORCE_SELECTION) {
                    $scope.rule.operand = $scope.block.content.forceSelectionRuleOperand;
                }

                //setting ruleoperand value based on the rule type 
                $scope.setRuleOperand = function () {
                    if ($scope.ruleType === ruleTypeConstants.SHOW_QUESTION) {
                        $scope.block.content.ruleoperand = $scope.rule.operand;
                    } else if ($scope.ruleType === ruleTypeConstants.FORCE_SELECTION) {
                        $scope.block.content.forceSelectionRuleOperand = $scope.rule.operand;
                    }
                };

                //to get the rules by rule type
                $scope.getRulesByType = function (ruleType) {
                    if (ruleType === ruleTypeConstants.SHOW_QUESTION) {
                        return $filter('showQuestionFilter')($scope.block.rules);
                    } else if (ruleType === ruleTypeConstants.FORCE_SELECTION) {
                        return _.filter($scope.block.rules, { 'ruleType': ruleType });
                    } else {
                        return [];
                    }
                };

                $scope.addRule = function (ruleType) {
                    var ruleBlocks = $scope.ruleBlocks();
                    if (!ruleBlocks.length) {
                        modalMessage.info({
                            title: 'Add Rule',
                            message: 'No valid questions appear before this question in your form. Rule cannot be added.'
                        });
                        return;
                    }

                    $scope.block.rules.push({
                        id: uuid(),
                        blockId: $scope.block.id,
                        parentBlockId: ruleBlocks[0].id,
                        operator: '=',
                        value: '',
                        ruleType: ruleType
                    });
                };

                $scope.ruleBlocks = function () {
                    var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
                    //remove blocks after current block
                    var remove = false;
                    _.remove(blocks, function (b) {
                        if (b.id === $scope.block.id) {
                            remove = true;
                        }
                        return remove;
                    });

                    var questionTypes = ['checkboxQuestion', 'radioQuestion', 'selectQuestion', 'numberQuestion', 'dateQuestion', 'genderQuestion', 'yearInSchoolQuestion'];                    

                    //keep valid block types that can be used in rules
                    blocks = _.filter(blocks, function (b) {
                        return _.contains(questionTypes, b.type);
                    });

                    return blocks;
                };

                $scope.ruleValues = function (parentBlockId) {
                    var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
                    var block = _.find(blocks, { 'id': parentBlockId });

                    switch (block.type) {
                        case 'checkboxQuestion':
                        case 'selectQuestion':
                        case 'radioQuestion':
                            return _.pluck(block.content.choices, 'value');
                        case 'genderQuestion':
                            return ['M', 'F'];
                        case 'yearInSchoolQuestion':
                            return ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'];
                        case 'numberQuestion':
                            return block.content.range;
                        default:
                            return [];
                    }
                };

                $scope.getRangeValues = function (parentBlockId) {
                    var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
                    var block = _.find(blocks, { 'id': parentBlockId });

                    switch (block.type) {
                        case 'dateQuestion':
                            return block.content.range;
                        default:
                            return {};
                    }
                };

                $scope.removeRule = function (id) {
                    _.remove($scope.block.rules, { id: id });
                };

                $scope.ruleValueInputType = function (parentBlockId) {
                    var blocks = _.flatten(_.pluck($scope.conference.registrationPages, 'blocks'));
                    var parentBlock = _.find(blocks, { 'id': parentBlockId });

                    switch (parentBlock.type) {
                        case 'checkboxQuestion':
                        case 'selectQuestion':
                        case 'radioQuestion':
                        case 'yearInSchoolQuestion':
                            return 'select';
                        case 'genderQuestion':
                            return 'gender';
                        case 'dateQuestion':
                            return 'date';
                        case 'numberQuestion':
                            return 'number';
                    }
                };
            }
        };
    });
