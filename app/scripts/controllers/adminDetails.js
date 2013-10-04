'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDetailsCtrl', function ($scope, $timeout, Model, conference) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);
    console.log(conference);
  });
