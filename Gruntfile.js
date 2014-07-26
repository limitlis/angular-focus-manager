module.exports = function (grunt) {

    var tasks = [
        'jshint',
        'ngmin',
        'uglify'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*\n' +
            '* <%= pkg.name %> <%= pkg.version %>\n' +
            '* Obogo (c) ' + new Date().getFullYear() + '\n' +
            '* https://github.com/webux/<%= pkg.filename %>\n' +
            '* License: MIT.\n' +
            '*/\n',
        wrapStart: '(function(){\n',
        wrapEnd: '\n}());\n',
        jshint: {
            // define the files to lint
            files: ['src/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    loopfunc: false
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*'],
                tasks: tasks,
                options: {
                    spawn: false,
                    debounceDelay: 1000,
                    atBegin: true
                }
            }
        },
        ngmin: {
            all: {
                src: [
                    'src/**/*.js'
                ],
                dest: './build/<%= pkg.filename %>.js'
            },
//            lite: {
//                src: [
//                    'src/ux.js',
//                    'src/utils.js',
//                    'src/helpers/*.js',
//                    'src/directives/element.js',
//                    'src/directives/group.js',
//                    'src/services/*.js'
//                ],
//                dest: './build/<%= pkg.filename %>-lite.js'
//            }
        },
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    exportAll: true,
                    banner: '<%= banner %><%= wrapStart %>',
                    footer: '<%= wrapEnd %>'
                },
                files: {
                    './build/<%= pkg.filename %>.js': ['./build/<%= pkg.filename %>.js'],
//                    './build/<%= pkg.filename %>-lite.js': ['./build/<%= pkg.filename %>-lite.js']
                }
            },
            build_min: {
                options: {
                    report: 'gzip',
                    wrap: '<%= pkg.packageName %>',
                    banner: '<%= banner %>'
                },
                files: {
                    './build/<%= pkg.filename %>.min.js': ['./build/<%= pkg.filename %>.js'],
//                    './build/<%= pkg.filename %>-lite.min.js': ['./build/<%= pkg.filename %>-lite.js']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-ngmin');

    grunt.registerTask('default', tasks);

};