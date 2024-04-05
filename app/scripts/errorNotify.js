import rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  ignoredMessages: [
    "undefined is not an object (evaluating '__gCrWeb.autofill.extractForms')",
  ],
  scrubFields: ['creditCard'],
  captureUncaught: true,
  captureUnhandledRejections: false,
  payload: {
    environment: location.hostname,
  },
  enabled: location.hostname !== 'localhost',
};

export const Rollbar = new rollbar(rollbarConfig);
