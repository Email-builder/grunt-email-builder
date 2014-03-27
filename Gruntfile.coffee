module.exports = (grunt) ->

  grunt.initConfig

    # Watch task
    watch:
      files: [
        '<%= jshint.all %>',
        'example/html/*.html',
        'example/css/*.css',
      ]
      tasks: 'test'

    # JS Hint task
    jshint:
      options:
        jshintrc: '.jshintrc'

      all: [
        'tasks/**/*.js'
        '<%= nodeunit.tests %>'
      ]


    # JS Tests
    nodeunit:
      tests: ['test/*_test.js']

    # Clean out the test files
    clean: ['example/test']

    emailBuilder:
      test:
        options:
          encodeSpecialChars: true
          litmus :
            subject: 'Custom subject line' # Optional, defaults to title of email or yyyy-mm-dd if title or options.subject empty
            username : 'username'
            password : 'password'
            url      : 'https://yoursite.litmus.com'
            applications : litmusClients

          emailTest :
            email : 'steven.jmiller@gmail.com'
            subject : 'something'

        files : testFiles

      produce :
        files : testFiles
        options :
          encodeSpecialChars : true


  # Load local tasks.
  grunt.loadTasks 'tasks'

  # Load Npm Tasks
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-nodeunit'

  # Default task.
  grunt.registerTask 'default', 'emailBuilder:produce'
  grunt.registerTask 'test',      ['jshint', 'clean', 'emailBuilder:produce', 'nodeunit']
  grunt.registerTask 'litmus',    ['jshint', 'clean', 'emailBuilder:test', 'nodeunit']


testFiles =
  "example/test/htmlTest.html": "example/html/htmlTest.html"
  "example/test/htmlTest2.html": "example/html/htmlTest2.html"

# https://yoursite.litmus.com/emails/clients.xml
litmusClients = [
  'gmailnew'
  'ffgmailnew'
  'chromegmailnew'
  'hotmail'
  'outlookcom'
  'ol2003'
  'ol2007'
  'ol2010'
  'ol2011'
  'ol2013'
  'appmail6'
  'iphone5'
  'iphone4'
  'ipad3'
];

