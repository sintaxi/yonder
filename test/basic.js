
var createRoute = require("../")
var should      = require("should")

var routes = [
{
  route: [302, "/person/:name", "/p/:name"],
  tests: [
    ["/", null],
    ["/person", null],
    ["/person/", null],
    ["/person/fred", "/p/fred"]
  ]
},
{
  route: [301, "/:year/:month/:day/:slug", "/articles/:slug"],
  tests: [
    ["/", null],
    ["/foo", null],
    ["/2012/09/23/hello-world", "/articles/hello-world"]
  ]
}
]

var concat = function(str, len) {
  var len = len || 40
  var remainder = len - str.length
  var padding   = new Array(remainder).join(" ")
  return str + padding
}

routes.forEach(function(route){
  describe("createRoute(" + route.route.join(", ") + ")", function () {
    var r = createRoute.apply(this, route.route)
    route.tests.forEach(function(test){
      it(concat(test[0]) + test[1], function(done){
        if (test[1]) {
          r(test[0]).should.eql({
            pathIn: test[0],
            pathOut: test[1],
            route: route.route
          })
        } else {
          should.not.exist(r(test[0]))
        }
        done()
      })
    })
  })
})
