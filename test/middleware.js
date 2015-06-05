var express = require("express")
var yonder  = require("../").middleware
var request = require("request")


describe("middleware", function(){
  var port    = 9966
  before(function(done){
    express()
      .use(yonder(__dirname + "/examples/blog.redirects"))
      .listen(port, function(){
        done()
      })
  })


  it("should obey redirect", function(done){
    request.get("http://localhost:" + port + "/foo", { followRedirect: false }, function(e,r,b){
      r.statusCode.should.eql(302)
      r.headers.should.have.property("location", "/bar")
      done()
    })
  })

})


describe("custom middleware", function(){

  var port = 9967
  before(function(done){
    express()
      .use(yonder(function(req, rsp, cb){
        cb([[302, "/*", "/bar"]])
      }))
      .listen(port, function(){
        done()
      })
  })


  it("should obey redirect", function(done){
    request.get("http://localhost:" + port + "/foo", { followRedirect: false }, function(e,r,b){
      r.statusCode.should.eql(302)
      r.headers.should.have.property("location", "/bar")
      done()
    })
  })

})