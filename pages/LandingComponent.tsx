import { angular2react } from 'angular2react';

import 'app/scripts/main-next';

const LandingComponent = angular2react(
  'landingComponent',
  {}, // angular2react only uses this for bindings. If bindings are needed, this config will need to be shared with/copied from the AngularJS component definition
);

export default LandingComponent;
