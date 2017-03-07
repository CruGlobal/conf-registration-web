'use strict';

(function () {
  // Do not redirect from localhost
  if (window.location.hostname === 'localhost') {
    return;
  }

  /*
   * Perform client-side redirection. The following hostname/protocol combinations must be redirected:
   * http://stage.eventregistrationtool.com --> https://stage.eventregistrationtool.com
   * http://www.eventregistrationtool.com --> https://www.eventregistrationtool.com
   * http://eventregistrationtool.com --> https://www.eventregistrationtool.com
   * https://eventregistrationtool.com --> https://www.eventregistrationtool.com
   */

  // Redirect from eventregistrationtool.com to www.eventregistrationtool.com
  var newHostname = window.location.hostname === 'eventregistrationtool.com' ? 'www.eventregistrationtool.com' : window.location.hostname;

  // Redirect from http to https
  var newOrigin = 'https://' + newHostname;

  // Navigate to the new origin if it changed
  if (newOrigin !== window.location.origin) {
    window.location.replace(newOrigin + window.location.pathname + window.location.search + window.location.hash);
  }
})();
