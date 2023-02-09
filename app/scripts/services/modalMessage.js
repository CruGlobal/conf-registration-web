import genericModalTemplate from 'views/modals/genericModal.html';
import confirmModalTemplate from 'views/modals/confirmModal.html';

angular
  .module('confRegistrationWebApp')
  .factory(
    'modalMessage',
    function modalMessageFactory($rootScope, $q, $uibModal) {
      var factory = {};

      /*
      Usage:
      //Basic error message
      modalMessage.error('Error message');

      //Advanced error message with more options
      modalMessage.error({
          'title': 'Title of Modal',
          'message': 'Error Message (shown in body of modal)',
          'forceAction': true,
          'okString': 'Got it'
      });

      The title option defaults to Error

      The forceAction option is optional and, if set to true, disables clicking outside the modal or using the ESC key to close the modal
      */
      factory.error = function (options) {
        if ($rootScope.loginModalOpen) {
          return;
        }

        if (!_.isObject(options)) {
          //is message string instead of object
          options = { message: options };
        }
        _.defaults(options, {
          title: 'Error',
          message: '',
          forceAction: false,
          okString: 'Ok',
        });
        var scope = $rootScope.$new(true);
        scope.title = options.title;
        scope.message = options.message;
        scope.okString = options.okString;
        scope.isArray = _.isArray(options.message);

        var errorModalConfig = {
          templateUrl: genericModalTemplate,
          scope: scope,
        };
        if (options.forceAction) {
          errorModalConfig.backdrop = 'static';
          errorModalConfig.keyboard = false;
        }
        $uibModal.open(errorModalConfig);
      };

      /*
      Usage:
      //Basic info message
      modalMessage.info('Info message');

      //Advanced info message with more options
      modalMessage.info({
        'title': 'Title of Modal',
        'message': 'Info Message (shown in body of modal)',
        'forceAction': true,
        'okString': 'Got it'
      });

      Alias for modalMessage.error() with different default title. To be used to display something that is not meant to be an error. Functionality is identical for now.
      */
      factory.info = function (options) {
        if (!_.isObject(options)) {
          //is message string instead of object
          options = { message: options };
        }
        _.defaults(options, {
          title: 'Info',
        });
        factory.error(options);
      };

      /*
      Usage:
      modalMessage.confirm({
        'title': 'Modal Title',
        'question': 'Modal Description or Question',
        'yesString': 'Optional string for Yes btn',
        'noString': 'Optional string for No btn',
        'normalSize': true
      }).then(function(result){
        //yes actions
      },
      function(reason){
        //no actions
      });

      The modal size will be set to small unless the normalSize option is set to true. Default is false.
      */
      factory.confirm = function (options) {
        if ($rootScope.loginModalOpen) {
          return $q.reject();
        }

        _.defaults(options, {
          title: '',
          question: '',
          yesString: 'Yes',
          noString: 'No',
          normalSize: false,
        });
        var scope = $rootScope.$new(true);
        scope.title = options.title;
        scope.question = options.question;
        scope.yesString = options.yesString;
        scope.noString = options.noString;

        var confirmModalConfig = {
          templateUrl: confirmModalTemplate,
          scope: scope,
        };
        if (!options.normalSize) {
          confirmModalConfig.size = 'sm';
        }
        return $uibModal.open(confirmModalConfig).result;
      };

      return factory;
    },
  );
