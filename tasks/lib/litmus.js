var request = require('request'),
    mail = require('nodemailer').mail,
    fs = require('fs'),
    cheerio = require('cheerio'),
    builder   = require('xmlbuilder'),
    Table = require('cli-table'),
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
Litmus.prototype.run = function(html, title, next) {
  this.title = this.options.title;
  this.delay = this.options.delay || 3500;

  if( (this.title === undefined) || (this.title.trim().length === 0) ){
    this.title = title;
  }

  this.html = html;
  this.getTests(function(body){
    var id = this.getId(body);
    this.sendTest(id);
    setTimeout(next, this.delay);
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

// Calculate and get the average time for test to complete
Litmus.prototype.getAvgTime = function(body) {
  var $ = cheerio.load(body, { xmlMode: true });
  var avgTimes = $('average_time_to_process');
  var count = 0;
  avgTimes.each(function(i, el){
    count += +$(this).text();
  });

  if(count < 60){
    return count + ' secs';
  }else{
    return  Math.round((count/avgTimes.length)/60) + ' mins';
  }
};

// Log status of test
Litmus.prototype.getStatus = function(body) {
  var $ = cheerio.load(body, { xmlMode: true }),
      statuses = $('status'),
      delayed = [],
      unavailable = [],
      statusCode,
      application;

  statuses.each(function(i, el){

    var $this = $(this);
    statusCode = +$this.text();
    application = $this.parent().children('application_long_name').text();

    if(statusCode === 1){ delayed.push(application); }

    if(statusCode === 2){ unavailable.push(application); }

  });

  return {
    delayed: delayed.join('\n'),
    unavailable: unavailable.join('\n')
  };

};

Litmus.prototype.logStatusTable = function(body) {
  var table = new Table(),
      delayed = this.getStatus(body).delayed,
      unavailable = this.getStatus(body).unavailable,
      avgTime = this.getAvgTime(body),
      values = [];

  table.options.head = ['Avg. Time to Complete'.bold];
  values.push(avgTime);

  if(delayed.length > 0){
    table.options.head.push('Delayed'.bold);
    values.push(delayed);
  }

  if(unavailable.length > 0){
    table.options.head.push('Unavailable'.bold);
    values.push(unavailable);
  }

  table.push(values);

  console.log(table.toString());
};

// Send a new version if id is availabe otherwise send a new test
Litmus.prototype.sendTest = function(id) {
  var self = this;
  var opts = _.clone(this.reqObj);

  opts.headers = { 'Content-type': 'application/xml', 'Accept': 'application/xml' };
  opts.body = this.getBuiltXml(this.html, this.title);

  if(id){
    this.log('Sending new version: '.bold + this.title);
    opts.url = this.options.url + '/tests/'+ id + '/versions.xml';
    request.post(opts, this.mailNewVersion.bind(this));
  }else{
    this.log('Sending new test: '.bold + this.title);
    opts.url = this.options.url + '/emails.xml';
    request.post(opts, this.logHeaders.bind(this));
  }
};

// Logs headers of response once email is sent
Litmus.prototype.logHeaders = function(err, res, body) {
  if(err){ throw err; }

  var headers = res.headers;
  var status = parseFloat(headers.status, 10);

  Object.keys(headers).forEach(function(key){
    console.log(key.toUpperCase().bold + ': ' + headers[key]);
  });

  console.log('---------------------\n' + body); 

  if(status > 199 && status < 300){
    this.logSuccess('Test sent!');
    this.logStatusTable(body);
  } else {
    throw new Error(headers.status);
  }

};

// Mail a new test using test email Litmus provides
Litmus.prototype.mailNewVersion = function(err, res, body) {
  if(err){ throw err; }

  var $ = cheerio.load(body),
      guid = $('url_or_guid').text(); 

  mail({
      from: 'no-reply@test.com',
      to: guid,
      subject: this.title,
      text: '',
      html: this.html
  });
  this.logSuccess('New version sent!');
  this.logStatusTable(body);

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
