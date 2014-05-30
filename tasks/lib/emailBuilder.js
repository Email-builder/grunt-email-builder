/* jshint -W030,-W117 */

/*
 * grunt-EmailBuilder
 * https://github.com/yargalot/Email-Builder
 *
 * Copyright (c) 2013 Steven Miller
 * Licensed under the MIT license.
 */

 // Required modules
var juice     = require('juice2'),
    path      = require('path'),
    cheerio   = require('cheerio'),
    async     = require('async'),
    mailer    = require('nodemailer'),
    encode    = require('./entityEncode'),
    Litmus    = require('./litmus'),
    when      = require('when'),
    fs        = require('fs'),
    transport = mailer.createTransport();


function EmailBuilder(task) {
  this.task     = task;
  this.options  = task.options(EmailBuilder.Defaults);
  this.done     = this.task.async();

}

EmailBuilder.taskName         = 'emailBuilder';
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {};


EmailBuilder.readFile = function(file){

  var map = {};
  return when.promise(function(resolve, reject, notify){
    fs.readFile(file, function(err, data){
      if(err){ reject(err); }
      map.originalHtml = data;
      map.file = file;
      resolve(map);
    });
  });
};


EmailBuilder.grabIgnoreStyles = function(map){
  var $ = cheerio.load(map.originalHtml.toString());
  var styles = $('style');
  map.ignoreStyles = '';
  styles.each(function(){
    var $this = $(this);
    if($this.attr('data-ignore')){
      map.ignoreStyles += $this.text();
    }
  });
  return when.resolve(map);
};

EmailBuilder.addIgnoreStyles = function(map){
  var closingHead = /(<\/head>)/g;
  map.finalHtml = map.finalHtml.replace(closingHead, '<style type="text/css">' + map.ignoreStyles + '</style>\n$1');
  return when.resolve(map);
};

EmailBuilder.writeFile = function(grunt, map, ctx){
  ctx.task.files.forEach(function(file, i, arr){

    var fileObj = ctx.task.files[i];

    if(fileObj.src.toString() === map.file){
      grunt.log.writeln('Writing...'.cyan);
      grunt.file.write(fileObj.dest, map.finalHtml);
      grunt.log.writeln('File ' + fileObj.dest.cyan + ' created.');

    }
  });

  return when.resolve(map);
};

EmailBuilder.prototype.inlineCss = function(map){

  var self = this;

  return when.promise(function(resolve, reject){
    juice(map.file, self.options ,function(err,html){
      if(err) { reject(err); }
      map.finalHtml = html;
      resolve(map);
    });
  });
};


EmailBuilder.prototype.sendLitmus = function(html) {

  var litmus    = new Litmus(this.options.litmus),
      date      = this.task.grunt.template.today('yyyy-mm-dd'),
      subject   = this.options.litmus.subject,
      $         = cheerio.load(html),
      $title    = $('title').text().trim(),
      files     = this.task.filesSrc,
      titleDups = {};

  if( (subject === undefined) || (subject.trim().length === 0) ){
    subject = $title;
  }

  // If no subject or title then set to date
  if(subject.trim().length === 0){
    subject = date;
  }

  // Add +1 if duplicate titles exists
  if(files.length > 1){

    if(titleDups[subject] === undefined){
      titleDups[subject] = [];
    }else{
      titleDups[subject].push(html);
    }
    
    if(titleDups[subject].length){
      subject = subject + ' - ' + parseInt(titleDups[subject].length + 1, 10);
    }

  }

  litmus.run(html, subject.trim());
};


EmailBuilder.prototype.sendEmailTest = function(grunt, html) {
  grunt.log.writeln('Sending test email to ' + this.options.emailTest.email);

  var mailOptions = {
    from: this.options.emailTest.email,
    to: this.options.emailTest.email,
    subject: this.options.emailTest.subject,
    text: '',
    html: html
  };

  transport.sendMail(mailOptions, function(error, response) {
      response.statusHandler.once("sent", function(data){
        console.log("Message was accepted by %s", data.domain);
      });
  });
};


EmailBuilder.prototype.run = function(grunt) {

  var self = this;

  when.map(this.task.filesSrc, function(data){
    return EmailBuilder.readFile(data)
      .with(self)
      .then(EmailBuilder.grabIgnoreStyles)
      .then(self.inlineCss)
      .then(EmailBuilder.addIgnoreStyles)
      .then(function(data){
        EmailBuilder.writeFile(grunt, data, self);
        return data;
      })
      .then(function(data){
        if(self.options.litmus){ self.sendLitmus(data.finalHtml); } 
        if(self.options.emailTest){ self.sendEmailTest(grunt, data.finalHtml); }
        return data;
      })
      .catch(function(err){ grunt.log.error(err); });
  });
  
};


EmailBuilder.registerWithGrunt = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask(EmailBuilder.taskName, EmailBuilder.taskDescription, function() {

    this.grunt = grunt;

    var task = new EmailBuilder(this);

    task.run(grunt);
  });
};


module.exports = EmailBuilder;