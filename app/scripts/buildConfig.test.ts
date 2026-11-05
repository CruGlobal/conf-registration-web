/**
 * @jest-environment node
 */
import {
  findPlugins,
  indexPageOptions,
  loadWebpackConfig,
} from '../../__tests__/util/webpackConfig';
import hostnames from './utils/hostnames.json';

describe('webpack.config.js', () => {
  it('bakes in GIT_SHA from the image build as the commit sha', () => {
    const config = loadWebpackConfig({ GIT_SHA: 'a', GITHUB_SHA: 'b' });
    const [environment] = findPlugins(config, 'EnvironmentPlugin');

    expect(environment.defaultValues.GIT_COMMIT_SHA).toBe('a');
  });

  it('falls back to GITHUB_SHA outside the image build', () => {
    const config = loadWebpackConfig({ GITHUB_SHA: 'b' });
    const [environment] = findPlugins(config, 'EnvironmentPlugin');

    expect(environment.defaultValues.GIT_COMMIT_SHA).toBe('b');
  });

  it('leaves error reporting off unless the build is given its values', () => {
    const [environment] = findPlugins(loadWebpackConfig(), 'EnvironmentPlugin');

    expect(environment.defaultValues.ROLLBAR_ACCESS_TOKEN).toBe('');
    expect(environment.defaultValues.ROLLBAR_ENDPOINT).toBe('');
  });

  it('gives the page the production hostnames', () => {
    expect(indexPageOptions(loadWebpackConfig()).productionHostnames).toEqual(
      hostnames.production,
    );
  });

  it.each([
    ['a build', {}, 'hidden-source-map'],
    ['a Netlify build', { NETLIFY: 'true' }, 'source-map'],
    ['the dev server', { npm_lifecycle_event: 'start' }, 'source-map'],
  ])('picks the source map style for %s', (_, env, devtool) => {
    expect(loadWebpackConfig(env).devtool).toBe(devtool);
  });
});
