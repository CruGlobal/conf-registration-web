module.exports = function(config){
  config.set({
    basePath : '',

    files : [
      //'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',

      'app/bower_components/moment/moment.js',
      'app/bower_components/moment-timezone/builds/moment-timezone-with-data.js',
      'app/bower_components/lodash/dist/lodash.js',
      'app/bower_components/ng-facebook/ngFacebook.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',
      'app/bower_components/angular-ui-tree/dist/angular-ui-tree.js',
      'app/bower_components/angular-environment/dist/angular-environment.js',
      'app/components/angular-wysiwyg-custom.js',
      'app/bower_components/angular-gettext/dist/angular-gettext.js',

      'app/scripts/*.js',
      'app/scripts/**/*.js',
      'test/spec/**/*.js'
    ],

    exclude : [
      'app/scripts/errorNotify.js'
    ],

    //autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ]
  })}