
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
},

{
  route: [301, "/*", "/foo"],
  tests: [
    ["/", "/foo"],
    ["/foo", null], // we dont want to redirect to the same path
    ["/2012/09/23/hello-world", "/foo"]
  ]
},

{
  route: [301, "/foo*", "/bar"],
  tests: [
    ["/", null],
    ["/foo", "/bar"],
    ["/foobar", "/bar"],
    ["/2012/09/23/hello-world", null]
  ]
},

{
  route: [301, "/foo/+", "/foo/bar/baz"],
  tests: [
    ["/", null],
    ["/foo", null],
    ["/foo/", null],
    ["/foo/hello-world", "/foo/bar/baz"],
    ["/foo/hello/world", "/foo/bar/baz"]
  ]
},

{
  route: [301, "/person?name=:name", "/p/:name"],
  tests: [
    //["/person?name=fred", "/p/fred"]
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

  var title = route.route.map(function(r, i){
    if (i === 0) {
      return concat(r.toString(), 10)
    } else if (i === 1) {
      return concat(r.toString(), 30)
    } else if (i == 2) {
      return r
    }
  }).join(" ")

  describe(title, function () {
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
