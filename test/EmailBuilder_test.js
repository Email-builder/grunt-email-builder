var grunt = require('grunt');
var emailBuilder = require('../tasks/EmailBuilder');


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

console.log(emailBuilder);

exports.emailBuilder = {
  setUp: function(done) {
    // setup here
    done();
  },
  compile: function(test) {
    test.expect(2);
    // tests here

    var actual    = grunt.file.read('example/test/htmlTest.html');
    var expected  = grunt.file.read('test/expected/htmlTest.html');
    test.equal(expected, actual, 'should inline css links that have data-placement tags');

    actual    = grunt.file.read('example/test/htmlTest2.html');
    expected  = grunt.file.read('test/expected/htmlTest2.html');
    test.equal(expected, actual, 'should inline style tags and ignore style tags with the data-ignore attribute');

    test.done();
  },
  litmus: function(test) {

    test.done();
  }
};
