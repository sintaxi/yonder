var express = require("express")
var yonder  = require("../").middleware
var request = require("request")
var port    = 9966

describe("middleware", function(){

  before(function(done){
    express()
      .use(yonder(__dirname + "/examples/blog.redirects"))
      .listen(port, function(){
        done()
      })
  })


  it("should obey redirect", function(done){
    request.get("http://localhost:9966/foo", { followRedirect: false }, function(e,r,b){
      r.statusCode.should.eql(302)
      r.headers.should.have.property("location", "/bar")
      done()
    })
  })

})