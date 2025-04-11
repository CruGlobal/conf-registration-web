# Event Registration Tool (ERT) Web App

[![CI](https://github.com/CruGlobal/conf-registration-web/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/CruGlobal/conf-registration-web/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/CruGlobal/conf-registration-web/branch/master/graph/badge.svg)](https://codecov.io/gh/CruGlobal/conf-registration-web)
https://www.eventregistrationtool.com | https://stage.eventregistrationtool.com

## Development

### Setting up Node

First, make sure that you have a suitable version of Node.js. This project uses node v22.14.0. To check your node version, run `node --version`. If you don't have node v22.14.0 installed or a suitable version, the recommended way to install it is with [asdf](https://asdf-vm.com/), a development tool version manager.

```bash
# Install asdf and the node plugin
brew install asdf
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

# Integrate it with your shell
# ZSH shell integration is shown here, but for installation instructions for other shells, go to https://asdf-vm.com/guide/getting-started.html#_3-install-asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc

# IMPORTANT: Close that terminal tab/window and open another one to apply the changes to your shell configuration file

# Install the version of node defined in this project's .tool-versions file
asdf install nodejs

# Check that the node version is now 22.14.0
node --version
```

### Running the local server

If you haven't installed yarn, please install it here: https://yarnpkg.com/en/docs/install.
We use yarn over npm, as yarn for faster installs and to update the yarn lock file

```bash
# Install dependencies
yarn

# Start the server
yarn start
```

Open [`http://localhost:9000`](http://localhost:9000) with your browser to see the result.

### Development Tasks

- `yarn test` to run karma tests
- `yarn lint` to run eslint
- `yarn build` to generate minified output files. These files are output to `/dist`.
- `yarn build:analyze` to open a visualization of bundle sizes after building
- `yarn angular-gettext-extract` to extract strings to `languages/ert.pot` for translation

### Deployment

- Development should be done against `master`. Code merged to `master` will be deployed immediately to the production environment.
- The `staging` branch deploys immediately to the staging environment. You can hard reset the `staging` to whatever commit you want to deploy to stage or merge code into that branch.

### Adding dependencies

- Use `yarn add <package-name>` to install app dependencies
- Use `yarn add <package-name> --dev` to install tooling dependencies

### Localhost API

To run against an ERT API server running on your localhost,
edit https://github.com/CruGlobal/conf-registration-web/blob/master/app/scripts/app.js,
replacing https://api.stage.eventregistrationtool.com with http://localhost:8080 in the `vars.development.apiUrl`
property of the object passed to `envServiceProvider.config`.
