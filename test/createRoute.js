
var createRoute = require("../lib/createRoute")
var should = require("should")
var assert = require("assert")

describe("createRoute", function(){

  it("should match all the things", function(done){
    should.not.exist(createRoute(302, "/confessions/:slug", "/:slug")("/heyo"))

    console.log(createRoute(302, "/confessions/:slug", "/:slug")("/confessions/foo"))
    // assert.eql(
    //   ,
    //   { status: 301, path: "/foo" }
    // )

    done()
  })

})
