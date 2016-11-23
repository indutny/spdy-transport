var tcp = require('net')
var transport = require('spdy-transport')

var socket = tcp.connect({port: 9090}, function () {

  var client = transport.connection.create(socket, {
    protocol: 'spdy',
    isServer: false
  })

  client.on('frame', function (frame) {
    console.log(frame.type)
  })

  client.start(3.1)

  client.request({ 
    method: 'GET',
    host: 'localhost',
    path: '/',
    headers: {
      a: 'b'
    }}, function (err, stream) {
      console.log('stream established') 
      if (err) {
        return console.log(err)
      }
      stream.write('Hey, how is it going. (node client asking)!')

      stream.on('readable', function () {
        var chunk = stream.read()
        if (!chunk) {
          return
        }
        console.log(chunk.toString())
      })

    stream.on('response', function (code, headers) {
      console.log(code, headers)
    })
  })
})
