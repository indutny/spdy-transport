var assert = require('assert');

var transport = require('../../');
var spdy = transport.protocol.spdy;

describe('SPDY Parser', function() {
  var parser;

  beforeEach(function(){
    var pool = spdy.compressionPool.create();
    parser = spdy.parser.create({});
    var comp = pool.get("3.1");
    parser.setCompression(comp);
  });

 function pass(data, expected, done) {
    parser.skipPreface();
    parser.write(new Buffer(data, 'hex'), function (err) { 
      if (err) {
        console.log("It should not err -> ", err)
      } 
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
    // [x] pass with http header
    // [ ] pass without http header
    // [ ] fail on malformed
    // [ ] fail on stream ID 0
    // [ ] pass on FIN flag
    // [ ] pass on UNIDIRECIONAL flag
   
    it('should parse SYN_STREAM frame with http header', function(done) {
      var hexFrame =  '800300010000002c0000000100000000000078' +
                      'f9e3c6a7c202e50e507ab442a45a77d7105006' +
                      'b32a4804974d8cfa00000000ffff';
      
      pass(hexFrame, {
        'fin': false,
        'headers': {
          ':method': 'GET',
          ':path': '/',
        },
        'id': 1,
        'path': '/',
        'priority': {
          'exclusive': false,
          'parent': 0,
          'weight': 1.
        },
        'type': 'SYN_STREAM'
      }, done);
    })

    /*
    it('should parse general frame without http header', function(done) {
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
    })
    */
  });
 
  describe('SYN_REPLY', function() {
    // [x] pass with regular SYN_REPLY 

    it('should parse a SYN_REPLY frame', function(done) {
      // SYN REPLY
      // 80030002000000140000000178f9e3c6a7c202a6230600000000ffff

      var hexFrame = '80030002000000140000000178f9e3c6a7c202a6230600000000ffff'

      pass(hexFrame, {
        "fin": false,
        "headers": {},
        "id": 1,
        "path": undefined,
        "priority": {
          "exclusive": false,
          "parent": 0,
          "weight": 16,
        },
        "type": "SYN_REPLY"
      }
      , done);
    })

  })

  describe('DATA_FRAME', function() {
    // DATA Stream (from client)
    // 000000010000001157726974696e6720746f2073747265616d0000000101000000

    // Data Stream (from server)
    // 000000010000001157726974696e6720746f2073747265616d0000000101000000

  })

})
