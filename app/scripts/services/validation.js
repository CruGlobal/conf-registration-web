'use strict';

angular.module('confRegistrationWebApp')
  .factory('validation', function validation(){
    var factory = {};

    //Helper function that came from AngularJS source code
    function isEmpty(value) {
      return _.isUndefined(value) || value === '' || value === null || value !== value;
    }

    /*
     Usage:
     Create validator function by calling the appropriate factory in the form: genericValidators.<validator name>(options)
        Example: var requiredValidator = validation.genericValidators.required(true);
     Use the function returned by the factory and pass in a value to validate.
        Example: requiredValidator('')
            -> returns false

     Validators return true if valid and false if invalid.
     Most validators (excluding the required validator) return true if the value is empty so that an optional value is validated only if something is entered
     */
    factory.genericValidators = {
      required: function requiredFactory(isRequired) {
        return function (value) {
          if(isRequired){
            return !isEmpty(value) && value.toString().length > 0;
          }else{
            //If not required, then the field is valid according to this validator
            return true;
          }
        };
      },
      minLength: function minLengthFactory(length) {
        return function (value) {
          return isEmpty(value) || value.length >= length;
        };
      },
      maxLength: function maxLengthFactory(length) {
        return function (value) {
          return isEmpty(value) || value.length <= length;
        };
      },
      regex: function regexFactory(regex) {
        return function (value) {
          return isEmpty(value) || regex.test(value);
        };
      },
      email: function emailFactory() {
        return function (value) {
          //Regex came from AngularJS source code
          return factory.genericValidators.regex(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)(value);
        };
      },
      phone: function phoneFactory() {
        return function (value) {
          //Contains 10-15 digits
          return factory.genericValidators.regex(/^(\D*\d\D*){10,15}$/)(value);
        };
      },
      number: function numberFactory() {
        return function (value) {
          return isEmpty(value) || _.isFinite(value);
        };
      }
    };
    factory.validateBlock = function(block){
      return _.every(block.validators, function(validator){
        return validator();
      });
    };

    return factory;
  });
