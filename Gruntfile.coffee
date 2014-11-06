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
      litmusTest:
        files :  "example/test/all.html": "example/html/all.html"
        options:
          encodeSpecialChars: true
          litmus :
            subject: 'Custom subject line' # Optional, defaults to title of email or yyyy-mm-dd if title or options.subject empty
            username : 'username'
            password : 'password'
            url      : 'https://yoursite.litmus.com'
            applications : litmusClients

      email:
        files :  "example/test/all.html": "example/html/all.html"
        options:
          emailTest :
            email : 'steven.jmiller@gmail.com'
            subject : 'something'

      inlineCss :
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
  grunt.registerTask 'default', 'emailBuilder:inlineCss'
  grunt.registerTask 'test',   ['jshint', 'clean', 'emailBuilder:inlineCss', 'nodeunit']
  grunt.registerTask 'litmus', ['jshint', 'clean', 'emailBuilder:inlineCss', 'emailBuilder:litmusTest', 'nodeunit']
  grunt.registerTask 'email',  ['jshint', 'clean', 'emailBuilder:inlineCss', 'emailBuilder:sendEmail', 'nodeunit']


testFiles = [
  expand: true
  cwd: 'example/html'
  src: ['*.html'],
  dest: 'example/dest/'
]

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

