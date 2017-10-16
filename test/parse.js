var yonder = require("../")
var should = require("should")

describe("file parsing", function(){

  it("should parse basic routers file", function(done){
    var routes = yonder.parse(__dirname + "/examples/ROUTER")
    routes.should.be.instanceof(Array).and.have.lengthOf(4)
    routes.should.eql([
      ["301", "/privacy",         "/privacy-policy"],
      ["301", "/terms",           "/terms-of-use"],
      ["302", "/blog",            "http://medium.com/surge-sh"],
      ["301", "/articles/:slug",  "/:slug"]
    ])
    done()
  })

  it("should be greaceful", function(done){
    var routes = yonder.parse(__dirname + "/examples/ROUTER-non-existing")
    should.not.exist(routes)
    done()
  })

})