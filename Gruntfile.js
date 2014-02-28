module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
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
		watch: {
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

	grunt.registerTask('default', [ 'compass:dev', 'watch' ]);
	grunt.registerTask('deploy', [ 'copy', 'compass:dev' ]);
};
