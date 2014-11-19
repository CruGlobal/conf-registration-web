'use strict';

angular.module('confRegistrationWebApp')
  .service('U', function U() {

    this.joiner = function (input, separator) {
      if (angular.isArray(input)) {
        return input.join(separator);
      }
      return input;
    };

    this.getKeysWhere = function (object, value) {
      return _.keys(_.pick(object, function (val) {
        return val === value;
      }));
    };

    this.isEmpty = function (value) {
      return !(value || value === false);
    };

    this.getValue = function (string, value) {
      if (this.isEmpty(string)) {
        if (!this.isEmpty(value)) {
          return value.replace(/,/g, '');
        }
        return '';
      }
      if (_.isString(string)) {
        return string.replace(/,/g, '');
      } else {
        return string;
      }
    };

    this.stringifyArray = function (array, separator, string) {
      if (this.isEmpty(string)) {
        string = '';
      }

      if (array.length <= 0) {
        return '';
      }

      // assumes first element type identical to others
      if (!angular.isArray(array[0])) {
        return array.join(separator);
      }

      for (var i = 0; i < array.length; i++) {
        string += this.stringifyArray(array[i], separator, string)  + '\n';
      }

      return string;
    };

    this.getDate = function (dateTime) {
      var date = this.getValue(dateTime);
      if (!this.isEmpty(dateTime)) {
        date = new Date(dateTime);
      }
      return date;
    };

    this.sortArrayByIndex = function (array, index) {
      array.sort(function (a, b) {
        return ((a[index] < b[index]) ? -1 : ((a[index] > b[index]) ? 1 : 0));
      });
    };

    this.submitForm = function (path, params, method) {
      method = method || 'post';

      var form = document.createElement('form');

      form.setAttribute('method', method);
      form.setAttribute('action', path);
      form.setAttribute('enctype', 'multipart/form-data');

      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          var hiddenField = document.createElement('input');

          hiddenField.setAttribute('type', 'hidden');
          hiddenField.setAttribute('name', key);
          hiddenField.setAttribute('value', params[key]);

          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);

      form.submit();
    };
  }
)
;
