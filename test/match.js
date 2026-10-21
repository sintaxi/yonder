
var yonder = require("../")
var should = require("should")

/**
 * match(routes, url)
 *
 * takes the routes list exactly as it is stored on a guide (status is a
 * string when it comes from a parsed ROUTER file) and a raw request url.
 * returns { status, location } for the first rule that applies, or null.
 *
 * rules match on the pathname only. a trailing slash on either side is
 * forgiven, but an exact match anywhere in the list wins over a forgiven
 * one. the query string rides along to the destination.
 *
 */

var expectRedirect = function(routes, url, status, location){
  var result = yonder.match(routes, url)
  should.exist(result, url + " should redirect")
  result.should.eql({ status: status, location: location })
}

var expectNone = function(routes, url){
  should.not.exist(yonder.match(routes, url), url + " should not redirect")
}


describe("match", function(){

  describe("exact paths", function(){
    var routes = [["301", "/contact", "/about"]]

    it("should redirect the path as written", function(){
      expectRedirect(routes, "/contact", "301", "/about")
    })

    it("should not match a longer path", function(){
      expectNone(routes, "/contact-us")
      expectNone(routes, "/contact/form")
    })

    it("should not match a shorter path", function(){
      expectNone(routes, "/")
      expectNone(routes, "/cont")
    })

    it("should return null with no routes", function(){
      expectNone([], "/contact")
      expectNone(null, "/contact")
    })
  })


  describe("trailing slash", function(){

    it("should match /foo/ against a /foo rule", function(){
      var routes = [["301", "/foo", "/bar"]]
      expectRedirect(routes, "/foo", "301", "/bar")
      expectRedirect(routes, "/foo/", "301", "/bar")
    })

    it("should match /foo against a /foo/ rule", function(){
      var routes = [["301", "/foo/", "/bar"]]
      expectRedirect(routes, "/foo/", "301", "/bar")
      expectRedirect(routes, "/foo", "301", "/bar")
    })

    it("should forgive slashes on nested paths", function(){
      var routes = [["301", "/tools/hn-popularity/methodology/", "https://popularity.refactoringenglish.com/about/"]]
      expectRedirect(routes, "/tools/hn-popularity/methodology", "301", "https://popularity.refactoringenglish.com/about/")
      expectRedirect(routes, "/tools/hn-popularity/methodology/", "301", "https://popularity.refactoringenglish.com/about/")
    })

    it("should not forgive more than one slash", function(){
      var routes = [["301", "/foo", "/bar"]]
      expectNone(routes, "/foo//")
    })

    it("should keep the trailing slash out of named params", function(){
      var routes = [["301", "/blog/:slug", "/articles/:slug"]]
      expectRedirect(routes, "/blog/hello", "301", "/articles/hello")
      expectRedirect(routes, "/blog/hello/", "301", "/articles/hello")
    })

    it("should match a param rule written with a trailing slash", function(){
      var routes = [["301", "/chapters/:chapter/", "/excerpts/:chapter/"]]
      expectRedirect(routes, "/chapters/one/", "301", "/excerpts/one/")
      expectRedirect(routes, "/chapters/one", "301", "/excerpts/one/")
    })

    it("should prefer an exact match over a forgiven one", function(){
      var routes = [
        ["301", "/foo",  "/no-slash"],
        ["301", "/foo/", "/with-slash"]
      ]
      expectRedirect(routes, "/foo",  "301", "/no-slash")
      expectRedirect(routes, "/foo/", "301", "/with-slash")
    })

    it("should prefer an exact match even when it comes later", function(){
      var routes = [
        ["301", "/foo/", "/with-slash"],
        ["302", "/foo",  "/no-slash"]
      ]
      expectRedirect(routes, "/foo",  "302", "/no-slash")
      expectRedirect(routes, "/foo/", "301", "/with-slash")
    })

    it("should only match the root rule at the root", function(){
      var routes = [["301", "/", "/home"]]
      expectRedirect(routes, "/", "301", "/home")
      expectNone(routes, "/foo")
    })
  })


  describe("redirecting to itself", function(){

    it("should allow a rule that adds a trailing slash", function(){
      var routes = [["301", "/docs", "/docs/"]]
      expectRedirect(routes, "/docs", "301", "/docs/")
      expectNone(routes, "/docs/")
    })

    it("should allow a rule that removes a trailing slash", function(){
      var routes = [["301", "/docs/", "/docs"]]
      expectRedirect(routes, "/docs/", "301", "/docs")
      expectNone(routes, "/docs")
    })

    it("should never send a path to itself", function(){
      var routes = [["301", "/*", "/foo"]]
      expectNone(routes, "/foo")
      expectNone(routes, "/foo?x=1")
      expectRedirect(routes, "/bar", "301", "/foo")
    })
  })


  describe("query strings", function(){

    it("should match a path that carries a query", function(){
      var routes = [["301", "/foo", "/bar"]]
      expectRedirect(routes, "/foo?utm_source=hn", "301", "/bar?utm_source=hn")
    })

    it("should match a slash-forgiven path that carries a query", function(){
      var routes = [["301", "/tools/hn-popularity/methodology/", "https://popularity.refactoringenglish.com/about/"]]
      expectRedirect(routes, "/tools/hn-popularity/methodology?ref=hn", "301", "https://popularity.refactoringenglish.com/about/?ref=hn")
      expectRedirect(routes, "/tools/hn-popularity/methodology/?ref=hn", "301", "https://popularity.refactoringenglish.com/about/?ref=hn")
    })

    it("should keep every param and its order", function(){
      var routes = [["301", "/foo", "/bar"]]
      expectRedirect(routes, "/foo?b=2&a=1&a=3", "301", "/bar?b=2&a=1&a=3")
    })

    it("should carry the query to an external destination", function(){
      var routes = [["307", "/blog", "https://medium.com/surge-sh"]]
      expectRedirect(routes, "/blog?ref=hn", "307", "https://medium.com/surge-sh?ref=hn")
    })

    it("should append to a destination that has its own query", function(){
      var routes = [["301", "/old", "/new?lang=en"]]
      expectRedirect(routes, "/old", "301", "/new?lang=en")
      expectRedirect(routes, "/old?x=1", "301", "/new?lang=en&x=1")
    })

    it("should keep the query out of named params", function(){
      var routes = [["301", "/blog/:slug", "/articles/:slug"]]
      expectRedirect(routes, "/blog/hello?x=1", "301", "/articles/hello?x=1")
    })

    it("should keep the query out of splats", function(){
      var routes = [["301", "/docs*", "/documentation/"]]
      expectRedirect(routes, "/docs?any=params", "301", "/documentation/?any=params")
    })

    it("should drop an empty query", function(){
      var routes = [["301", "/foo", "/bar"]]
      expectRedirect(routes, "/foo?", "301", "/bar")
    })
  })


  describe("splats", function(){

    it("should fill :splat with what the star matched", function(){
      var routes = [["301", "/chapters/*", "/excerpts/:splat"]]
      expectRedirect(routes, "/chapters/one", "301", "/excerpts/one")
      expectRedirect(routes, "/chapters/one/two", "301", "/excerpts/one/two")
    })

    it("should carry a trailing slash inside the splat", function(){
      var routes = [["301", "/chapters/*", "/excerpts/:splat"]]
      expectRedirect(routes, "/chapters/one/", "301", "/excerpts/one/")
    })

    it("should keep the query out of the splat", function(){
      var routes = [["301", "/chapters/*", "/excerpts/:splat"]]
      expectRedirect(routes, "/chapters/one?ref=hn", "301", "/excerpts/one?ref=hn")
    })

    it("should fill :splat in an external destination", function(){
      var routes = [["301", "/blog/*", "https://medium.com/surge-sh/:splat"]]
      expectRedirect(routes, "/blog/hello-world", "301", "https://medium.com/surge-sh/hello-world")
    })

    it("should fill :splat alongside named params", function(){
      var routes = [["301", "/:lang/docs/*", "/docs/:lang/:splat"]]
      expectRedirect(routes, "/en/docs/cli/publish", "301", "/docs/en/cli/publish")
    })

    it("should fill :splat when the star comes before a named param", function(){
      var routes = [["301", "/*/edit/:id", "/edit/:id/:splat"]]
      expectRedirect(routes, "/posts/2024/edit/7", "301", "/edit/7/posts/2024")
    })

    it("should keep the splat encoded", function(){
      var routes = [["301", "/files/*", "/f/:splat"]]
      expectRedirect(routes, "/files/a%20b.pdf", "301", "/f/a%20b.pdf")
    })

    it("should leave destinations without :splat alone", function(){
      var routes = [["301", "/old/*", "/new"]]
      expectRedirect(routes, "/old/a/b", "301", "/new")
    })
  })


  describe("ordering", function(){

    it("should use the first matching rule", function(){
      var routes = [
        ["302", "/articles/:slug", "/:slug"],
        ["301", "/articles/special", "/special-page"]
      ]
      expectRedirect(routes, "/articles/special", "302", "/special")
    })

    it("should skip rules that do not match", function(){
      var routes = [
        ["301", "/privacy", "/privacy-policy"],
        ["301", "/terms",   "/terms-of-use"]
      ]
      expectRedirect(routes, "/terms", "301", "/terms-of-use")
    })
  })


  describe("encoded paths", function(){

    it("should match percent-encoded rules against the raw request", function(){
      var routes = [["301", "/thanks/Refactoring%20English-excerpt.pdf", "/thanks/Refactoring-English-excerpt.pdf"]]
      expectRedirect(routes, "/thanks/Refactoring%20English-excerpt.pdf", "301", "/thanks/Refactoring-English-excerpt.pdf")
    })

    it("should keep named params encoded in the destination", function(){
      var routes = [["301", "/tag/:name", "/tags/:name"]]
      expectRedirect(routes, "/tag/hello%20world", "301", "/tags/hello%20world")
    })

    it("should not throw on params outside latin-1", function(){
      var routes = [["301", "/tag/:name", "/tags/:name"]]
      expectRedirect(routes, "/tag/%E2%9C%93", "301", "/tags/%E2%9C%93")
    })

    it("should not throw on a malformed escape", function(){
      var routes = [["301", "/tag/:name", "/tags/:name"]]
      expectRedirect(routes, "/tag/%E0%A4%A", "301", "/tags/%E0%A4%A")
    })
  })


  describe("numeric status", function(){

    it("should pass the status through as given", function(){
      var routes = [[302, "/foo", "/bar"]]
      expectRedirect(routes, "/foo", 302, "/bar")
    })
  })

})
