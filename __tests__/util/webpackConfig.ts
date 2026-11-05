import { withEnv } from './withEnv';

// Build the config webpack.config.js returns, as `yarn build` would see it
// unless `env` says otherwise. The file reads the environment when it loads,
// so each call loads a fresh copy.
export const loadWebpackConfig = (
  env: Record<string, string | undefined> = {},
): any =>
  withEnv(
    {
      npm_lifecycle_event: 'build',
      NETLIFY: undefined,
      GIT_SHA: undefined,
      GITHUB_SHA: undefined,
      COMMIT_REF: undefined,
      ...env,
    },
    () => {
      let config;
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        config = require('../../webpack.config.js')();
      });
      return config;
    },
  );

export const findPlugins = (config: any, name: string): any[] =>
  config.plugins.filter((plugin: any) => plugin.constructor.name === name);

// The options the build passes to app/index.ejs.
export const indexPageOptions = (config: any) =>
  findPlugins(config, 'HtmlWebpackPlugin').find(
    (plugin) => plugin.userOptions.template === 'app/index.ejs',
  ).userOptions;
