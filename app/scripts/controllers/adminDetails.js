'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDetailsCtrl', function ($scope, $timeout, Model, registrations, conference) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);
  });
