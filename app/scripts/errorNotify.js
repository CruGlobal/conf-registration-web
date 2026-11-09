import rollbar from 'rollbar';
import { environmentName } from './utils/hostEnvironment';

const accessToken = process.env.ROLLBAR_ACCESS_TOKEN;
const endpoint = process.env.ROLLBAR_ENDPOINT;

// The build bakes in where reports go. A build without both the token and the
// endpoint, like a laptop or a pull request check, gets a notifier that never
// sends anything.
const reporting =
  Boolean(accessToken && endpoint) && location.hostname !== 'localhost';

const rollbarConfig = {
  accessToken,
  ...(reporting ? { endpoint } : {}),
  ignoredMessages: [
    "undefined is not an object (evaluating '__gCrWeb.autofill.extractForms')",
  ],
  scrubFields: ['creditCard'],
  scrubTelemetryInputs: true,
  captureUncaught: true,
  captureUnhandledRejections: false,
  payload: {
    environment: environmentName(location.hostname),
    client: {
      javascript: {
        // The deploy uploads the source maps for this version, and the error
        // tracker applies them to each report's stack trace.
        code_version: process.env.GIT_COMMIT_SHA,
        source_map_enabled: true,
      },
    },
  },
  enabled: reporting,
};

export const Rollbar = new rollbar(rollbarConfig);

// Attach the logged-in user to Rollbar items; pass null to clear on logout
export const updateRollbarPerson = (person) => {
  Rollbar.configure({
    payload: {
      person: person || {},
    },
  });
};
