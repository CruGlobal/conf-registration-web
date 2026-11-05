import hostnames from './hostnames.json';

// One build serves staging and production, so anything that differs between
// them is decided in the browser from the hostname. index.ejs gets the same
// production list from webpack.config.js, so the page and the bundle agree.

export const isProductionHostname = (hostname: string): boolean =>
  hostnames.production.includes(hostname);

// The environment that error reports name. The two deployed sites use the
// pipeline's names. Any other host, like localhost or a preview, reports its
// own hostname, as every host did before.
export const environmentName = (hostname: string): string => {
  if (isProductionHostname(hostname)) {
    return 'production';
  }
  if (hostnames.staging.includes(hostname)) {
    return 'staging';
  }
  return hostname;
};

// The envService environment, which picks the API and the payment processor's
// mode. It uses the same whole-hostname match as the rest of this file, so only
// a production host can reach the production API. Any host it doesn't know,
// such as a new subdomain or a raw CloudFront domain, gets the staging API.
export type ApiEnvironment =
  | 'production'
  | 'staging'
  | 'preview'
  | 'development';

export const apiEnvironment = (hostname: string): ApiEnvironment => {
  if (isProductionHostname(hostname)) {
    return 'production';
  }
  if (hostnames.staging.includes(hostname)) {
    return 'staging';
  }
  if (hostname.endsWith('.netlify.app')) {
    return 'preview';
  }
  return 'development';
};
