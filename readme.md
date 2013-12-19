# grunt-email-builder [![Build Status](https://travis-ci.org/yargalot/Email-Builder.png?branch=master)](https://travis-ci.org/yargalot/Email-Builder)

Inline css into HTML or inline css into styletags for emails. You can then send files to Litmus for testing.


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
    options: {
      litmus : {
        subject: 'Custom subject line', // Optional, defaults to title of email + yyyy-mm-dd
        username : 'username',
        password : 'password',
        url : 'https://yoursite.litmus.com',
        //https://yoursite.litmus.com/emails/clients.xml
        applications : ['gmailnew', 'hotmail', 'outlookcom', 'ol2000', 'ol2002', 'ol2003', 'ol2007', 'ol2010','ol2011', 'ol2013', 'appmail6','iphone4', 'iphone5', 'ipad3']
      },
    },
    files : {
      'example/test/htmlTest.html' : 'example/html/htmlTest.html'
    }
  }
}
```

Use the `data-ignore` attribute on embedded or external styles to prevent them from being inlined. Otherwise all styles will be inline. External styles with `data-ignore` will be embedded in their own `<style>` tag within the document.
```html
  <link rel="stylesheet" data-ignore="ignore"  href="../css/style.css"  type="text/css" />

  <style data-ignore="ignore">
   .class { color: #000;}
  </style>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

### Contributors
Thanks for helping out:
- [Jeremy Peter](https://github.com/jeremypeter)
- [Josh Gillies](https://github.com/joshgillies)

## Thanks to
[Juice](https://github.com/LearnBoost/juice) for compiling.

## Release History
- 0.3 Inline css from style tags
- 0.22 Bug Fixes
- 0.2 upgrade to grunt 0.4

## License
Copyright (c) 2013 Steven Miller
Licensed under the MIT license.
