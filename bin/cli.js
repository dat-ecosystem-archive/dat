#!/usr/bin/env node

var fs = require('fs')
var subcommand = require('subcommand')
var encoding = require('dat-encoding')
var debug = require('debug')('dat')
var usage = require('../src/usage')

process.title = 'dat'

// Check node version to make sure we support
var NODE_VERSION_SUPPORTED = 4
var nodeMajorVer = process.version.match(/^v([0-9]+)\./)[1]
var invalidNode = nodeMajorVer < NODE_VERSION_SUPPORTED
if (invalidNode) exitInvalidNode()

var isDebug = debug.enabled || !!process.env.DEBUG

var config = {
  defaults: [
    { name: 'dir', abbr: 'd', help: 'set the directory for Dat' },
    { name: 'logspeed', default: 400 },
    { name: 'port', default: 3282, help: 'port to use for connections' },
    { name: 'utp', default: true, boolean: true, help: 'use utp for discovery' },
    { name: 'http', help: 'serve dat over http. Default port is 8080 or pass custom port.' },
    { name: 'quiet', default: isDebug, boolean: true } // neat-log uses quiet for debug right now
  ],
  root: {
    options: [
      {
        name: 'version',
        boolean: true,
        default: false,
        abbr: 'v'
      }
    ],
    command: usage
  },
  none: syncShorthand,
  commands: [
    require('../src/commands/clone'),
    require('../src/commands/create'),
    require('../src/commands/doctor'),
    require('../src/commands/publish'),
    require('../src/commands/pull'),
    require('../src/commands/share'),
    require('../src/commands/status'),
    require('../src/commands/sync'),
    require('../src/commands/auth/register'),
    require('../src/commands/auth/whoami'),
    require('../src/commands/auth/logout'),
    require('../src/commands/auth/login')
  ],
  usage: {
    command: usage,
    option: {
      name: 'help',
      abbr: 'h'
    }
  },
  aliases: {
    'init': 'create'
  },
  extensions: ['ls'] // whitelist extensions for now
}

var match = subcommand(config)
match(alias(process.argv.slice(2)))

function alias (argv) {
  var cmd = argv[0]
  if (!config.aliases[cmd]) return argv
  argv[0] = config.aliases[cmd]
  return argv
}

// CLI Shortcuts
// dat dat://key - clone/sync a key
// dat dir - share a dir
// dat extension

function syncShorthand (opts) {
  if (!opts._.length) return usage(opts)
  debug('Sync shortcut command')

  // Check if first argument is a key, if not assume dir
  try {
    opts.key = encoding.toStr(opts._[0])
  } catch (err) {
    if (err && err.message !== 'Invalid key') {
      // catch non-key errors
      console.error(err)
      process.exit(1)
    }
  }

  // Download Key
  if (opts.key) {
    // dat <link> [dir] - clone/resume <link> in [dir]
    debug('Clone sync')
    opts.dir = opts._[1] || process.cwd()
    opts.exit = false
    return require('../src/commands/clone').command(opts)
  }

  trySync(function () {
    // Try running extension if we don't reconize key or dir
    if (config.extensions.indexOf(opts._[0]) > -1) return require('../src/extensions')(opts)
    usage(opts)
  })

  // Sync dir
  // dat {dir} - sync existing dat in {dir}
  function trySync (cb) {
    opts.dir = opts._[0]
    fs.stat(opts.dir, function (err, stat) {
      if (err || !stat.isDirectory()) return cb()

      debug('Share sync')
      // Set default opts. TODO: use default opts in sync
      opts.watch = opts.watch || true
      opts.import = opts.import || true
      require('../src/commands/sync').command(opts)
    })
  }
}

function exitInvalidNode () {
  console.error('Node Version:', process.version)
  console.error('Unfortunately, we only support Node >= v4. Please upgrade to use Dat.')
  console.error('You can find the latest version at https://nodejs.org/')
  process.exit(1)
}
