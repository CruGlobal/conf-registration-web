conf-registration-web
=====================
[![Build Status](https://magnum.travis-ci.com/CruGlobal/conf-registration-web.svg?token=PvqerGdca9sUAJycadyP&branch=master)](https://magnum.travis-ci.com/CruGlobal/conf-registration-web)

https://www.eventregistrationtool.com

https://stage.eventregistrationtool.com

## Development Environment Setup
1. Install NodeJS. This will vary depending on your Operating System.
2. Run `npm install -g yo bower grunt-cli` in your terminal to install Yeoman, Bower, Grunt, and their dependencies.
3. Clone this repo and open a terminal in that folder.
4. Run `npm install` to install the command line tools.
5. Run `bower install` to install the web app dependencies.
6. Run `grunt server`. That command should open a browser and now you can code!

## To run against an ERT API server running on your localhost
1. Edit https://github.com/CruGlobal/conf-registration-web/blob/master/app/scripts/services/apiUrl.js,
  replacing https://api.stage.eventregistrationtool.com with http://localhost:9000
