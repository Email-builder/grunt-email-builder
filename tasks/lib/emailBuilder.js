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
    encode    = require('./entityEncode'),
    Litmus    = require('./litmus');  


function EmailBuilder(task) {

  this.task     = task;
  this.options  = task.options(EmailBuilder.Defaults);
  this.basepath = process.cwd();

  // Cheerio
  // ---------------
  this.$;
  this.$title;
  this.$doctype;
  this.$styleTags;
  this.$styleLinks;

  // Things that need to be thrown around
  // ---------------
  this.output;

}

EmailBuilder.taskName         = 'emailBuilder';
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {};


EmailBuilder.prototype.run = function(grunt) {

  var options = this.options;
  var _that   = this;

  this.task.files.forEach(function(file) {

    var fileData = grunt.file.read(file.src),
        date  = grunt.template.today('yyyy-mm-dd'),
        extCss = '';

    $           = cheerio.load(fileData);
    $title      = $('title').text() + date || date,
    $doctype    = $._root.children[0].data;
    $styleTags  = $('style');
    $styleLinks = $('link');

    var srcFiles    = _that.linkTags($styleLinks);
    var embeddedCss = _that.styleTags($styleTags);
    
    // Set to target file path to get css
    grunt.file.setBase(path.dirname(file.src));

    srcFiles.forEach(function(srcFile) {
      var css = grunt.file.read(srcFile.file);

      if(srcFile.inline) {
        extCss += css;
      } else {
        $('head').append('<style>' + css + '</style>');
      }
    });

    // Begin File prep

    var html = $.html(),
        allCss = embeddedCss + extCss;
        

    this.output = allCss ? juice.inlineContent(html, allCss) : html;

    // Encode special characters if option encodeSpecialChars is true    
    if(options.encodeSpecialChars === true) { 
      this.output = encode.htmlEncode(this.output); 
    }

    var writes = _that.docType(this.output);

    _that.writeFile(file.dest, writes);

  });
};

// If doctype options is true, preserve doctype or add HTML5 doctype since jsdom removes it
EmailBuilder.prototype.docType = function(output) {

  var doctyped = '';

  if ( this.options.doctype === true ) {
    
    if ( $doctype.trim().length ) {
      doctyped = '<' + $doctype + '>' + output;
    } else {
      doctyped = '<!DOCTYPE html>' + output;
    }

  }

  return doctyped;

};


EmailBuilder.prototype.styleTags = function(styleTags) {

  var css = '';

  styleTags.each(function(i, element){
    var $this = $(this);

    if(!$this.attr('data-ignore')) {
      css += $this.text();
      $this.remove();
    }
  });


  return css;

};


EmailBuilder.prototype.linkTags = function(styleLinks) {

  var linkedStyles = [];

  styleLinks.each(function(i, link) {
    var $this = $(this),
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


EmailBuilder.prototype.writeFile = function(fileDest, output) {

  var grunt = this.task.grunt;

  // Set cwd back to root folder   
  grunt.file.setBase(this.basepath);

  grunt.log.writeln('Writing...'.cyan);
  grunt.file.write(fileDest, output);
  grunt.log.writeln('File ' + fileDest.cyan + ' created.');

  if (this.options.litmus) {
    this.litmus(output);
  }

};

EmailBuilder.prototype.litmus = function(emailData) {

  var litmus = new Litmus(this.options.litmus);

  // If subject is set but is empty set it to $title
  if(this.options.litmus.subject.trim().length === 0) { 
    this.options.litmus.subject = $title; 
  }

  litmus.run(emailData, $title);

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