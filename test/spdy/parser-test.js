var assert = require('assert');

var transport = require('../../');
var spdy = transport.protocol.spdy;

describe('SPDY Parser', function() {
  var parser;

  beforeEach(function() {
    var pool = spdy.compressionPool.create();
    parser = spdy.parser.create({});
    var comp = pool.get('3.1');
    parser.setCompression(comp);
  });

  function pass(data, expected, done) {
    parser.skipPreface();
    parser.write(new Buffer(data, 'hex'), function (err) {
      if (err) { console.log('Should not err -> ', err) }
    });

    parser.once('data', function(frame) {
      // console.log('THE FRAME \n', frame)
      assert.deepEqual(frame, expected);
      assert.equal(parser.buffer.size, 0);
      done();
    });
  }

  function fail(data, code, re, done) {
    parser.skipPreface();
    parser.write(new Buffer(data, 'hex'), function(err) {
      assert(err);
      assert(err instanceof transport.protocol.base.utils.ProtocolError);
      assert.equal(err.code, spdy.constants.error[code]);
      assert(re.test(err.message), err.message);

      done();
    });
  }

  describe('SYN_STREAM', function() {
    it('should parse frame with http header', function(done) {
      var hexFrame =  '800300010000002c0000000100000000000078' +
                      'f9e3c6a7c202e50e507ab442a45a77d7105006' +
                      'b32a4804974d8cfa00000000ffff';

      pass(hexFrame, {
        fin: false,
        headers: {
          ':method': 'GET',
          ':path': '/'
        },
        id: 1,
        path: '/',
        priority: {
          exclusive: false,
          parent: 0,
          weight: 1.
        },
        type: 'HEADERS', // by spec 'SYN_STREAM'
        writable: true
      }, done);
    })

    it('should fail on stream ID 0', function(done) {
      var hexFrame =  '800300010000002c0000000000000000000078' +
                      'f9e3c6a7c202e50e507ab442a45a77d7105006' +
                      'b32a4804974d8cfa00000000ffff';

      fail(hexFrame, 'PROTOCOL_ERROR', /Invalid*/i, done);
    });

    it('should parse frame with http header and FIN flag', function(done) {
      var hexFrame =  '800300010100002c0000000100000000000078' +
                      'f9e3c6a7c202e50e507ab442a45a77d7105006' +
                      'b32a4804974d8cfa00000000ffff';

      pass(hexFrame, {
        fin: true,
        headers: {
          ':method': 'GET',
          ':path': '/'
        },
        id: 1,
        path: '/',
        priority: {
          exclusive: false,
          parent: 0,
          weight: 1.
        },
        type: 'HEADERS', // by spec 'SYN_STREAM'
        writable: true
      }, done);
    })

    it('should parse frame with unidirectional flag', function(done) {
      var hexFrame =  '800300010200002c0000000100000000000078' +
                      'f9e3c6a7c202e50e507ab442a45a77d7105006' +
                      'b32a4804974d8cfa00000000ffff';

      pass(hexFrame, {
        fin: false,
        headers: {
          ':method': 'GET',
          ':path': '/'
        },
        id: 1,
        path: '/',
        priority: {
          exclusive: false,
          parent: 0,
          weight: 1.
        },
        type: 'HEADERS', // by spec 'SYN_STREAM'
        writable: false
      }, done);
    })

  });

  describe('SYN_REPLY', function() {
    it('should parse a frame without headers', function(done) {
      var hexFrame = '80030002000000140000000178f9e3c6a7c202a6230600000000ffff'

      pass(hexFrame, {
        fin: false,
        headers: {},
        id: 1,
        path: undefined,
        priority: {
          exclusive: false,
          parent: 0,
          weight: 16
        },
        type: 'HEADERS', // by spec SYN_REPLY
        writable: true
      } , done);
    })

    it('should parse a frame with headers', function(done) {
      var hexFrame = '8003000200000057000000013830e3c6a7c2004300bcff' +
          '00000003000000057468657265000000057468657265000000073a737' +
          '46174757300000006323030204f4b000000083a76657273696f6e0000' +
          '0008485454502f312e31000000ffff'

      pass(hexFrame, {
        fin: false,
        headers: {
         ":status": 200,
          there: "there"
        },
        id: 1,
        path: undefined,
        priority: {
          exclusive: false,
          parent: 0,
          weight: 16
        },
        type: 'HEADERS', // by spec SYN_REPLY
        writable: true
      } , done);
    })

    it('should parse frame with FIN_FLAG', function(done) {
      var hexFrame = '80030002010000140000000178f9e3c6a7c202a6230600000000ffff'

      pass(hexFrame, {
        fin: true,
        headers: {},
        id: 1,
        path: undefined,
        priority: {
          exclusive: false,
          parent: 0,
          weight: 16
        },
        type: 'HEADERS', // by spec SYN_REPLY
        writable: true
      } , done);
    })

  })

  describe('DATA_FRAME', function() {
    it('should parse frame with no flags', function(done) {
      var hexFrame = '000000010000001157726974696e6720746f2073747265616d'

      pass(hexFrame, {
        data: new Buffer('57726974696e6720746f2073747265616d', 'hex'),
        fin: false,
        id: 1,
        type: 'DATA'
      }, done);
    })

    it('should parse frame with FLAG_FIN', function(done) {
      var hexFrame = '000000010100001157726974696e6720746f2073747265616d'

      pass(hexFrame, {
        data: new Buffer('57726974696e6720746f2073747265616d', 'hex'),
        fin: true,
        id: 1,
        type: 'DATA'
      }, done);
    })

  })

  describe('RST_STREAM', function() {
    // [ ] pass with frame without flags and status code PROTOCOL_ERROR
    // [ ] pass with frame without flags and status code INVALID_STREAM
    // [ ] pass with frame without flags and status code REFUSED_STREAM
    // [ ] pass with frame without flags and status code UNSUPPORTED_VERSION
    // [ ] pass with frame without flags and status code CANCEL
    // [ ] pass with frame without flags and status code INTERNAL_ERROR
    // [ ] pass with frame without flags and status code FLOW_CONTROL_ERROR
    // [ ] pass with frame without flags and status code STREAM_IN_USE
    // [ ] pass with frame without flags and status code STREAM_ALREADY_CLOSED
    // [ ] pass with frame without flags and status code FRAME_TOO_LARGE
    // [ ] fail with frame without flags and status code 0 (unvalid)
    // [ ] fail with frame with flags (there should be none)
  })


  describe('SETTINGS', function() {
    it('should parse frame', function(done) {
      var hexFrame = '800300040000000c000000010100000700000100'

      pass(hexFrame, {
        settings: {
          initial_window_size: 256
        },
        type: 'SETTINGS'
      }, done);
    })
  })

  describe('PING', function() {
    // [ ] 
  })

  describe('GOAWAY', function() {
    // [ ] 

  })

  describe('HEADERS', function() {
    // [ ] 

  })

  describe('WINDOW_UPDATE', function () {
    // [ ] 
 
  })

})
