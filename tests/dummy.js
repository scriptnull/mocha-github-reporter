/* global describe it */

var assert = require('assert')

describe('Animal module', function () {
  describe('Dog module', function () {
    it('should bark', function () {
      var sound = 'boww'
      assert.equal('boww', sound, 'Dog is not barking')
    })
    it('should use linux', function () {
      throw new Error('dog says no idea !')
    })
  })
  describe('Cat module', function () {
    it('should meow', function () {
      var sound = 'meow'
      assert.equal('meow', sound, 'Unable to meow')
    })
  })

  it('should have 5 senses', function () {
    var senses = 5
    assert.equal(4, senses, 'Out of sense')
  })
})
