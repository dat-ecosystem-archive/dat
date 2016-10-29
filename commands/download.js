var chalk = require('chalk')
var prettyBytes = require('pretty-bytes')
var logger = require('status-logger')
var speedometer = require('speedometer')
var ui = require('../lib/ui')

module.exports = function (dat, args) {
  var log = logger(args)

  var downloadTxt = 'Downloading '
  var finished = false

  dat.stats.rateUp = speedometer()
  dat.stats.rateDown = speedometer()

  log.status('Starting Dat...\n', 0)
  log.status('Connecting...', 1)

  dat.on('error', onerror)

  dat.open(function () {
    log.message('Downloading in ' + dat.dir + '\n')
    dat.download(function (err) {
      if (err) onerror(err)
    })

    setInterval(function () {
      printSwarm()
      log.print()
    }, args.logspeed)
    log.print()
  })

  dat.once('key', function (key) {
    log.message(ui.keyMsg(key))
    if (args.quiet) console.log(ui.keyMsg(key))
  })

  dat.on('upload', function (data) {
    dat.stats.rateUp(data.length)
  })

  dat.on('download', function (data) {
    downloadTxt = 'Downloading '
    if (!finished) dat.stats.rateDown(data.length)
    updateStats()
  })

  dat.on('archive-updated', function () {
    finished = false
    dat.stats.rateDown = speedometer()
    updateStats()
    log.status('', -1) // remove download finished message
  })
  dat.on('file-downloaded', updateStats)

  dat.on('download-finished', function () {
    finished = true
    dat.stats.rateDown = 0
    updateStats()
    if (args.exit) {
      log.status('', 1)
      process.exit(0)
    }
    log.status('\nDownload Finished. You may exit the process with Ctrl-C.', -1)
  })

  dat.on('swarm-update', printSwarm)

  function printSwarm () {
    log.status(ui.swarmMsg(dat), 1)
  }

  function updateStats () {
    var stats = dat.stats
    var msg = ui.progress(stats.blocksProgress / stats.blocksTotal)
    if (finished || stats.blocksProgress >= stats.blocksTotal) {
      downloadTxt = 'Downloaded '
    }
    msg += ' ' + downloadTxt + chalk.bold(stats.filesTotal) + ' items'
    msg += chalk.dim(' (' + prettyBytes(stats.bytesTotal) + ')')
    log.status(msg + '\n', 0)
  }
}

function onerror (err) {
  console.error(err.stack || err)
  process.exit(1)
}
