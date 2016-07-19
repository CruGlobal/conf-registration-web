// Generated on 2013-06-27 using generator-angular 0.3.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      styles: {
        files: ['<%= yeoman.app %>/less/*.less'], // which files to watch
        tasks: ['less:dev'],
        options: {
          spawn: false
        }
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.app %>/**/*.html',
          '{.tmp,<%= yeoman.app %>}/css/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        // Change this to 'localhost' to deny access to the server from outside.
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '<%= yeoman.app %>/scripts/{,*/}*.js',
        '!<%= yeoman.app %>/scripts/errorNotify.js',
        'test/spec/{,*/}*.js'
      ]
    },
    less: {
      dist: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          '.tmp/css/style.css': '<%= yeoman.app %>/less/style.less',
          '<%= yeoman.dist %>/css/style.css': '<%= yeoman.app %>/less/style.less'
        }
      },
      dev: {
        files: {
          // target.css file: source.less file
          '.tmp/css/style.css': '<%= yeoman.app %>/less/style.less'
        }
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/components/**/*.css',
            '<%= yeoman.dist %>/css/{,*/}*.css',
            '<%= yeoman.dist %>/views/{,*/}*.html',
            '<%= yeoman.dist %>/img/{,*/}*.png'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/*.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: { steps: { 'js': ['concat'], 'css': ['concat']}, post: {}}
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/*.html', '<%= yeoman.dist %>/views/**/*.html'],
      js: ['<%= yeoman.dist %>/scripts/{,*/}*eventApp.js'],
      css: ['<%= yeoman.dist %>/css/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>'],
        patterns: {
          js: [
            [/(views\/.*?\.(?:html))/gm, 'Update view paths in JS']
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/img',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/img'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['views/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '*.html',
            '.htaccess',
            'bower_components/**/*',
            'components/**/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/img',
          dest: '<%= yeoman.dist %>/img',
          src: [
            'generated/*'
          ]
        }]
      }
    },
    concurrent: {
      server: [
        'less'
      ],
      dist: [
        'less:dist',
        'imagemin',
        'htmlmin'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    processhtml: {
      dist: {
        options: {
          strip: true
        },
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/index.html']
        }
      },
      stage: {
        options: {
          strip: true
        },
        files: {
          '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/index.html']
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      files: {
        expand: true,
        cwd: '<%= yeoman.dist %>/scripts',
        src: '*.js',
        dest: '<%= yeoman.dist %>/scripts'
      }
    },
    nggettext_extract: {
      pot: {
        files: {
          'languages/ert.pot': ['<%= yeoman.app %>/**/**.html', '<%= yeoman.app %>/scripts/controllers/*.js']
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    if (target === 'nobrowser') {
      return grunt.task.run([
        'clean:server',
        'concurrent:server',
        'connect:livereload',
        'watch'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', function (target) {
    if (target === 'stage') {
      return grunt.task.run([
        'jshint',
        'karma',

        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'copy',
        'rev',
        'usemin',
        //run rev & usemin twice to make sure any route view rev changes change eventApp.js rev number
        'rev',
        'usemin',
        'processhtml:stage',
        'uglify'
      ]);
    }else{
      return grunt.task.run([
        'jshint',
        'karma',

        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'concat',
        'copy',
        'rev',
        'usemin',
        //run rev & usemin twice to make sure any route view rev changes change eventApp.js rev number
        'rev',
        'usemin',
        'processhtml:dist',
        'uglify'
      ]);
    }
  });

  grunt.registerTask('gettext', function () {
    return grunt.task.run([
      'nggettext_extract'
    ]);
  });
};
