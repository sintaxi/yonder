

var helpers = require("./helpers")

// createRoute
//
//      302       /articles/:slug        /:slug
//
//       |              |                  |
//    status        inputPattern     outputPattern
//
module.exports = function createRoute(status, inputPattern, outputPattern){
  var re = helpers.path2regexp(inputPattern)

  // route
  //
  //  A route is a function that takes a request path
  //  if the route is a match it returns instructions
  //  for a redirect. If no match, it returns null.
  //
  //  Eg. turns this...
  //
  //    /confessions/jesus-dont-want-me-for-a-sunbeam
  //
  //   into this...
  //
  //    { status: 302, path: "/" }
  //
  //   ...or returns null
  //
  return function route(requestPath){
    var params = helpers.matchURL(requestPath, re)

    if (params) {
      return ({
        pathIn  : requestPath,
        pathOut : helpers.buildPath(outputPattern, params),
        route   : [status, inputPattern, outputPattern]
      })
    } else {
      return null
    }
  }

}
