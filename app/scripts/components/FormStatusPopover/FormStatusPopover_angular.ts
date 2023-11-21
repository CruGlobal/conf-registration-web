import angular from 'angular';
import { react2angular } from 'react2angular';
import { FormStatusPopover } from './FormStatusPopover';

angular
  .module('confRegistrationWebApp')
  .component('formStatusPopover', react2angular(FormStatusPopover, []));
