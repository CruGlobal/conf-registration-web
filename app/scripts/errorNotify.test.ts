/**
 * @jest-environment-options {"url": "https://www.eventregistrationtool.com/"}
 */
import { loadRollbarConfig } from '../../__tests__/util/errorNotifyConfig';

const mockRollbar = jest.fn();
jest.mock('rollbar', () => mockRollbar);

describe('errorNotify', () => {
  it('reports to the endpoint when the build has a token and an endpoint', () => {
    const config = loadRollbarConfig(mockRollbar, {
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
    const config = loadRollbarConfig(mockRollbar, env);

    expect(config.enabled).toBe(false);
    expect(config).not.toHaveProperty('endpoint');
  });
});
