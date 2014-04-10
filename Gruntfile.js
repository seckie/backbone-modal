module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      coffee: {
        main: {
          options: {},
          files: {
            'modal.js': '_coffee/*.coffee'
          }
        }
      },
      compass: {
        options: {
          httpPath: '/backbone-modal/',
          sassDir: '_scss',
          cssDir: 'css',
          imagesDir: 'img',
          relativeAssets: true
        },
        dev: {
          options: {
            environment: "development",
            outputStyle: 'compact',
            noLineComments: true,
            assetCacheBuster: false
          }
        }
      },
      jshint: {
        main: [ 'modal.js' ]
      },
      copy: {
        main: {
          files: [
            {
              expand: true,
              cwd: 'bower_components/jquery/dist/',
              src: [ 'jquery.min.js' ],
              dest: 'js/'
            },
            {
              expand: true,
              cwd: 'bower_components/jquery-1.11.0/',
              src: [ 'index.js' ],
              dest: 'js/'
            },
            {
              expand: true,
              cwd: 'bower_components/underscore/',
              src: [ 'underscore.js' ],
              dest: 'js/'
            },
            {
              expand: true,
              cwd: 'bower_components/backbone/',
              src: [ 'backbone.js' ],
              dest: 'js/'
            }
          ]
        }
      },
      rename: {
        main: {
          files: [
            {
              src: [ 'js/index.js' ],
              dest: 'js/jquery-1.11.0.min.js'
            }
          ]
        }
      },
      watch: {
        coffee: {
          files: [ '_coffee/*.coffee' ],
          tasks: [ 'coffee' ]
        },
        scss: {
          files: [ '_scss/*.scss' ],
          tasks: [ 'compass:dev' ]
        },
        js: {
          files: [ 'modal.js' ],
          tasks: [ 'jshint' ]
        }
      }
  });

  grunt.registerTask('default', [ 'coffee', 'compass:dev', 'watch' ]);
  grunt.registerTask('deploy', [ 'copy', 'rename', 'coffee', 'compass:dev' ]);
};
