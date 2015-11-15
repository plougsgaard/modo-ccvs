# Introduction

A simple client that organizes and presents information
about the user's **Magic: the Gathering™ Online** card collection.

# Setup

`npm install`

`npm install -g webpack webpack-dev-server`

# Build

## Development

`webpack-dev-server`

## Production

`$ BUILD_ENV=production webpack`

Use the `-p` flag to produce minified code for either version.

```
$ BUILD_ENV=production webpack -p
```

### Now

The build outputs to `dist/` and can be tested by running a server in that folder.

# Features

The client depends on the user uploading their **Magic: the Gathering™ Online** collection via the web interface. It is then able to give an overview of the value of said collection as well as cursory data analysis.

The server serves card price lists aggregated from third party sites since the client isn't allowed to do this.

# Dependencies

* [react](https://github.com/facebook/react)
* [idb-wrapper](https://github.com/jensarps/IDBWrapper)
* [lodash](https://github.com/lodash/lodash)
* [reqwest](https://github.com/ded/reqwest)
* [webpack](https://github.com/webpack/webpack)
* [cheerio](https://github.com/cheeriojs/cheerio)
* [async](https://github.com/caolan/async)
