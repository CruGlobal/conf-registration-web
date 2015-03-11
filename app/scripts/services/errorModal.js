'use strict';

angular.module('confRegistrationWebApp')
  .factory('errorModal', function errorModalFactory($modal){
    var factory = {};
    factory.show = function(message){
      $modal.open({
        templateUrl: 'views/modals/errorModal.html',
        controller: 'genericModal',
        resolve: {
          data: function() {
            return message;
          }
        }
      });
    };
    return factory;
  });
