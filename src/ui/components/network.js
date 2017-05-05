var output = require('neat-log/output')
var pretty = require('prettier-bytes')

module.exports = networkUI

function networkUI (state) {
  var network = state.network
  var stats = state.stats

  if (!network) return ''
  var peers = stats.peers.total || 0
  // var complete = stats.peers.complete
  return output`
    ${peers} ${pluralize('connection', peers)} ${speedUI()}
  `

  function speedUI () {
    var output = '| '
    var speed = state.stats.network
    var upSpeed = speed.uploadSpeed || 0
    var downSpeed = speed.downloadSpeed || 0
    output += `Download ${pretty(downSpeed)}/s`
    output += ` Upload ${pretty(upSpeed)}/s `
    return output
  }

  function pluralize (str, val) {
    return `${str}${val === 1 ? '' : 's'}`
  }
}
