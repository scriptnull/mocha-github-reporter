/* global describe it */

var assert = require('assert')

describe('Dummy Tests', function () {
  it('should pass', function () {
    assert.equal(1, 1, 'Values are not equal.')
  })

  it('should fail', function () {
    assert.equal(1, 2, 'Values are not equal.')
  })
})
