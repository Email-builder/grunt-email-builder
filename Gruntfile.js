module.exports = function(grunt) {

  var testFiles = {
    'example/test/jadeTest.html' : 'example/jade/jadeTest.jade',
    'example/test/htmlTest.html' : 'example/html/htmlTest.html'
  }

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
    emailBuilder: {
      test :{
        options: {
          litmus : {
            username : 'username',
            password : 'password',
            url : 'https://yoursite.litmus.com',
            //https://yoursite.litmus.com/emails/clients.xml
            applications : ['gmailnew', 'hotmail', 'outlookcom', 'ol2000', 'ol2002', 'ol2003', 'ol2007', 'ol2010','ol2011', 'ol2013', 'appmail6','iphone3', 'iphone4', 'ipad3']
          },
        },
        files : testFiles
      },
      produce :{
        files : testFiles
      }
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');

  // Default task.
  grunt.registerTask('default', 'emailBuilder:produce');
  grunt.registerTask('test', 'emailBuilder:test');

};
