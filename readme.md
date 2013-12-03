# grunt-email-builder

Combine Html and Css into an email

This reads Less/Css (one for inline css, one for an inline style tag) and Jade Files then combines  them into a Single Email html file.
You can then send them off to litmus for testing.


## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-email-builder`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-email-builder');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md

## Documentation

```javascript
 emailBuilder: {
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
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

- Uses [Juice](https://github.com/LearnBoost/juice) to inline css.

## Release History
1.3 upgrade to grunt 0.4

## License
Copyright (c) 2013 Steven Miller
Licensed under the MIT license.
