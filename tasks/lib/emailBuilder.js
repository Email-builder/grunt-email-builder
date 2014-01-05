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

}

EmailBuilder.taskName         = 'emailBuilder',
EmailBuilder.taskDescription  = 'Compile Files';
EmailBuilder.Defaults         = {}


EmailBuilder.prototype.run = function(grunt) {

  var options = this.options,
      done = this.task.async();

  this.task.files.forEach(function(file) {
      // Do something to some files...
 
      // Print a success message.
      grunt.log.writeln('File "' + file.dest + '" created.');
  });
  
  async.eachSeries(this.task.files, function(file, next){

    var html = grunt.file.read(file.src),
        basepath  = process.cwd(),
        date  = grunt.template.today('yyyy-mm-dd'),
        $ = cheerio.load(html),
        $title = $('title').text() + date || date,
        $styleLinks = $('link'),
        $styleTags = $('style'),
        $doctype = $._root.children[0].data, 
        srcFiles = [],
        embeddedCss = '',
        extCss = '';
        

    // link tags
    $styleLinks.each(function(i, link){
      var $this = $(this),
          target = $this.attr('href'),
          map = {
            file: target,
            inline: $this.attr('data-ignore') ? false : true
          };

      srcFiles.push(map);
      $this.remove(); 
    });

    // style tags
    $styleTags.each(function(i, element){
      var $this = $(this);

      if(!$this.attr('data-ignore')){
        embeddedCss += $this.text();
        $this.remove();
      }
    });
    
    // Set to target file path to get css
    grunt.file.setBase(path.dirname(file.src));

    async.eachSeries(srcFiles, function(srcFile, nextFile){
      var css = grunt.file.read(srcFile.file);


      if(srcFile.inline){
        extCss += css;
      }else{
        $('head').append('<style>' + css + '</style>');
      }

      nextFile();

    }, function(err){
      if(err) { grunt.log.error(err); }
      
      var html = $.html(),
          allCss = embeddedCss + extCss,
          output = allCss ? juice.inlineContent(html, allCss) : html;

      // Encode special characters if option encodeSpecialChars is true    
      if(options.encodeSpecialChars === true) { 
        output = encode.htmlEncode(output); 
      }

      // If doctype options is true, preserve doctype or add HTML5 doctype since jsdom removes it
      if(options.doctype === true) {
        if($doctype.trim().length){
          output = '<' + $doctype + '>' + output;
        }else {
          output = '<!DOCTYPE html>' + output;
        }
      }

      // Set cwd back to root folder    
      grunt.file.setBase(basepath);

      grunt.log.writeln('Writing...'.cyan);
      grunt.file.write(file.dest, output);
      grunt.log.writeln('File ' + file.dest.cyan + ' created.');
      
      if (options.litmus) {

        this.litmus();

      } else {

        next();

      }
      
    });

  }, function(){
    done();
  });

}

EmailBuilder.prototype.litmus = function() {

  var litmus = new Litmus(this.options.litmus);

  // If subject is set but is empty set it to $title
  if(options.litmus.subject.trim().length === 0) { 
    options.litmus.subject = $title; 
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