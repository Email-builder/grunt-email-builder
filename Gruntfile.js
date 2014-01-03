module.exports = function(grunt) {

  var testFiles = {
    'example/test/htmlTest.html'  : 'example/html/htmlTest.html',
    'example/test/htmlTest2.html' : 'example/html/htmlTest2.html'
  };

  //https://yoursite.litmus.com/emails/clients.xml
  var litmusClients = [
    'gmailnew',
    'ffgmailnew',
    'chromegmailnew',
    'hotmail',
    'outlookcom',
    'ol2003',
    'ol2007',
    'ol2010',
    'ol2011',
    'ol2013',
    'appmail6',
    'iphone5',
    'iphone4',
    'ipad3'
  ];

  // Project configuration.
  grunt.initConfig({
    watch: {
      files: [
        '<%= jshint.all %>',
        'example/html/*.html',
        'example/css/*.css',
      ],
      tasks: 'test'
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    nodeunit: {
      tests: ['test/*_test.js']
    },
    emailBuilder: {
      test : {
        options: {
          litmus : {
            subject: 'Custom subject line', // Optional, defaults to title of email + yyyy-mm-dd
            username : 'username',
            password : 'password',
            url      : 'https://yoursite.litmus.com',
            applications : litmusClients
          },
        },
        files : testFiles
      },
      produce : {
        files : testFiles
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Load Npm Tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Default task.
  grunt.registerTask('default', 'emailBuilder:produce');
  grunt.registerTask('test',    ['jshint', 'emailBuilder:produce', 'nodeunit']);
  grunt.registerTask('litmus',  ['jshint', 'emailBuilder:test',    'nodeunit']);

};
