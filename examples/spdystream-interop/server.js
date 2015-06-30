var tcp = require('net')
var transport = require('spdy-transport')

tcp.createServer(function (socket) {
  var server = transport.connection.create(socket, {
    protocol: 'spdy',
    isServer: true
  })

  server.on('stream', function (stream) {
    console.log(stream.method, stream.path, stream.headers)

    stream.respond(200, {
      c: 'd'
    }) 
    stream.write('Hey, how is it going? (node server asking')

    stream.on('readable', function () {
      var chunk = stream.read()
      if (!chunk) {
        return
      }
      console.log(chunk.toString())
    })

    stream.on('end', function () {
      console.log('end')
    })
  })

}).listen(9090)

