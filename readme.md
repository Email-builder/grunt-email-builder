# grunt-email-builder

Inline css into HTML or inline css into styletags for emails. You can then send files to Litmus for testing.

You can see an example setups below 
- [example](https://github.com/yargalot/email-builder-example)
- [rwdemail](https://github.com/iDVB/rwdemail) by [iDVB](https://github.com/iDVB)

[![NPM version](https://badge.fury.io/js/grunt-email-builder.png)](http://badge.fury.io/js/grunt-email-builder) [![Build Status](https://travis-ci.org/yargalot/Email-Builder.svg?branch=master)](https://travis-ci.org/yargalot/Email-Builder) [![Dependency Status](https://gemnasium.com/yargalot/Email-Builder.png)](https://gemnasium.com/yargalot/Email-Builder) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-email-builder`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-email-builder');
```

[grunt]: http://gruntjs.com/
[getting_started]: http://gruntjs.com/getting-started



## Documentation

Place this in your grunt file.
```javascript
emailBuilder: {
  test :{
    files : {
      'dest/ouput.html' : 'src/input.html'
    }
  }
}
```

To build your files [dynamically](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically)
```javascript
files : [{
  expand: true,
  src: ['**/*.html'],
  dest: 'dest/',
}]
```

To prevent styles from being inlined, use the `data-ignore` attribute on embedded or external styles. Otherwise, all styles will be inlined. External styles with the `data-ignore` attribute will be embedded in their own `<style>` tag within the src document.
```html
<!-- external styles -->
<link rel="stylesheet" data-ignore="ignore"  href="../css/style.css" />

<!-- embedded styles -->
<style data-ignore="ignore">
 /* styles here will not be inlined */
</style>
```

###Options

Can use any of the [Juice options](https://github.com/andrewrk/juice#juicefilepath-options-callback) along with the ones below

**options.emailTest**

Type: ``Object``

Send yourself a test email

```javascript
  emailTest : {

    // Your Email
    email : 'yourEmail@email.com',

    // Your email Subject
    subject : 'Email Subject',

    // Optional
    transport: {
      type: 'SMTP',
      service: 'gmail',
      auth: {
        user: 'gmail.user@gmail.com',
        pass: 'gmailpass'
      }
    }
  }
```
View [nodmailer transport methods](https://github.com/andris9/nodemailer#possible-transport-methods) if using **emailTest.transport** option

**options.litmus**

Type: ``Object``

Send email tests to Litmus

```javascript
litmus : {

  // Optional, defaults to title of email or yyyy-mm-dd if title and options.subject not set
  subject : 'Custom subject line',

  // Litmus username
  username : 'username',

  // Litmus password
  password : 'password',

  // Url to your Litmus account
  url : 'https://yoursite.litmus.com',

  // Email clients to test for. Find them at http://yoursite.litmus.com/emails/clients.xml
  // The <application_code> tags contain the name e.g. Gmail Chrome: <application_code> chromegmailnew </application_code>
  applications : ['gmailnew', 'hotmail', 'outlookcom', 'ol2000', 'ol2002', 'ol2003', 'ol2007', 'ol2010','ol2011', 'ol2013', 'appmail6','iphone4', 'iphone5', 'ipad3']
}
```

**options.encodeSpecialChars**

Type: ```Boolean``` Default: ```false```

If set to ```true```, special characters will be encoded to their numerical value. e.g. © --> &amp;#169;

**options.delay**

Type: ```Number``` Default: ```3500```

Set the delay between each test

### Example Usage

```javascript
emailBuilder:{
  inline: {
    files: { 'dest/output.html' : 'src/input.html' },
    options: {
      encodeSpecialChars: true
    }
  },
  litmus: {
    files: { 'dest/output.html' : 'src/input.html' },
    options: {
      encodeSpecialChars: true,
      litmus: {
        username: 'username',
        password: 'password',
        url: 'https://yoursite.litmus.com',
        applications: ['gmailnew', 'ffgmail', 'chromegmail']
      }
    }
  }
}

grunt.registerTask('inline', 'emailBuilder:inline');
grunt.registerTask('litmus', 'emailBuilder:litmus');

```

## Windows Installation Guide
- Make sure the latest Python 2.7.* is installed.
- Right click on Computer/My Computer and go to Properties, go to Advanced System Settings, then Environment Variables.
- Set the environment variable for "PYTHON" to where you installed Python27, eg C:\Python27\python.exe is the default.
- If Visual Studio is not installed, install Visual Studio 2010. If you are using a later version of Visual Studio, eg 2012 or 2013, set the environment variable "GYP_MSVS_VERSION" to the corresponding version of Visual Studio.


## Troubleshooting

If you're having issues with Litmus taking forever to load a test or the title of the test is showing up as "No Subject", it is most likely an issue with the Litmus API. You can check the [Litmus status](http://status.litmus.com) page to find out if their having any issues. If that's not the case, submit an issue and we'll look into further.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

### Contributors
Thanks for helping out:
- [Jeremy Peter](https://github.com/jeremypeter)
- [Josh Gillies](https://github.com/joshgillies)

## Thanks to
[Juice](https://github.com/LearnBoost/juice) for compiling.

## Release History

2.0.2
- Can now pass in [Juice options](https://github.com/andrewrk/juice#juicefilepath-options-callback) into options config
- Using Bluebird promise lib instead of async lib
- Link tags within conditional comments will be put into a style tag. Fixes [#19](https://github.com/yargalot/Email-Builder/issues/19)
- Added emailTest.transport option for users that might want to use a different transport method

2.0.1
- Using juice2 which is an up-to-date version of juice
- Removing options.doctype because juice2 handles this
- Added options.delay
- Added more logging information about a test. Fixes [#16](https://github.com/yargalot/Email-Builder/issues/16)
- Handles tests with duplicate names a little better by adding +1 to duplicate title

### [2.0.0](https://github.com/yargalot/Email-Builder/issues?milestone=1&page=1&state=closed)
- Send yourself a test email with options.emailTest
- Update to grunt 4.4
- Update Dependencies
- Change gruntfile to coffeescript

### Previous Updates
- 1.1.5 Allow options.litmus to run multiple tests
- 1.1.0 Added options.doctype and options.encodeSpecialChars.
- 1.0.0 Removed data-placement attribute in place of data-ignore. Improved options.litmus to send new versions of existing tests instead of creating new test.
- 0.0.3 Inline css from style tags
- 0.0.22 Bug Fixes
- 0.0.2 Upgrade to grunt 0.4

## License
Copyright (c) 2013 Steven Miller
Licensed under the MIT license.
