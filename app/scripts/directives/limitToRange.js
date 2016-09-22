'use strict';

angular.module('confRegistrationWebApp')
.directive("limitToRange", function () {
    return {
        scope: {
            "value": "=limitCurrentValue"
        },
        link: function (scope, element, attributes) {
            scope.$watch('value', function (newVal, oldVal) {
                if ((angular.isUndefined(newVal) && !angular.isUndefined(oldVal) && !angular.isUndefined(attributes.max))
                    || (!angular.isUndefined(newVal) && attributes.max && Number(newVal) > Number(attributes.max))) {
                    scope.value = "";
                } else if ((angular.isUndefined(newVal) && !angular.isUndefined(oldVal) && !angular.isUndefined(attributes.min))
                    || (!angular.isUndefined(newVal) && attributes.min != "" && Number(newVal) < Number(attributes.min))) {
                    scope.value = "";
                }
            }, true);
        }
    };
});