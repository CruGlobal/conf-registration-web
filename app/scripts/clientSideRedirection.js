// Do not redirect from localhost
if (window.location.hostname !== 'localhost') {
  /*
   * Perform client-side redirection. The following hostname/protocol combinations must be redirected:
   * https://eventregistrationtool.com --> https://www.eventregistrationtool.com
   *
   * http to https is handled by Cloudfront
   * We are redirecting to www here in order to prevent cookie sharing issues across domains, especially related to intendedRoute
   */

  // Redirect from eventregistrationtool.com to www.eventregistrationtool.com
  const newHostname =
    window.location.hostname === 'eventregistrationtool.com'
      ? 'www.eventregistrationtool.com'
      : window.location.hostname;

  // Redirect from http to https
  const newOrigin = 'https://' + newHostname;

  // Navigate to the new origin if it changed
  if (newOrigin !== window.location.origin) {
    window.location.replace(
      newOrigin +
        window.location.pathname +
        window.location.search +
        window.location.hash,
    );
  }
}
