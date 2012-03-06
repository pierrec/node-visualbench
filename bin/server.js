#!/usr/bin/env node

/**
  Start up a web server from the current directory or the one given on the 
  command line.
  Point your browser to it and visualize your benchmarks!
**/

// Native modules
var path = require('path')
var http = require('http')

// User modules
var _ = require('underscore')
var debug = require('debug')('http')
var program = require('commander')
var filed = require('filed')
var fileset = require('fileset')

// Default config
var cwd = process.cwd()
var defaultConfig = {
    root: cwd
  , host: 'localhost'
  , port: 8080
  }
debug('defaultConfig %j', defaultConfig)

// Command line options
program
  .version( require( path.join( __dirname, '..', 'package.json') ).version )
  .option(
    '-r, --root <www root dir>'
  , 'Directory to be served to /data (default=current directory)'
  , defaultConfig.root
  )
  .option(
    '-h, --host <hostname|IP>'
  , 'Host to be used'
  , defaultConfig.host
  )
  .option(
    '-p, --port <port>'
  , 'Port to listen on'
  , defaultConfig.port
  )
  .parse(process.argv)

for (var o in defaultConfig)
  if ( _.has(program, o) ) defaultConfig[o] = program[o]

// Get local config?
var defaultConfigFile = path.join( '.', 'visualbench.json' )
var config = path.existsSync(defaultConfigFile)
    ? _.defaults( require(defaultConfigFile), defaultConfig )
    : defaultConfig
debug('config %j', config)

// Sanitize paths
config.root = path.resolve(config.root)

// Server
var vbRoot = path.join( __dirname, '..', 'www' )
debug('vbRoot %s', vbRoot)

http.createServer(function (req, res) {
  var url = req.url
    , file
  
  debug('%s %s', req.method, url)
  if ( url.substr(0, 5) === '/data' ) {
    if (url.length === 5 || url.substr(-1) === '/') {
      // By default, load any json file found under the root directory
      // including those located in subdirs
      return fileset(
        path.join( config.root, '**/*.json' )
      , ''
      , function (err, list) {
          if (err) {
            res.statusCode = 500
            res.end(err.message)
          } else {
            debug('LIST %s %j', config.root, list)
            res.end( JSON.stringify(list) )
          }
        }
      )
    }
    // Files returned by fileset are relative to the cwd _not_ config.root...
    file = path.resolve(cwd, '.' + url.substr(5))
    debug('%s => %s', config.root, file)
  } else {
    file = path.resolve(vbRoot, '.' + url)
  }
  filed(file).pipe(res)
})
  .listen(config.port, config.host, function () {
    console.log('Server running at http://%s:%d/', config.host, config.port)
  })
