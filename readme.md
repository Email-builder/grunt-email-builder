# grunt-EmailBuilder

Combine Html and Css into an email

What this will do Eventiually

Read Less (one for inline css, one for an inline style tag) and Jade Files, combine into a Single Email html file.

This will then be curled  off to litmus. Eventually whatever email testing service  (Are there any others?)

*** TODO ***
Replace curl exec function with actualy http thingy (wtf).

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-EmailBuilder`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-EmailBuilder');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Documentation

```javascript
 EmailBuilder: {
  test :{
    options: {
      litmus : {
        username : 'username',
        password : 'password',
        url : 'https://yoursite.litmus.com',
        //https://yoursite.litmus.com/emails/clients.xml
        applications : ['gmailnew', 'hotmail', 'outlookcom', 'ol2000', 'ol2002', 'ol2003', 'ol2007', 'ol2010','ol2011', 'ol2013', 'appmail6','iphone3', 'iphone4', 'ipad3']
      },
    },
    files : {
      'example/test/jadeTest.html' : 'example/jade/jadeTest.jade',
      'example/test/htmlTest.html' : 'example/html/htmlTest.html'
    }
  }
}
'''
## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History
1.3 upgrade to grunt 0.4

## License
Copyright (c) 2012 Steven Miller
Licensed under the MIT license.
