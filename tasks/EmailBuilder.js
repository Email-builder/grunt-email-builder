/*
 * grunt-EmailBuilder
 * https://github.com/yargalot/Email-Builder
 *
 * Copyright (c) 2012 Steven Miller
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  var task_name = 'EmailBuilder',
      task_description = 'Compile Files',
      juice = require('juice'),
      http = require('http'),
      builder = require('xmlbuilder'),
      less = require('less'),
      jade = require('jade'),
      path = require('path'),
      cheerio = require('cheerio'),
      _ = grunt.utils._,
      helpers = require('grunt-lib-contrib').init(grunt);

  grunt.registerMultiTask(task_name, task_description, function() {

    var options = helpers.options(this),
        files = this.data.files,
        basepath = options.basepath,
        done = this.async();
    
    this.files = helpers.normalizeMultiTaskFiles(this.data, this.target); 

    grunt.util.async.forEachSeries(this.files, function(file, next) {

      var data = grunt.file.read(file.src),
          basename = path.basename(file.src,  '.html'),
          basepath = process.cwd();
      
      // HEYO sup jade
      if ( path.extname(file.src) === '.jade')  {
        var jadeOptions = {
              filename: file.src,
              pretty : true
            };

        var fn = jade.compile(data, jadeOptions),
            myArry = ['moo', 'boo', 'roo'],
            myObj = { foo: 'bar', woo:'loo' };

        data = fn({ myArry: myArry, myObj: myObj });    
      }

      var $ = cheerio.load(data),
          date = String(Math.round(new Date().getTime() / 1000)),
          title = $('title').text() + date;


      var srcFiles = [],
          inlineCss;

      $('link').each(function (i, elem) {
        var target = $(this).attr('href'),
            map = {
              file: target,
              inline : $(this).attr('data-placement') === 'style-tag' ? false : true
            }

        srcFiles.push(map);
        $(this).remove()
      });

      // Set to target file path to get css
      grunt.file.setBase(path.dirname(file.src))

      // Less Compilation
      grunt.util.async.forEachSeries(srcFiles, function(srcFile, nextFile) {
        var _that = $(this);

        if (srcFile.inline) {
          renderCss(srcFile.file, function(data) {
            inlineCss = data;
            nextFile()
          });
        } else {

          renderCss(srcFile.file, function(data) {
            $('head').append('<style>'+data+'</style>')
            nextFile()
          });
        }
      }, function(err) {

        var output = juice($.html(), inlineCss);

        grunt.log.writeln('Writing...'.cyan)
        console.log(output)

        //Reset to grunt directory
        grunt.file.setBase(basepath)
        grunt.file.write(file.dest, output)
        grunt.log.writeln('File ' + file.dest.cyan + ' created.')

        if (options.litmus) {

          var cm = require('child_process').exec,
              fs = require('fs');

          var command = sendLitmus(output, title);

          console.log(command)
          cm(command, function(err, stdout, stderr) {
            if (err || stderr) { console.log(err || stderr, stdout)}

            // Delete XML After being curl'd
            fs.unlinkSync('data.xml');
            next();
          });
        
        } else {
          next()
        }
      });
   
    }, function() {
      done()
    });

    function renderCss(input, callback) {

      var data = grunt.file.read(input);

      if ( path.extname(input) === '.less') {       
        var parser = new(less.Parser)({
          paths: [path.dirname(input)], // Specify search paths for @import directives
          filename: path.basename(input) // Specify a filename, for better error messages
        });

        parser.parse(data, function (err, tree) {
          if (err) { return console.error(err) }
          data = tree.toCSS(); // Minify CSS output
          callback(data);
        });
      } else {
        callback(data);
      }      
    }

    function sendLitmus(data, title) {
      // Write the data xml file to curl, prolly can get rid of this somehow.

      var xml = xmlBuild(data, title);  

      grunt.file.write('data.xml', xml);

      var username = options.litmus.username,
          password = options.litmus.password,
          accountUrl = options.litmus.url;

      var command = 'curl -i -X POST -u '+username+':'+password+' -H \'Accept: application/xml\' -H \'Content-Type: application/xml\' '+accountUrl+'/emails.xml -d @data.xml';

      return command;    
    }

    //Application XMl Builder
    function xmlBuild(data, title) {
      var xmlApplications = builder.create('applications').att('type', 'array');

      // Need underscore for this shit, for loops are dumb
      _.each(options.litmus.applications, function(app) {
        var item = xmlApplications.ele('application');
        item.ele('code', app);
      })

      //Build Xml to send off, Join with Application XMl
      var xml = builder.create('test_set')
        .importXMLBuilder(xmlApplications)
        .ele('save_defaults', 'false').up()
        .ele('use_defaults', 'false').up()
        .ele('email_source')
          .ele('body').dat(data).up()
          .ele('subject', title)
        .end({pretty: true});

      return xml;
    }

  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================


};
