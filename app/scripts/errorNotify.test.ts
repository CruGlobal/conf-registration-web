/**
 * @jest-environment-options {"url": "https://www.eventregistrationtool.com/"}
 */

const mockRollbar = jest.fn();
jest.mock('rollbar', () => mockRollbar);

const names = ['ROLLBAR_ACCESS_TOKEN', 'ROLLBAR_ENDPOINT', 'GIT_COMMIT_SHA'];
const saved = names.map((name) => process.env[name]);

// webpack bakes these values into the bundle. Here they are read at import, so
// each test sets them and loads a fresh copy of the module.
const loadConfig = (env: Record<string, string>) => {
  names.forEach((name) => delete process.env[name]);
  Object.assign(process.env, env);
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('./errorNotify');
  });
  expect(mockRollbar).toHaveBeenCalledTimes(1);
  return mockRollbar.mock.calls[0][0];
};

describe('errorNotify', () => {
  afterEach(() => {
    names.forEach((name, index) => {
      if (saved[index] === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = saved[index];
      }
    });
  });

  it('reports to the endpoint when the build has a token and an endpoint', () => {
    const config = loadConfig({
      ROLLBAR_ACCESS_TOKEN: 'example-token',
      ROLLBAR_ENDPOINT: 'https://errors.example.com/api/1/item/',
      GIT_COMMIT_SHA: '0123456789abcdef0123456789abcdef01234567',
    });

    expect(config.enabled).toBe(true);
    expect(config.accessToken).toBe('example-token');
    expect(config.endpoint).toBe('https://errors.example.com/api/1/item/');
    expect(config.payload.environment).toBe('production');
    expect(config.payload.client.javascript.code_version).toBe(
      '0123456789abcdef0123456789abcdef01234567',
    );
  });

  it.each([
    ['only a token', { ROLLBAR_ACCESS_TOKEN: 'example-token' }],
    [
      'only an endpoint',
      { ROLLBAR_ENDPOINT: 'https://errors.example.com/api/1/item/' },
    ],
    ['empty values', { ROLLBAR_ACCESS_TOKEN: '', ROLLBAR_ENDPOINT: '' }],
    ['neither', {}],
  ])('sends nothing when the build has %s', (_, env) => {
    const config = loadConfig(env);

    expect(config.enabled).toBe(false);
    expect(config).not.toHaveProperty('endpoint');
  });
});
