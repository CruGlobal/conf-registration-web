
angular.module('confRegistrationWebApp')
    .filter('showQuestionFilter', function (ruleTypeConstants) {
        return function (rules) {
            return _.filter(rules, function (rule) {
                return angular.isUndefined(rule.ruleType) || rule.ruleType === null || rule.ruleType === '' || rule.ruleType === ruleTypeConstants.SHOW_QUESTION;
            });
        };
    });
