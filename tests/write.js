var os = require('os')
var fs = require('fs')
var path = require('path')
var test = require('tape')
var spawn = require('tape-spawn')
var helpers = require('./helpers')

var version

var tmp = os.tmpdir()
var dat = path.resolve(__dirname + '/../cli.js')
var dat1 = path.join(tmp, 'dat-write-1')
var dat2 = path.join(tmp, 'dat-write-2')
var dat3 = path.join(tmp, 'dat-write-3')

helpers.onedat(dat1)

test('write: dat write to dataset', function (t) {
  var st = spawn(t, "echo 'hello world' | " + dat + ' write -d write-test test-file.txt -', {cwd: dat1})
  st.stdout.empty()
  st.stderr.match(/Stored test-file\.txt successfully/)
  st.end()
})

test('write: dat read after write to dataset', function (t) {
  datReadEquals(t, 'test-file.txt', /hello world/, '-d write-test')
})

test('write: dat write to new dataset', function (t) {
  var st = spawn(t, "echo 'goodbye world' | " + dat + ' write -d write-test-2 test-file.txt -', {cwd: dat1})
  st.stdout.empty()
  st.stderr.match(/Stored test-file\.txt successfully/)
  st.end()
})

test('write: dat read after write to dataset 2', function (t) {
  datReadEquals(t, 'test-file.txt', /goodbye world/, '-d write-test-2')
})

test('write: dat overwrite to dataset 2', function (t) {
  var st = spawn(t, "echo 'goodbye mars' | " + dat + ' write -d write-test-2 test-file.txt -', {cwd: dat1})
  st.stdout.empty()
  st.stderr.match(/Stored test-file\.txt successfully/)
  st.end()
})

test('write: dat read after overwrite to dataset 2', function (t) {
  datReadEquals(t, 'test-file.txt', /goodbye mars/, '-d write-test-2')
})

/** with existing key **/
helpers.onedat(dat3)

test('write: dat import csv', function (t) {
  var st = spawn(t, 'echo "foo,bah\n123,456" | ' + dat + ' import - -d test --key foo', {cwd: dat3})
  st.stdout.empty()
  st.stderr.match(/Done importing data/)
  st.end()
})

test('write: dat write over an existing key with row content', function (t) {
  var st = spawn(t, 'echo bah | ' + dat + ' write foo -d test -', {cwd: dat3})
  st.stdout.empty()
  st.stderr.match(/Stored foo successfully/)
  st.end()
})

test('write: dat read foo should get file contents', function (t) {
  datReadEquals(t, 'foo', /bah/, '-d test', dat3)
})

/* write updates existing checkout */

test('write: dat import csv', function (t) {
  var st = spawn(t, 'echo "foo,bah\n123,456" | ' + dat + ' import - -d test-checkout', {cwd: dat3})
  st.stdout.empty()
  st.stderr.match(/Done importing data/)
  st.end()
})

test('write: dat3 status as json', function (t) {
  var st = spawn(t, dat + ' status --json', {cwd: dat3})
  st.stdout.match(function (output) {
    try {
      var json = JSON.parse(output)
      version = json.version
      return json.version.length === 64 // 32bit hash 2 in hex (64)
    } catch (e) {
      return false
    }
  })
  st.stderr.empty()
  st.end()
})

test('write: checkout', function (t) {
  var st = spawn(t, dat + ' checkout ' + version, {cwd: dat3})
  st.stderr.empty()
  st.stdout.match(/Current version is now/)
  st.end()
})

test('write: dat write on a checkout', function (t) {
  var st = spawn(t, 'echo bah | ' + dat + ' write foo -d test-checkout -', {cwd: dat3})
  st.stdout.empty()
  st.stderr.match(/Stored foo successfully/)
  st.end()
})

test('write: dat read after checkout', function (t) {
  datReadEquals(t, 'foo', /bah/, '-d test-checkout', dat3)
})

/** from file **/

var blobPath = path.resolve(__dirname + '/fixtures/blob.txt')

test('write: dat write from file', function (t) {
  datWrite(t, blobPath, '-d write-test-2')
})

test('write: dat read after write from file', function (t) {
  var contents = fs.readFileSync(blobPath).toString()
  datReadEquals(t, path.basename(blobPath), contents, '-d write-test-2')
})

test('write: dat write from file with new key', function (t) {
  datWrite(t, blobPath, '-d write-test-2 --key=new-name.txt')
})

test('write: dat read after write from file with new key', function (t) {
  var contents = fs.readFileSync(blobPath).toString()
  datReadEquals(t, 'new-name.txt', contents, '-d write-test-2')
})

test('write: dat write from file with new key with abbr', function (t) {
  datWrite(t, blobPath, '-k new-name-abbr.txt')
})

test('write: dat read after write from file with new key with abbr', function (t) {
  var contents = fs.readFileSync(blobPath).toString()
  datReadEquals(t, 'new-name-abbr.txt', contents)
})

helpers.onedat(dat2)
helpers.fileConflict(dat1, dat2, 'write-test', 'plato-says-hey-yo', function (conflictForks) { })

test('write: dat write after conflict', function (t) {
  datWrite(t, blobPath, '-d write-test --key=file.txt', dat1)
})

test('write: dat write after conflict', function (t) {
  var contents = fs.readFileSync(blobPath).toString()
  datReadEquals(t, 'file.txt', contents, '-d write-test', dat1)
})

test('write: dat read after conflict', function (t) {
  datReadEquals(t, 'plato-says-hey-yo', /goodbye mars/, '-d write-test', dat1)
})

test('write: dat read after conflict', function (t) {
  datReadEquals(t, 'plato-says-hey-yo', /hello mars/, '-d write-test', dat2)
})

test('write: dat write with message', function (t) {
  datWrite(t, blobPath, '-d write-test-2 -k new-name-abbr.txt -m "im a test message"', dat2)
})

test('write: dat log has binary write message', function (t) {
  var st = spawn(t, dat + ' log', {cwd: dat2})
  st.stdout.match(/im a test message/)
  st.stderr.empty()
  st.end()
})

function datWrite (t, blobPath, ext, myDat) {
  if (!myDat) myDat = dat1
  var cmd = ' write ' + blobPath
  if (ext) {
    cmd = cmd + ' ' + ext
  }
  var st = spawn(t, dat + cmd, {cwd: myDat})
  st.stdout.empty()
  st.stderr.match(/Stored .+ successfully/)
  st.end()
}

function datReadEquals (t, key, contents, ext, myDat) {
  if (!myDat) myDat = dat1
  var cmd = ' read ' + key
  if (ext) {
    cmd = cmd + ' ' + ext
  }
  var st = spawn(t, dat + cmd, {cwd: myDat})
  st.stderr.empty()
  st.stdout.match(contents)
  st.end()
}
