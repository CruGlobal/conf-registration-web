module.exports = function(config){
  config.set({
    basePath : '',

    files : [
      'app/bower_components/lodash/dist/lodash.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',
      'app/scripts/*.js',
      'app/scripts/**/*.js'
      // 'test/mock/**/*.js',
      //'test/spec/**/*.js'
    ],

    exclude : [

    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Firefox'],

    plugins : [
      //'karma-junit-reporter',
      //'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine'
    ]
  })}