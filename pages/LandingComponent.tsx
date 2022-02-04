import angular from 'angular';
import { angular2react } from 'angular2react';

import '../app/scripts/main';
// @ts-ignore
import landingTemplate from 'views/landing.html';

const LandingComponentConfig = {
  controller: 'landingCtrl',
  templateUrl: landingTemplate,
};

angular
  .module('confRegistrationWebApp')
  .component('landingComponent', LandingComponentConfig);

const LandingComponent = angular2react(
  'landingComponent',
  LandingComponentConfig,
);

export default LandingComponent;
