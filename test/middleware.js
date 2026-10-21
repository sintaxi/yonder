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

describe("middleware", function(){
  var port    = 9967
  before(function(done){
    express()
      .use(yonder(__dirname + "/examples/ROUTER"))
      .listen(port, function(){
        done()
      })
  })

  it("should obey redirect", function(done){
    request.get("http://localhost:" + port + "/privacy", { followRedirect: false }, function(e,r,b){
      r.statusCode.should.eql(301)
      r.headers.should.have.property("location", "/privacy-policy")
      done()
    })
  })

  it("should obey remote redirect", function(done){
    request.get("http://localhost:" + port + "/blog", { followRedirect: false }, function(e,r,b){
      r.statusCode.should.eql(302)
      r.headers.should.have.property("location", "http://medium.com/surge-sh")
      done()
    })
  })


})


describe("custom middleware", function(){

  var port = 9968
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

describe("guide middleware", function(){

  // the shape knob hands over: routes parsed at publish, status as strings
  var port = 9969
  before(function(done){
    express()
      .use(yonder(function(req, rsp, cb){
        cb([
          ["301", "/tools/hn-popularity/methodology/", "https://popularity.refactoringenglish.com/about/"],
          ["301", "/chapters/:chapter/", "/excerpts/:chapter/"],
          ["301", "/tag/:name", "/tags/:name"]
        ])
      }))
      .use(function(req, rsp){
        rsp.statusCode = 404
        rsp.end("not found")
      })
      .listen(port, function(){
        done()
      })
  })

  var get = function(path, cb){
    request.get("http://localhost:" + port + path, { followRedirect: false }, cb)
  }

  it("should redirect without the trailing slash", function(done){
    get("/tools/hn-popularity/methodology", function(e,r,b){
      r.statusCode.should.eql(301)
      r.headers.should.have.property("location", "https://popularity.refactoringenglish.com/about/")
      done()
    })
  })

  it("should carry the query string", function(done){
    get("/chapters/one?ref=hn", function(e,r,b){
      r.statusCode.should.eql(301)
      r.headers.should.have.property("location", "/excerpts/one/?ref=hn")
      done()
    })
  })

  it("should fall through when nothing matches", function(done){
    get("/chapters", function(e,r,b){
      r.statusCode.should.eql(404)
      done()
    })
  })

  it("should not fail on params outside latin-1", function(done){
    get("/tag/%E2%9C%93", function(e,r,b){
      r.statusCode.should.eql(301)
      r.headers.should.have.property("location", "/tags/%E2%9C%93")
      done()
    })
  })

})
