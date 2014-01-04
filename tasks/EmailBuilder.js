/*
 * grunt-EmailBuilder
 * https://github.com/yargalot/Email-Builder
 *
 * Copyright (c) 2013 Steven Miller
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {


  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  // Task Desciption
  var task_name         = 'emailBuilder',
      task_description  = 'Compile Files';

  // Required modules
  var juice     = require('juice'),
      path      = require('path'),
      cheerio   = require('cheerio'),
      async     = require('async'),
      encode    = require('./lib/entityEncode.js'),
      Litmus    = require('./lib/litmus.js');  

  grunt.registerMultiTask(task_name, task_description, function() {

    var options   = this.options(),
        basepath  = options.basepath,
        done      = this.async();
    
    async.eachSeries(this.files, function(file, next){

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
          var litmus = new Litmus(options.litmus);

          // If subject is set but is empty set it to $title
          if(options.litmus.subject.trim().length === 0) { 
            options.litmus.subject = $title; 
          }

          litmus.run(output, $title, next);
        } else {
          next();                    
        }
        
      });

    }, function(){
      done();
    });
  });

};
