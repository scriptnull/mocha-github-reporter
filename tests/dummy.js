/* global describe it */

var assert = require('assert')

describe('Dog module', function () {
  it('should pass', function () {
    assert.equal(1, 1, 'Values are not equal.')
  })

  it('should fail', function () {
    assert.equal(1, 2, 'Values are not equal.')
  })

  it('should throw error', function (done) {
    done(new Error('Super cool error, that is very easy to clear'))
  })
})

describe('Cat module', function () {
  it('should meow', function () {
    var sound = 'meow'
    assert.equal(sound, 'meow', 'Unable to meow')
  })
})
