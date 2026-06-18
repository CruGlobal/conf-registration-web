import rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  ignoredMessages: [
    "undefined is not an object (evaluating '__gCrWeb.autofill.extractForms')",
  ],
  scrubFields: ['creditCard'],
  scrubTelemetryInputs: true,
  captureUncaught: true,
  captureUnhandledRejections: false,
  payload: {
    environment: location.hostname,
  },
  enabled: location.hostname !== 'localhost',
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
