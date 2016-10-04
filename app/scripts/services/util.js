'use strict';

angular.module('confRegistrationWebApp')
    .factory('util', function util() {
        var service = {
            isUndefinedOrNull: function (obj) {
                return angular.isUndefined(obj) || obj === null || obj === 'null';
            },
            isNumber: function (val) {
                return val !== '' && !_.isNaN(val);
            }
        };
        return service;
    });