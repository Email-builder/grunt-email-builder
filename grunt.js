module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {}
    },
    EmailBuilder: {
      options: {
        litmus : {
          username : 'username',
          password : 'password',
          url : 'https://yoursite.litmus.com/emails.xml',
          applications : ['gmail', 'hotmail']
        }
      },
      files : {
        'html/email.html' : ['css/inline.css', 'css/style.css'],
        'html/email.html' : ['css/inline.css', 'css/style.css']
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'EmailBuilder');

};
