# grunt-email-builder

Inline css into HTML or inline css into styletags for emails. You can then send files to Litmus for testing.


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

In your html files you can either inline the css on elements or inline css into styletags in the file by using data-placement on the link tag
```html
  <link rel="stylesheet" data-placement="inline"     href="../css/inline.css" type="text/css" />
  <link rel="stylesheet" data-placement="style-tag"  href="../css/style.css"  type="text/css" />
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

- Uses [Juice](https://github.com/LearnBoost/juice) to inline css.

## Release History
1.3 upgrade to grunt 0.4

## License
Copyright (c) 2013 Steven Miller
Licensed under the MIT license.
