/* global describe it */

var assert = require('assert')

describe('Animal module', function () {
  describe('Dog module', function () {
    it('should bark', function () {
      var sound = 'boww'
      assert.equal(sound, 'boww', 'Dog is not barking')
    })
  })
  describe('Cat module', function () {
    it('should meow', function () {
      var sound = 'meow'
      assert.equal(sound, 'meow', 'Unable to meow')
    })
  })

  it('should have 5 senses', function () {
    var senses = 5
    assert.equal(senses, 4, 'Out of sense')
  })
})
