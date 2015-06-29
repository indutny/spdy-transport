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
      if (err) {
        console.log('It should not err -> ', err)
      }
    });

    parser.once('data', function(frame) {
      // console.log('THE FRAME \n', frame)
      // if (frame.data) {
      //  console.log('hey ', frame.data.toString('hex'))
      // }
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
    // [x] pass with http header
    // [~] pass without http header (apparently it isn't supposed to -
    // github.com/indutny/spdy-transport/issues/1#issuecomment-116108202
    // [ ] fail on stream ID 0
    // [ ] pass on FIN flag
    // [ ] pass on UNIDIRECIONAL flag

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
        type: 'HEADERS' // by spec 'SYN_STREAM'
      }, done);
    })

    /* it('should parse frame without http header', function(done) {
      var cvt = '80030001';
      var flags = '00';
      var len = '000004';
      var sId = '00000001'
      var aToId = '00000000'
      var pri = '00'
      var slot = '00'
      var nVP = '00000000'
      var framehex = cvt + flags + len + sId + aToId + pri + slot + nVP;
      pass(framehex, {}, done)
    }) */
  });

  describe('SYN_REPLY', function() {
    // [x] pass with frame without http headers
    // [ ] pass with frame with http headers
    // [ ] pass with frame with FLAG_FIN
    // [ ] fail with frame with invalid flag

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
        type: 'HEADERS' // by spec SYN_REPLY
      } , done);
    })
  })

  describe('DATA_FRAME', function() {
    // [x] pass with no flags
    // [x] pass with flag fin

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

    // RST_STREAM
    // 800300010000002c0
  })

})
