# spdy-transport
[![Build Status](https://secure.travis-ci.org/indutny/spdy-transport.png)](http://travis-ci.org/indutny/spdy-transport)
[![NPM version](https://badge.fury.io/js/spdy-transport.svg)](http://badge.fury.io/js/spdy-transport)

SPDY/HTTP2 generic transport implementation.

## WIP

**NOTE: THIS IS STILL WORK IN PROGRESS. EVERYTHING MAY BE BROKEN AT THIS POINT**

## Usage

### server

```javascript
var transport = require('spdy-transport');

// NOTE: socket is some stream or net.Socket instance, may be an argument
// of `net.createServer`'s connection handler.

var server = transport.connection.create(socket, {
  protocol: 'http2', // or 'spdy'
  isServer: true
});

server.on('stream', function(stream) {
  console.log(stream.method, stream.path, stream.headers);
  
  // necessary for the stream to be established in both ends
  stream.respond(200, {
    header: 'value'
  });

  // response body
  stream.write(<data>)

  stream.end() // sends FLAG_FIN, setting the connection half open

  stream.on('readable', function() {
    var chunk = stream.read();
    if (!chunk)
      return;

    console.log(chunk);
  });

  stream.on('end', function() {
    console.log('end');
  });

  // And other node.js Stream APIs
  // ...
});
```

### client

```javascript
var transport = require('spdy-transport')

// NOTE: socket is some stream or net.Socket instance, may be an argument
// of `net.createServer`'s connection handler.

var client = transport.connection.create(socket, {
  protocol: 'http2',
  isServer: false
})

// client.start(<version>), 4 for http2, [2,3,3.1] for spdy 2.0, 3.0 and 3.1 respectively
client.start(4)

client.request({ 
  method: 'GET',
  host: 'localhost',
  path: '/',
  headers: {
    a: 'b',
    c: 'd'
   }
 }, function (err, stream) {
  if (err) {
    return console.log(err)
  }

  stream.on('response', function (code, headers) {
    console.log(code, headers)
   
    // request body
    stream.write(<data>)

    // And other node.js Stream APIs
    // ...
  })

  stream.on('readable', function () {
    var chunk = stream.read()
    if (!chunk) {
      return
    }
    console.log(chunk.toString())
  })
})
```

### frame listener

```javascript
// either client or server
connection.on('frame', function (frame) {
  console.log(frame.type)
})
```

## Implementation notes

- spdy-transport always sends a SETTINGS frame as the first frame once the socket is open
- the server requires a http `":method"` and `":path"` header. If they are not added on the client, `"GET"` and `"/"` are added by default

## Interop

`spdy-transport` is capable of interoping with other spdy framing layer implementations such as:

- [spdystream](https://github.com/docker/spdystream), [example](/examples/spdystream-interop)

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2015.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://json.org/
[1]: http://github.com/indutny/bud-backend
[2]: https://github.com/nodejs/io.js
[3]: https://github.com/libuv/libuv
[4]: http://openssl.org/
