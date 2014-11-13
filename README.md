# Introduction

A simple client/server pair that organizes and presents information
about the user's **Magic: the Gathering™ Online** card collection.

# Installation

## Client

Everything goes on in the client directory.
```
cd client
```

### Prerequisites

The client expects to find a file `env.js` in the client root with this format

``
module.exports = {
    development: {
        HOST: "http://localhost:8000"
    },
    production: {
        HOST: "http://example.com:8000"
    }
};
``

### Then

Install dependencies

```
$ npm install
```

Build development version..

``
$ BUILD_ENV=development webpack
``

..or the production version

```
$ BUILD_ENV=production webpack
```

### Now

Now whichever version you decided to build resides in the `dist/` directory referenced by `index.html`. But to actually function it will need a working server.

## Server

The server doesn't actually need to be built. It just needs to run with some environment variables set. First install the dependencies.

```
$ npm install
```

### Example

```
$ HOST=http://example.com FILE_ROOT=http://example.com/files/ node scraper.js 
```

### Variables

* **HOST**: The host serving the client's static HTML/JS
* **FILE_ROOT**: The place the server can find the various data it needs such as price data
	
# Features

The client depends on the user uploading their **Magic: the Gathering™ Online** collection via the web interface. It is then able to give an overview of the value of said collection as well as cursory data analysis.

The server serves card price lists aggregated from third party sites since the client isn't allowed to do this.

# Dependencies

## Client
* [react](https://github.com/facebook/react)
* [idb-wrapper](https://github.com/jensarps/IDBWrapper)
* [lodash](https://github.com/lodash/lodash)
* [reqwest](https://github.com/ded/reqwest)

## Server
* [underscore](https://github.com/jashkenas/underscore)
* [cheerio](https://github.com/cheeriojs/cheerio)
* [request](https://github.com/request/request)
* [async](https://github.com/caolan/async)