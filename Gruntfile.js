module.exports = function (grunt) {

    var tasks = [
        'jshint',
        'ngAnnotate',
        'replace',
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
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
//                commit: false,
//                commitMessage: 'Release v%VERSION%',
//                commitFiles: ['package.json'],
//                createTag: false,
//                tagName: 'v%VERSION%',
//                tagMessage: 'Version %VERSION%',
//                push: false,
//                pushTo: 'upstream',
//                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        ngAnnotate: {
            build: {
                files: {
                    './build/<%= pkg.filename %>.js': [
                        'src/consts.js',
                        'src/**/*.js'
                    ]
                }
            }
        },
        replace: {
            "build": {
                options: {
                    patterns: [
                        {
                            match: 'moduleName',
                            replacement: '<%= pkg.packageName %>'
                        }
                    ]
                },
                files: [
                    {
                        src: ['./build/<%= pkg.filename %>.js'],
                        dest: './build/<%= pkg.filename %>.js'
                    },
                    {
                        src: ['./build/<%= pkg.filename %>.min.js'],
                        dest: './build/<%= pkg.filename %>.min.js'
                    }
                ]
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: 'some',
                    beautify: true,
                    exportAll: true,
                    banner: '<%= banner %>',
                    wrap: '<%= pkg.packageName %>'
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
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('default', tasks);
    grunt.registerTask('bump', ['bump']);

};