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
