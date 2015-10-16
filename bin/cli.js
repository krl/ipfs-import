#!/usr/bin/env node
'use strict'

var ipfsApi = require('ipfs-api')
var fs = require('fs')
var opts = require('minimist')
var tmp = require('tmp')
var browserify = require('browserify')
var npmi = require('npmi')

var argv = require('minimist')(process.argv.slice(2))

var NAMES = 'ipfs-names.json'

var camelCase = function (hypenated) {
  return hypenated.replace(/-([a-z])/g, function (m, w) {
    return w.toUpperCase();
  })
}

var npmInstall = function (chain) {
  return new Promise(function (resolve) {
    console.log('npm installing ' + chain.pkgname + ' in ' + chain.path)

    var options = {
      name: chain.pkgname,
      pkgName: chain.pkgname,
      path: chain.path
    }
    var split = chain.pkgname.split('/')
    chain.moduleName = split[split.length - 1]

    var fullpath = chain.path + '/node_modules/' + chain.moduleName

    // for some reason npm freaks out in /home/user
    process.chdir('/tmp')

    npmi(options, function (err, res) {
      if (err) throw err

      console.log('installed ' + chain.name + ' in ' + fullpath)
      chain.fullpath = fullpath
      resolve(chain)
    })
  })
}

var buildModule = function (chain) {
  return new Promise(function (resolve, reject) {
    var moduleName = camelCase(chain.moduleName)
    console.log('building module as ' + moduleName)
    var opts = { standalone: moduleName }
    var b = browserify([chain.fullpath], opts)
      .bundle(function (err, res) {
        if (err) return reject(err)
        chain.bundle = res
        chain.standalone = moduleName
        resolve(chain)
      })
  })
}

var ipfsAdd = function (chain) {
  return new Promise(function (resolve, reject) {
    console.log('adding to ipfs')
    chain.ipfs.add(chain.bundle, function (err, res) {
      if (err) return reject(err)
      chain.moduleHash = res[0].Hash
      console.log('result: /ipfs/' + chain.moduleHash)
      resolve(chain)
    })
  })
}

var writeNamesFile = function (chain) {
  return new Promise(function (resolve, reject) {
    var names

    try {
      names = fs.readFileSync(NAMES)
    } catch (e) {}

    if (names) {
      names = JSON.parse(names)
    } else {
      names = {}
    }
    names[chain.standalone] = '/ipfs/' + chain.moduleHash
    console.log('updating ipfs-names.json')
    fs.writeFileSync(NAMES, JSON.stringify(names, null, 2) + '\n')
  })
}

var help = function () {
  console.log()
  console.log('ipfs-import')
  console.log()
  console.log('  packages browserifyable javascript from npm into')
  console.log('  standalone modules, and adds them to ipfs')
  console.log()
  console.log('  also writes to ./ipfs-names.json, mapping the')
  console.log('  camelCased module name to the ipfs path')
  console.log()
  console.log('  ipfs-import packagename')
  console.log()
  console.log('  also allows github npm syntax (github:user/package)')
}

var main = function () {
  var ipfs = ipfsApi()

  var pkgname = argv._[0]

  tmp.dir({ unsafeCleanup: true }, function (err, path, cleanup) {
    if (err) throw err

    var chain = { pkgname: pkgname,
                  ipfs: ipfs,
                  path: path}

    npmInstall(chain)
      .then(buildModule)
      .then(ipfsAdd)
      .then(writeNamesFile)
      .then(cleanup)
      .catch(function (err) {
        cleanup()
        console.log(err)
        throw err
      })
        })
}

main()
