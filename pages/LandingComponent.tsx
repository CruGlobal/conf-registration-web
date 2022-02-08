import angular from 'angular';
import { angular2react } from 'angular2react';

import 'app/scripts/main';
// eslint-disable-next-line angular/document-service
angular.bootstrap(document, ['confRegistrationWebApp']);

const LandingComponent = angular2react(
  'landingComponent',
  {}, // angular2react only uses this for bindings. If bindings are needed, this config will need to be shared with/copied from the AngularJS component definition
);

export default LandingComponent;
