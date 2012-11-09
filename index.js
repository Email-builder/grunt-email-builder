(function() {
  // Required Libraries
  var juice = require('juice'),
      fs = require('fs'),
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
      html = read('html/email.html'),
      css = read('css/default.css'),
      output = juice(html, css),
      title = document.title+' '+date,
      username = 'username',
      password = 'password',
      applications = ['gmail', 'hotmail'],
      accountUrl = 'https://yoursite.litmus.com/emails.xml';
 
  // Reading files like a boss
  function read(file) {
    return fs.readFileSync(file, 'utf8');
  }

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


}).call(this);