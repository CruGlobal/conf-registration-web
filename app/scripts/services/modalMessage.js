'use strict';

angular.module('confRegistrationWebApp')
  .factory('modalMessage', function modalMessageFactory($rootScope, $modal){
    var factory = {};

    /*
     Usage:
     modalMessage.error('Error Message', false, 'Title', 'Optional string for Ok btn');

     The forceAction parameter is optional and, if set to true, disables clicking outside the modal or using the ESC key to close the model

     The title parameter is optional and defaults to Error
     */
    factory.error = function(message, forceAction, title, okString){
      if(title === undefined){
        title = 'Error';
      }
      if(okString === undefined){
        okString = 'Ok';
      }
      var scope = $rootScope.$new(true);
      scope.title = title;
      scope.message = message;
      scope.okString = okString;
      scope.isArray = _.isArray(message);

      var errorModalConfig = {
        templateUrl: 'views/modals/genericModal.html',
        scope: scope
      };
      if(forceAction){
        errorModalConfig.backdrop = 'static';
        errorModalConfig.keyboard =  false;
      }
      $modal.open(errorModalConfig);
    };

    /*
     Usage:
     modalMessage.info('Info Message', false, 'Title', 'Optional string for Ok btn');

     Alias for modalMessage.error() with different default title. To be used to display something that is not meant to be an error. Functionality is identical for now.
     */
    factory.info = function(message, forceAction, title, okString){
      if(title === undefined){
        title = 'Info';
      }
      factory.error(message, forceAction, title, okString);
    };

    /*
     Usage:
     modalMessage.confirm('Model Title', 'Model Description or Question', 'Optional string for Yes btn', 'Optional string for No btn', true).then(function(result){
       //yes actions
     },
     function(reason){
       //no actions
     });

     If the optional normalSize parameter is not set to true, the modal size will be set to small
     */
    factory.confirm = function(title, question, yesString, noString, normalSize){
      if(yesString === undefined){
        yesString = 'Yes';
      }
      if(noString === undefined){
        noString = 'No';
      }
      var scope = $rootScope.$new(true);
      scope.title = title;
      scope.question = question;
      scope.yesString = yesString;
      scope.noString = noString;

      var confirmModalConfig = {
        templateUrl: 'views/modals/confirmModal.html',
        scope: scope
      };
      if(!normalSize) {
        confirmModalConfig.size = 'sm';
      }
      return $modal.open(confirmModalConfig).result;
    };

    return factory;
  });
