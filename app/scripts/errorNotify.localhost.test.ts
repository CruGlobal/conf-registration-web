/**
 * @jest-environment-options {"url": "http://localhost:9000/"}
 */
import { loadRollbarConfig } from '../../__tests__/util/errorNotifyConfig';

const mockRollbar = jest.fn();
jest.mock('rollbar', () => mockRollbar);

describe('errorNotify on localhost', () => {
  it('sends nothing even when the build has a token and an endpoint', () => {
    const config = loadRollbarConfig(mockRollbar, {
      ROLLBAR_ACCESS_TOKEN: 'example-token',
      ROLLBAR_ENDPOINT: 'https://errors.example.com/api/1/item/',
    });

    expect(config.enabled).toBe(false);
    expect(config).not.toHaveProperty('endpoint');
    expect(config.payload.environment).toBe('localhost');
  });
});
