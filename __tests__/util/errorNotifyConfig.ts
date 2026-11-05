import { withEnv } from './withEnv';

const names = ['ROLLBAR_ACCESS_TOKEN', 'ROLLBAR_ENDPOINT', 'GIT_COMMIT_SHA'];

// webpack bakes these values into the bundle. In Jest, errorNotify.js reads
// them when it loads, so this loads a fresh copy with `env` set and returns
// the config it gave Rollbar. The calling test mocks 'rollbar' with
// `mockRollbar`.
export const loadRollbarConfig = (
  mockRollbar: jest.Mock,
  env: Record<string, string>,
) =>
  withEnv(
    {
      ...Object.fromEntries(names.map((name) => [name, undefined])),
      ...env,
    },
    () => {
      mockRollbar.mockClear();
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../../app/scripts/errorNotify');
      });
      expect(mockRollbar).toHaveBeenCalledTimes(1);
      return mockRollbar.mock.calls[0][0];
    },
  );
