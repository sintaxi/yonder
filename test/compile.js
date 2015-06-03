

var helpers = require("../lib/helpers")


describe("compile", function(){

  it("should have params", function(done){
    var re = helpers.compileURL("/person/:name/belongings/:item")
    re.should.have.property("params")
    re.params.should.be.instanceOf(Array).and.have.lengthOf(2)
    done()
  })

  it("should have params", function(done){
    var re     = helpers.compileURL("/person/:name/belongings/:item")
    var params = helpers.matchURL("/person/brock/belongings/football", re)
    var path   = helpers.buildURL("/p/:name/b/:item", params)
    path.should.eql("/p/brock/b/football")
    done()
  })

})