
var yonder = require("../")
var should = require("should")

describe("basic", function(){

  it("should return perfect match", function(done){
    var location = yonder.match("/foo", { "/foo": { url: "/bar", status: 301 } })
    location.should.have.property("url", "/bar")
    location.should.have.property("status", 301)
    done()
  })

  it("should return null if no match", function(done){
    var location = yonder.match("/heyo", { "/foo": { url: "/bar", status: 301 } })
    should.not.exist(location)
    done()
  })

  // it("should return pattern match", function(done){
  //   var location = yonder.match("/people/fred", { "/people/:name": { url: "/member/:name", status: 301 } })
  //   location.should.have.property("url", "/member/fred")
  //   location.should.have.property("status", 301)
  //   done()
  // })

})
