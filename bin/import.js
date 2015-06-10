var fs = require('fs')
var pump = require('pump')
var pumpify = require('pumpify')
var debug = require('debug')('bin/import')
var Dat = require('../')
var progress = require('../lib/progress.js')
var abort = require('../lib/abort.js')
var usage = require('../lib/usage.js')('import.txt')

module.exports = {
  name: 'import',
  command: handleImport,
  options: [
    {
      name: 'dataset',
      boolean: false,
      abbr: 'd'
    },
    {
      name: 'format',
      boolean: false,
      abbr: 'f'
    },
    {
      name: 'message',
      boolean: false,
      abbr: 'm'
    },
    {
      name: 'key',
      boolean: true,
      abbr: 'k'
    }
  ]
}

function handleImport (args) {
  debug('handleImport', args)

  if (args.help || args._.length === 0) {
    return usage()
  }

  if (!args.dataset) abort(new Error('Error: Must specify dataset (-d)'), args)

  var dat = Dat(args)

  var inputStream
  if (args._[0] === '-') inputStream = process.stdin
  else inputStream = fs.createReadStream(args._[0])
  if (!args.json) inputStream = pumpify(inputStream, progress('Wrote'))

  pump(inputStream, dat.createImportStream(args), function done (err) {
    if (err) abort(err, args, 'Error importing data')
    if (args.json) {
      var output = {
        version: dat.db.head
      }
      console.log(JSON.stringify(output))
    } else console.error('Done importing data')
  })
}
