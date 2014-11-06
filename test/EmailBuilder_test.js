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
  allStyles: function(test) {
    test.expect(1);

    var actual    = grunt.file.read('example/dest/all.html');
    var expected  = grunt.file.read('test/expected/all.html');
    test.equal(expected, actual, 'should compile all styles');

    test.done();
  },
  conditionalStyles: function(test) {
    test.expect(1);

    var actual    = grunt.file.read('example/dest/conditional_styles.html');
    var expected  = grunt.file.read('test/expected/conditional_styles.html');
    test.equal(expected, actual, 'should add external styles within conditionals in a style tag');

    test.done();
  },
  embeddedStyles: function(test) {
    test.expect(2);

    var actual    = grunt.file.read('example/dest/embedded_styles.html');
    var expected  = grunt.file.read('test/expected/embedded_styles.html');
    test.equal(expected, actual, 'should inline embedded styles');

    actual    = grunt.file.read('example/dest/embedded_styles_ignored.html');
    expected  = grunt.file.read('test/expected/embedded_styles_ignored.html');
    test.equal(expected, actual, 'should add styles not to be inlined to style block using data-ignore attribute');

    test.done();
  },
  externalStyles : function(test) {
    test.expect(2);

    var actual    = grunt.file.read('example/dest/external_styles.html');
    var expected  = grunt.file.read('test/expected/external_styles.html');
    test.equal(expected, actual, 'should inline external styles');

    actual    = grunt.file.read('example/dest/external_styles_ignored.html');
    expected  = grunt.file.read('test/expected/external_styles_ignored.html');
    test.equal(expected, actual, 'should add styles not to be inlined to style block using data-ignore attribute');

    test.done();
  },
  encodeSpecialCharacters : function(test) {
    test.expect(1);

    var actual    = grunt.file.read('example/dest/encode_special_characters.html');
    var expected  = grunt.file.read('test/expected/encode_special_characters.html');
    test.equal(expected, actual, 'should encode special characters');

    test.done();
  },
  litmus: function(test) {

    var litmusFunction = new Litmus({
      subject: 'Custom subject line',
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
