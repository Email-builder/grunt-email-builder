var grunt         = require('grunt');
var Litmus        = require('../tasks/lib/litmus');
var emailBuilder  = require('../tasks/EmailBuilder');


/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

grunt.loadTasks('tasks');

exports.emailBuilder = {
  setUp: function(done) {
    // setup here
    done();
  },
  compile: function(test) {
    
    // TESTS
    // ----------
    test.expect(2);

    var actual    = grunt.file.read('example/test/htmlTest.html');
    var expected  = grunt.file.read('test/expected/htmlTest.html');
    test.equal(expected, actual, 'should inline css links that have data-placement tags');

    actual    = grunt.file.read('example/test/htmlTest2.html');
    expected  = grunt.file.read('test/expected/htmlTest2.html');
    test.equal(expected, actual, 'should inline style tags and ignore style tags with the data-ignore attribute');

    test.done();
  },
  litmus: function(test) {

    var litmusFunction = new Litmus({
      subject: 'Custom subject line', // Optional, defaults to title of email + yyyy-mm-dd
      username : 'username',
      password : 'password',
      url      : 'https://yoursite.litmus.com',
      applications : []
    });

    var htmlTest  = '<p></p>';

    // TESTS
    // ----------
    test.expect(1);

    var actual = grunt.file.read('test/expected/xmlOutput.xml');
    var expected = litmusFunction.getBuiltXml(htmlTest, 'Test XML');

    test.equal(expected, actual, 'Should return valid xml to send to Litmus');

    test.done();
  }
};
