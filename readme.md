# grunt-email-builder
[![npm version](https://badge.fury.io/js/grunt-email-builder.svg)](http://badge.fury.io/js/grunt-email-builder) [![Build Status](https://travis-ci.org/Email-builder/grunt-email-builder.svg)](https://travis-ci.org/Email-builder/grunt-email-builder) [![Dependency Status](https://gemnasium.com/Email-builder/grunt-email-builder.svg)](https://gemnasium.com/Email-builder/grunt-email-builder) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Email-builder/grunt-email-builder)  

Uses [Email Builder](https://github.com/Email-builder/email-builder-core) to inline css into HTML tags, send tests to Litmus, and send test emails to yourself.

As of v3.0.0, you will no longer be able to use the `data-ignore` attribute. Instead, use data attributes `data-embed` and `data-embed-ignore` to prevent email builder from inlining css styles. 

Example:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- styles will be inlined -->
  <link rel="stylesheet" type="text/css" href="../css/styles.css">

  <!-- styles will be embedded -->
  <link rel="stylesheet" type="text/css" href="../css/otherStyles.css" data-embed>

  <!-- link tag will be preserved and styles will not be inlined or embedded -->
  <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css' data-embed-ignore>

  <!-- styles will be inlined -->
  <style>
    p { color: red; }
  </style>

  <!-- styles will be embedded -->
  <style data-embed>
    h1 { color: black; }
  </style>
</head>
<body>
  <h1>Heading</h1>
  <p>Body</p>
</body>
</html>
```

You can see an example setups below 
- [example](https://github.com/Email-builder/email-builder-example)
- [rwdemail](https://github.com/iDVB/rwdemail) by [iDVB](https://github.com/iDVB)

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

## Options

View [Email Builder options](https://github.com/Email-builder/email-builder-core#options) for all available options.

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


## Troubleshooting

If you're having issues with Litmus taking forever to load a test or the title of the test is showing up as "No Subject", it is most likely an issue with the Litmus API. You can check the [Litmus status](http://status.litmus.com) page to find out if their having any issues. If that's not the case, submit an issue and we'll look into further.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

### Contributors
Thanks to all [contributors](https://github.com/Email-builder/grunt-email-builder/graphs/contributors) 
 for helping out. 

## Further Reading

[Release History](https://github.com/Email-builder/grunt-email-builder/wiki/Release-History)  
[Release v2.0 Documentation](https://github.com/Email-builder/grunt-email-builder/wiki/v2.0)


## License
[MIT](https://github.com/Email-builder/grunt-email-builder/blob/master/LICENSE-MIT)
