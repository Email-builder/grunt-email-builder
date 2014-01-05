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

}

EmailBuilder.taskName         = 'emailBuilder',
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {}


EmailBuilder.prototype.run = function(grunt) {

  var options = this.options;

  this.task.files.forEach(function(file) {
    var html = grunt.file.read(file.src),
        date  = grunt.template.today('yyyy-mm-dd'),
        embeddedCss = '',
        extCss = '';

    this.$ = cheerio.load(html);
    
    this.$title       = this.$('title').text() + date || date,
    this.$doctype     = this.$._root.children[0].data;
    this.$styleTags   = this.$('style');
    this.$styleLinks  = this.$('link');

    var srcFiles = this.linkTags(this.$styleLinks);

    this.styleTags($styleTags);
    
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
        allCss = embeddedCss + extCss,
        output = allCss ? juice.inlineContent(html, allCss) : html;

    // Encode special characters if option encodeSpecialChars is true    
    if(options.encodeSpecialChars === true) { 
      output = encode.htmlEncode(output); 
    }

    this.doctype();

    this.writeFile();
    
    if (options.litmus) {
      this.litmus();
    }

  });
}

// If doctype options is true, preserve doctype or add HTML5 doctype since jsdom removes it
EmailBuilder.prototype.docType = function() {


  if(options.doctype === true) {
    if($doctype.trim().length){
      output = '<' + $doctype + '>' + output;
    }else {
      output = '<!DOCTYPE html>' + output;
    }
  }
}


EmailBuilder.prototype.styleTags = function(styleTags) {

  styleTags.each(function(i, element){
    var $this = $(this);

    if(!$this.attr('data-ignore')) {
      embeddedCss += $this.text();
      $this.remove();
    }
  });

}


EmailBuilder.prototype.linkTags = function(styleLinks) {

  var linkedStyles = []

  styleLinks.each(function(i, link){
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

}


EmailBuilder.prototype.writeFile = function() {

  // Set cwd back to root folder   
  grunt.file.setBase(this.basepath);

  grunt.log.writeln('Writing...'.cyan);
  grunt.file.write(file.dest, output);
  grunt.log.writeln('File ' + file.dest.cyan + ' created.');

}

EmailBuilder.prototype.litmus = function() {

  var litmus = new Litmus(this.options.litmus);

  // If subject is set but is empty set it to $title
  if(this.options.litmus.subject.trim().length === 0) { 
    this.options.litmus.subject = $title; 
  }

  litmus.run(output, $title, next);

}


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