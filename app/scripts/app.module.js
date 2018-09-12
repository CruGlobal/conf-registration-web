import angular from 'angular';
import ngRoute from 'angular-route';
import ngCookies from 'angular-cookies';
import ngSanitize from 'angular-sanitize';

import ngEnvironment from 'angular-environment';
import ngGettext from 'angular-gettext';
import ngMessages from 'angular-messages';
import uiBootstrap from 'angular-ui-bootstrap';
import 'bootstrap-sass/assets/javascripts/bootstrap/affix.js';
import 'bootstrap-sass/assets/javascripts/bootstrap/collapse.js';
import 'bootstrap-sass/assets/javascripts/bootstrap/tooltip.js';
import 'moment';
import 'moment-timezone';
import 'lodash';
import 'eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css';
import 'pickadate/lib/picker.js';
import 'pickadate/lib/picker.date.js';
import 'pickadate/lib/compressed/themes/default.css';
import 'pickadate/lib/compressed/themes/default.date.css';
import 'angular-environment/dist/angular-environment.js';
angular.module('colorpicker.module', []); // angular-wysiwyg requires this module but we aren't using the font color buttons so this is a mock
import 'angular-wysiwyg';
import uiTree from 'angular-ui-tree';
import 'scripts/errorNotify.js';


export default angular.module('confRegistrationWebApp', [
  ngRoute,
  ngCookies,
  ngSanitize,
  ngEnvironment,
  ngGettext,
  ngMessages,
  uiBootstrap,
  uiTree,
  'wysiwyg.module'
]).name;
