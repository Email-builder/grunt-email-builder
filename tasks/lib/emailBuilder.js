/* jshint -W030,-W117 */

/*
 * grunt-email-builder
 * https://github.com/Email-builder/grunt-email-builder
 *
 * Copyright (c) 2015 Steven Miller
 * Copyright (c) 2015 Jeremy Peter
 * 
 * Licensed under the MIT license.
 */

var Promise   = require('bluebird'),
    EmailBuilderCore = require('email-builder-core');
    

function EmailBuilder(task) {
  this.task     = task;
  this.options  = task.options(EmailBuilder.Defaults);
  this.grunt    = this.task.grunt;
}

EmailBuilder.taskName         = 'emailBuilder';
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {};


/**
* Write final html output to file  
*
* @param {Object} map - object map  
* @property {String} map.dest - destination file
* @property {String} map.html - final html 
*
* @returns {String} final html to be passed to next promise 
* 
*/

EmailBuilder.prototype.writeFile = function(dest, html) {

  this.grunt.log.writeln('Writing...'.cyan);
  this.grunt.file.write(dest, html);
  this.grunt.log.writeln('File ' + dest.cyan + ' created.');

  return html;
};



/**
* Run task
*
* @param {Object} grunt - grunt object   
*
* @returns {Object} a promise that resolves with final html
* 
*/

EmailBuilder.prototype.run = function() {

  var files = Promise.resolve(this.task.files);
  var builder = new EmailBuilderCore(this.options);

  return files
    .bind(this)
    .map(function(fileMap){

      var srcFile  = fileMap.src[0];
      var destFile = fileMap.dest;
      
      return builder.inlineCss(srcFile)
        .bind(this)
        .then(builder.sendLitmusTest)
        .then(builder.sendEmailTest)
        .then(function(html){
          this.writeFile(destFile, html);
        })
        .catch(function(err){
          this.grunt.log.error(err);
        });

    })
    .catch(function(err){ this.grunt.log.error(err); });
};


EmailBuilder.registerWithGrunt = function(grunt) {

  grunt.registerMultiTask(EmailBuilder.taskName, EmailBuilder.taskDescription, function() { 

    this.grunt = grunt;
    var done = this.async();
    var task = new EmailBuilder(this);

    task.run()
      .done(done);

  });
};


module.exports = EmailBuilder;