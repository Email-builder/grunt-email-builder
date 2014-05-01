/* jshint -W030,-W117 */

/*
 * grunt-EmailBuilder
 * https://github.com/yargalot/Email-Builder
 *
 * Copyright (c) 2013 Steven Miller
 * Licensed under the MIT license.
 */

 // Required modules
var juice     = require('juice'),
    path      = require('path'),
    cheerio   = require('cheerio'),
    async     = require('async'),
    mailer    = require('nodemailer'),
    encode    = require('./entityEncode'),
    Litmus    = require('./litmus'),
    transport = mailer.createTransport();


function EmailBuilder(task) {
  this.task     = task;
  this.options  = task.options(EmailBuilder.Defaults);
  this.basepath = process.cwd();
  this.done     = this.task.async();

}

EmailBuilder.taskName         = 'emailBuilder';
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {};


EmailBuilder.prototype.run = function(grunt) {

  var _that = this;


  async.eachSeries(this.task.files, function(file, next) {


    var fileData  = grunt.file.read(file.src),
        reDoctype = /<!doctype.*?>/gi;

    _that.doctype = fileData.match(reDoctype);

    // Cheerio Init
    var $           = _that.$  = cheerio.load(fileData),
        $styleTags  = $('style'),
        $styleLinks = $('link');

    // Read Css Files
    var srcFiles    = _that.getLinkTags($styleLinks),
        embeddedCss = _that.getStyleTags($styleTags),
        externalCss = _that.getExternalCss(srcFiles, file.src),
        allCss      = embeddedCss + externalCss;

    // Get file output ready
    var output      = allCss ? juice.inlineContent($.html(), allCss) : $.html();

    // Encode special characters if option encodeSpecialChars is true
    if (_that.options.encodeSpecialChars === true) {
      output = encode.htmlEncode(output);
    }

    if (_that.options.emailTest) {

      grunt.log.writeln('Sending test email to ' + _that.options.emailTest.email);

      var mailOptions = {
        from: _that.options.emailTest.email,
        to: _that.options.emailTest.email,
        subject: _that.options.emailTest.subject,
        text: '',
        html: output
      };

      transport.sendMail(mailOptions, function(error, response) {
          response.statusHandler.once("sent", function(data){
            console.log("Message was accepted by %s", data.domain);
            _that.writeFile(file.dest, output, next);
          });
      });

    } else {

      _that.writeFile(file.dest, output, next);

    }

  }, function() {

    _that.done();

  });
};


EmailBuilder.prototype.getExternalCss = function(files, fileSource) {

  var externalCss = '',
      grunt       = this.task.grunt,
      $           = this.$;

  // Set to target file path to get css
  grunt.file.setBase(path.dirname(fileSource));

  files.forEach(function(srcFile) {
    var css = grunt.file.read(srcFile.file);

    if(srcFile.inline) {
      externalCss += css;
    } else {
      $('head').append('<style>' + css + '</style>');
    }
  });

  // Set cwd back to root folder
  grunt.file.setBase(this.basepath);

  return externalCss;

};


EmailBuilder.prototype.getStyleTags = function(styleTags) {

  var $   = this.$,
      css = '';

  styleTags.each(function(i, element){
    var $this = $(this);

    if(!$this.attr('data-ignore')) {
      css += $this.text();
      $this.remove();
    }
  });

  return css;

};


EmailBuilder.prototype.getLinkTags = function(styleLinks) {

  var $            = this.$,
      linkedStyles = [];

  styleLinks.each(function(i, link) {
    var $this  = $(this),
        target = $this.attr('href'),
        map = {
          file: target,
          inline: $this.attr('data-ignore') ? false : true
        };

    linkedStyles.push(map);
    $this.remove();
  });

  return linkedStyles;

};

// If doctype options is true, preserve doctype or add HTML5 doctype since jsdom removes it
EmailBuilder.prototype.addDoctype = function(output) {

  var doctyped = '',
      dt       = this.doctype;

  if ( this.options.doctype !== false ) {

    if ( dt !== null ) {
      doctyped = dt[0] + output;
    } else {
      doctyped = '<!DOCTYPE html>' + output;
    }

  } else {
    doctyped = output;
  }

  return doctyped;

};

EmailBuilder.prototype.writeFile = function(fileDest, fileData, nextFile) {

  var grunt     = this.task.grunt,
      writeData = this.addDoctype(fileData);

  grunt.log.writeln('Writing...'.cyan);
  grunt.file.write(fileDest, writeData);
  grunt.log.writeln('File ' + fileDest.cyan + ' created.');

  if (this.options.litmus) {
    this.litmus(writeData, nextFile);
  } else {
    nextFile();
  }

};

EmailBuilder.prototype.litmus = function(emailData, next) {

  var litmus    = new Litmus(this.options.litmus),
      date      = this.task.grunt.template.today('yyyy-mm-dd'),
      subject   = this.options.litmus.subject,
      $         = this.$,
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

  litmus.run(emailData, subject.trim(), next);

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