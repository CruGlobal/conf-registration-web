'use strict';

angular.module('confRegistrationWebApp')
  .controller('RegisterCtrl', function ($scope, conference, $location) {
    $location.path('/register/' + conference.id + '/page/' + conference.pages[0].id);
  });
