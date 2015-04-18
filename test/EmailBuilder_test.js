var grunt         = require('grunt');

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
    test.expect(6);
    var actual;
    var expected;

    actual    = grunt.file.read('example/dest/conditional_styles.html');
    expected  = grunt.file.read('test/expected/conditional_styles.html');
    test.equal(expected, actual, 'should embed conditional styles');

    actual    = grunt.file.read('example/dest/embedded_styles_ignored.html');
    expected  = grunt.file.read('test/expected/embedded_styles_ignored.html');
    test.equal(expected, actual, 'should embed style tags with data-embed attribute');

    actual    = grunt.file.read('example/dest/embedded_styles_inlined.html');
    expected  = grunt.file.read('test/expected/embedded_styles_inlined.html');
    test.equal(expected, actual, 'should inline embedded styles');

    actual    = grunt.file.read('example/dest/external_styles_embedded.html');
    expected  = grunt.file.read('test/expected/external_styles_embedded.html');
    test.equal(expected, actual, 'should embed link tags with data-embed attribute');

    actual    = grunt.file.read('example/dest/external_styles_ignored.html');
    expected  = grunt.file.read('test/expected/external_styles_ignored.html');
    test.equal(expected, actual, 'should preserve link tags with data-embed-ignore attribute');

    actual    = grunt.file.read('example/dest/external_styles_inlined.html');
    expected  = grunt.file.read('test/expected/external_styles_inlined.html');
    test.equal(expected, actual, 'should inline external styles');

    test.done();
  }
};
