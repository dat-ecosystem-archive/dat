# dat

Dat is a decentralized data tool for distributing data small and large.

[![#dat IRC channel on freenode](https://img.shields.io/badge/irc%20channel-%23dat%20on%20freenode-blue.svg)](http://webchat.freenode.net/?channels=dat)
[![datproject/discussions](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/datproject/discussions?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![docs](https://readthedocs.org/projects/dat-cli/badge/?version=latest)](http://docs.dat-data.com)


Windows        | Mac/Linux
-------------- | ------------
[![Build status](https://ci.appveyor.com/api/projects/status/github/maxogden/dat?branch=master&svg=true)](https://ci.appveyor.com/project/maxogden/dat) | [![Travis](https://api.travis-ci.org/maxogden/dat.svg)](https://travis-ci.org/maxogden/dat)

## About Dat

Documentation for the Dat project is available at [docs.dat-data.com](http://docs.dat-data.com).

### Key features:

  * **Live sync** folders by sharing files as they are added to the folder.
  * **Distribute large files** without copying data to a central server by connecting directly to peers.
  * **Intelligently sync** by deduplicating data between versions.
  * **Verify data integrity** using strong cryptographic hashes.
  * **Work everywhere**, including in the [browser](https://github.com/datproject/dat.land) and on the [desktop](https://github.com/juliangruber/dat-desktop).

Dat embraces the Unix philosophy: a modular design with composable parts. All of the pieces can be replaced with alternative implementations as long as they implement the abstract API.

### Ways to Use Dat

  * [Dat CLI](https://github.com/maxogden/dat): command line tool
  * [Dat Desktop](https://github.com/juliangruber/dat-desktop/): desktop application
  * [dat.land](https://github.com/datproject/dat.land): website application

## CLI Development Status

This is the Dat CLI 1.0 release candidate (RC2). We are actively seeking feedback & developing this release candidate. Follow [this issue](https://github.com/datproject/projects/issues/5) for the Dat CLI road map discussion and see [known RC2 issues](https://github.com/maxogden/dat/issues/486).

**Please note** that previous versions of Dat (alpha, beta) are incompatible with the 1.0 release candidate.

## Getting started

### Install

To install the 1.0 release candidate from npm:

```
npm install dat -g
```

If you receive an `EACCES` error read [this guide](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

### Using Dat

There are two main commands in dat:

1. Share data: `dat <directory>`
2. Download data: `dat <dat-link> <download-directory>`

### Sharing Files

Share a directory by typing `dat <directory>`:

```
$ dat my_data/
Sharing /Users/joe/my_data/

Share Link: 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
The Share Link is secret and only those you share it with will be able to get the files

[==============>] Added 2 files (1.44 kB/1.44 kB)

Connected to 1 peers. Uploading 288.2 B/s. Watching for updates...
```

You are now publishing that data from your computer. It will be publicly accessible as long as your terminal is open. The hash is a **secret hash**, your data is visible to anyone you send the hash to. As you add more files to the folder, dat will update and share the new files.

### Downloading Files

Your colleague can get data like this:

```
$ dat 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj download_dir
Downloading in /Users/joe/download_dir

Share Link: 2imqzxdu46jh2rrhm6xnd30bsjgu3oosgy52dphdbxlzxvz5sj
The Share Link is secret and only those you share it with will be able to get the files

[==============>] Downloaded 3 files (1.44 kB/1.44 kB)

Connected to 1 peers. Downloading 1.44 kB/s. Watching for updates...
```

It will start downloading the data into the `download_dir` folder. Anyone who gets access to the unique dat-link will be able to download and re-host a copy of the data. It's distributed mad science!

For more information, see the [Dat CLI documentation](http://dat-cli.readthedocs.org/) or the [dat project documentation](http://docs.dat-data.com).


## Development

Please see [guidelines on contributing](https://github.com/maxogden/dat/blob/master/CONTRIBUTING.md) before submitting an issue or PR.

### Installing from source

Clone this repository and in a terminal inside of the folder you cloned run this command:

```
npm link
```

This should add a `dat` command line command to your PATH. Now you can run the `dat` command to try it out.

The contribution guide also has more tips on our [development workflow](https://github.com/maxogden/dat/blob/master/CONTRIBUTING.md#development-workflow).
