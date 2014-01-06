var request = require('request'),
    mail = require('nodemailer').mail,
    fs = require('fs'),
    cheerio = require('cheerio'),
    builder   = require('xmlbuilder'),
    _ = require('lodash');


function Litmus(options){
  this.options = options;
  this.initVars();
}

// Initialize variables
Litmus.prototype.initVars = function() {

  this.reqObj = {
    auth: {
      user: this.options.username || '',
      pass: this.options.password || ''      
    }
  };
};

// Run test
Litmus.prototype.run = function(html, title) {
  this.title = this.options.subject || title;
  this.html = html;
  this.getTests(function(body){
    var id = this.getId(body);
    this.sendTest(id);
  });
};

// Grab tests from Litmus
Litmus.prototype.getTests = function(fn) {
  var self = this,
      opts = this.reqObj;
  opts.url = this.options.url + '/tests.xml';
  request.get(opts, function(err, res, body){
    if(err) { throw err; }
    fn.call(self, body);
  });
};

// Grab the name of email and set id if it matches title/subject line
Litmus.prototype.getId = function(body) {
  var $ = cheerio.load(body, {xmlMode: true}),
      $allNameTags = $('name'),
      subjLine = this.title,
      id,
      $matchedName = $allNameTags.filter(function(){
        return $(this).text() === subjLine;
      });

  if($matchedName.length){
    id = $matchedName.parent().children('id').text();
  }

  return id;
};

// Send a new version if id is availabe otherwise send a new test
Litmus.prototype.sendTest = function(id) {
  var self = this;
  var opts = this.reqObj;

  opts.headers = { 'Content-type': 'application/xml', 'Accept': 'application/xml' };
  opts.body = this.getBuiltXml(this.html, this.title);

  if(id){
    this.log('Sending new version of ' + this.title);
    opts.url = this.options.url + '/tests/'+ id + '/versions.xml';
    request.post(opts, this.mailNewVersion.bind(this));
  }else{
    this.log('Sending new test');
    opts.url = this.options.url + '/emails.xml';
    request.post(opts, this.logHeaders.bind(this));
  }
};

// Logs headers of response once email is sent
Litmus.prototype.logHeaders = function(err, res, body) {
  if(err){ throw err; }

  var headers = res.headers;

  Object.keys(headers).forEach(function(key){
    console.log(key.toUpperCase().bold + ': ' + headers[key]);
  });

  console.log('---------------------\n' + body); 
  this.logSuccess('Test sent!');
};

// Mail a new test using test email Litmus provides
Litmus.prototype.mailNewVersion = function(err, res, body) {
  if(err){ throw err; }

  var $ = cheerio.load(body),
      guid = $('url_or_guid').text(); 

  mail({
      from: 'no-reply@test.com',
      to: guid,
      subject: 'test sendmail',
      text: '',
      html: ''
  });
  this.logSuccess('New version sent!');

};

Litmus.prototype.getBuiltXml = function(html, title) {
  var xmlApplications = builder.create('applications').att('type', 'array');

  _.each(this.options.applications, function(app) {
    var item = xmlApplications.ele('application');

    item.ele('code', app);
  });

  //Build Xml to send off, Join with Application XMl
  var xml = builder.create('test_set')
    .importXMLBuilder(xmlApplications)
    .ele('save_defaults', 'false').up()
    .ele('use_defaults', 'false').up()
    .ele('email_source')
      .ele('body').dat(html).up()
      .ele('subject', title)
    .end({pretty: true});

  return xml;
};

// Logging helpers
Litmus.prototype.log = function(str) {
  return console.log(str.cyan);
};

Litmus.prototype.logSuccess = function(str) {
  return console.log(str.green);
};

module.exports = Litmus;
