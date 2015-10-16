
// build prepens require js

var System = require('System')
var _ = require('lodash')
var http = require('http')
var reqwest = require('reqwest')

var IpfsImport = function (cb) {
  var names = getParamNames(cb)
  reqwest({ url: 'ipfs-names.json',
            type: 'json',
            success: function (mapping) {
              resolve(names, mapping, cb)
            },
            error: function (err) {
              throw err
            }
          })
}

var resolve = function (names, mapping, cb) {
  var resolved = []
  for (var i = 0 ; i < names.length ; i++) {
    if (!mapping[names[i]]) {
      throw new Error('no mapping for ' + names[i])
    }
    resolved.push(mapping[names[i]])
  }

  Promise.all(_.map(resolved, function (path) {
    return System.import(path)
  })).then(function (modules) {
    cb.apply(this, modules)
  })
}

function getParamNames(func) {
  var argNames = /([^\s,]+)/g
  var fnStr = func.toString()
  return fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(argNames) || []
}

module.exports = IpfsImport
