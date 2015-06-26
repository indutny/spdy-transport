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
      console.log("It should not err -> ", err)
    });

    parser.once('data', function(frame) {
      console.log('FRAME: ', frame)
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
  
  describe('SYN_STREAM', function(){
    // 1. pass with http header
    // 2. pass without http header
    // 3. fail on malformed
    // 4. fail on stream ID 0
    // 5. pass on FIN flag
    // 6. pass on UNIDIRECIONAL flag
   
//  it('should parse general frame with http header', function(done) {
    
//  })

    it('should parse general frame without http header', function(done) {
      var cvt = '80030001';
      var flags = '00';
      var len = '000004';
      var sId = '00000001'
      var aToId = '00000000'
      var pri = '00'
      var slot = '00'
      var nVP = '00000000'
      var frame = cvt + flags + len + sId + aToId + pri + slot + nVP;
      pass(nVP, {}, done)
    })
  });
  


})
