#!/usr/bin/env node

var path = require('path')
var Dat = require('./')
var cli = require('./lib/parse-cli.js')
var EOL = require('os').EOL
var url = require('url')
var stdout = require('stdout-stream')
var fs = require('fs')
var debug = require('debug')('dat.cli')

var defaultMessage = "Usage: dat <command> [<args>]" + EOL + EOL + "Enter 'dat help' for help"
var datCommand = cli.command()

var first = datCommand.command || ''

if (first === 'import' || !first) {
  var inputStream = cli.getInputStream(datCommand)
} else {
  var inputStream = false
}

var datOpts = { init: !!inputStream }

if (datCommand.command === 'clone') {
  datOpts.storage = false
}

var datPath = process.cwd()

if (datCommand.command === 'clone') {
  var remote = url.parse(Dat.prototype.normalizeURL(datCommand.options['1']))
  var customPath = datCommand.options['2'] || datCommand.options.dir
  if (customPath) datPath = customPath
  else datPath = path.join(datPath, remote.hostname)
}

var dat = Dat(datPath, datOpts, function ready(err) {
  if (err) {
    console.error(err)
    dat.close()
    return
  } 
  
  if (inputStream) {
    return cli.writeInputStream(inputStream, dat, datCommand)
  }

  if (!datCommand || !datCommand.command) {
    dat.close()
    return process.stderr.write(defaultMessage + EOL)
  }
  
  if (!cliCommands[datCommand.command]) {
    dat.close()
    return process.stderr.write(['Command not found: ' + datCommand.command, '', defaultMessage].join(EOL))
  }
  
  cliCommands[datCommand.command].call(dat, datCommand.options, function(err, message) {
    if (err) {
      dat.close()
      return console.error(err.message)
    }
    if (typeof message === 'object') message = JSON.stringify(message)
    if (!datCommand.options.quiet && message) stdout.write(message.toString() + EOL)
    var persist = ['serve', 'listen']
    if (persist.indexOf(datCommand.command) === -1) close()
  })
})

// CLI commands whitelist
var cliCommands = {
  init: dat.init,
  cat: dat.cat,
  "export": dat.cat,
  dump: dat.dump,
  help: dat.help,
  pull: dat.pull,
  push: dat.push,
  clone: dat.clone,
  config: dat.config,
  serve: dat.listen,
  listen: dat.listen,
  version: dat.versionCmd
}

function close() {
  // if _server exists it means dat is the rpc server
  if (dat._server) {
    // since the server process can't exit yet we must manually close stdout
    stdout.end()
    
    // if there aren't any active connections then we can close the server
    if (dat.connections.sockets.length === 0) dat.close()
    
    // otherwise wait for the current connections to close
    dat.connections.on('idle', function() {
      debug('dat close due to idle')
      dat.close()
    })
    
  } else {
    dat.close()
  }
}
