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


  var fs = require('fs');

  grunt.registerTask('EmailBuilder', 'Your task description goes here.', function() {
    grunt.log.write(grunt.helper('EmailBuilder'));

    var helpers = require('grunt-lib-contrib').init(grunt);
    var options = helpers.options(this);
    var files = grunt.config('EmailBuilder.files');


    // this.files = helpers.normalizeMultiTaskFiles(this.data, this.target);

    console.log()

    var juice = require('juice'),
      http = require('http'),
      builder = require('xmlbuilder'),
      util = require('util'),
      jsdom = require('jsdom'),
      _ = require('underscore');
      
    // Js dom - Might use this to sniff out the style pathways for css. Gets title atm
    var document = jsdom.html(html),
        window = document.createWindow();

    // Shit we need to make shit work    
    var date = String(Math.round(new Date().getTime() / 1000)),
        html = read('example/html/email.html'),
        css = read('example/css/default.css'),
        output = juice(html, css),
        title = document.title+' '+date,
        username = 'username',
        password = 'password',
        applications = ['gmail', 'hotmail'],
        accountUrl = 'https://yoursite.litmus.com/emails.xml';

    //Override juice to produce document.innerHTML (github is more up to date for this? Rubbish!)
    // console.log(html);
    // console.log(output);

    // Make directory for email, put file up in t'hur
    fs.mkdir('email', function() {
      fs.writeFile('email/test.html', output, function (err) {
        if (err) throw err;
        // console.log('It\'s saved!');
      });
    })

    //Application XMl Builder
    var xmlApplications = builder.create('applications').att('type', 'array');

    // Need underscore for this shit, for loops are dumb
    _.each(applications,function(app) {
      var item = xmlApplications.ele('application');
      item.ele('code', app);
    })

    // console.log(xmlApplications.end({pretty: true}));

    //Build Xml to send off, Join with Application XMl
    var xml = builder.create('test_set')
      .importXMLBuilder(xmlApplications)
      .ele('save_defaults', 'false').up()
      .ele('use_defaults', 'false').up()
      .ele('email_source')
        .ele('body').dat(output).up()
        .ele('subject', title)
      .end({pretty: true});

    //console.log(xml);

    // Write the data xml file to curl, prolly can get rid of this somehow.
    fs.writeFile('data.xml', xml, function (err) {
      if (err) throw err;
      console.log('XML saved!');
    });

    // Curl to Litmus
    var exec = require('child_process').exec,
        command = 'curl -i -X POST -u '+username+':'+password+' -H \'Accept: application/xml\' -H \'Content-Type: application/xml\' '+accountUrl+' -d @data.xml';

    child = exec(command, function(error, stdout, stderr){
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);

      if(error !== null) console.log('exec error: ' + error);

    }); 


  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('EmailBuilder', function() {
    return 'EmailBuilder!!!';
  });

    // Reading files like a boss
  function read(file) {
    return fs.readFileSync(file, 'utf8');
  }

};
