'use strict';

angular.module('confRegistrationWebApp')
  .controller('AdminDetailsCtrl', function ($scope, $timeout, Model, conference, ConfCache) {
    Model.subscribe($scope, 'conference', 'conferences/' + conference.id);

    //Update cache
    $scope.$watch('conference', function(conf) {
      if(angular.isDefined(conference)){
        ConfCache.update(conference.id, conf);
      }
    }, true);
  });
