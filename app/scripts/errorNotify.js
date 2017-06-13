import rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: '599d1830feff45dbb2f03f366e03eab3',
  ignoredMessages: ["undefined is not an object (evaluating '__gCrWeb.autofill.extractForms')"],
  captureUncaught: true,
  captureUnhandledRejections: false,
  payload: {
    environment: location.hostname
  },
  enabled: location.hostname  !== 'localhost'
};

new rollbar(rollbarConfig);
