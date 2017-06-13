# Event Registration Tool (ERT) Web App
[![Build Status](https://travis-ci.org/CruGlobal/conf-registration-web.svg?branch=master)](https://travis-ci.org/CruGlobal/conf-registration-web) [![codecov](https://codecov.io/gh/CruGlobal/conf-registration-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/conf-registration-web)
https://www.eventregistrationtool.com | https://stage.eventregistrationtool.com

## Development

### Installing yarn
Use yarn for faster installs and to update the yarn lock file: https://yarnpkg.com/en/docs/install

### Install & Run

1. `yarn` or `npm install`
2. `yarn start` or `npm start`
3. Browse to [`http://localhost:9000`](http://localhost:9000)

### Development Tasks

- `yarn run test` or `npm run test` to run karma tests
- `yarn run lint` or `npm run lint` to run eslint
- `yarn run build` or `npm run build` to generate minified output files. These files are output to `/dist`.
- `yarn run build:analyze` or `npm run build:analyze` to open a visualization of bundle sizes after building
- `yarn run angular-gettext-extract` or `npm run angular-gettext-extract` to extract strings to `languages/ert.pot` for translation

### Adding dependencies

- Use `yarn add <package-name>` or `npm install <package-name> --save` to install app dependencies
- Use `yarn add <package-name> -dev` `npm install <package-name> --save-dev` to install tooling dependencies

### Localhost API 

To run against an ERT API server running on your localhost,
edit https://github.com/CruGlobal/conf-registration-web/blob/master/app/scripts/app.js,
replacing https://api.stage.eventregistrationtool.com with http://localhost:8080 in the `vars.development.apiUrl`
property of the object passed to `envServiceProvider.config`.
