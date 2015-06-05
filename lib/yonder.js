

var helpers = require("./helpers")
var path    = require("path")
var fs      = require("fs")

// createRoute
//
//      302       /articles/:slug        /:slug
//
//       |              |                  |
//    status        inputPattern     outputPattern
//
var createRoute = exports.createRoute = function(status, inputPattern, outputPattern){
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
      var pathOut = helpers.buildPath(outputPattern, params)

      // we dont want to redirect to the same path
      if (pathOut === requestPath) return null

      return ({
        pathIn  : requestPath,
        pathOut : pathOut,
        route   : [status, inputPattern, outputPattern]
      })
    }

    return null
  }

}



//http://rubular.com/r/Bb52nWP82I
var line2route = exports.line2route = function(line){
  var re = new RegExp(/(\d{3})\s+(\/\S*)\s+(\S+)/)
  var r = re.exec(line)

  if (r){
    return createRoute(r[1], r[2], r[3])
  } else {
    return function(){ return null }
  }
}


exports.middleware = function(routerPath){
  var routerPath = path.resolve(routerPath)

  return function(req, rsp, next){
    fs.readFile(routerPath, function(err, buff){
      if (err || buff == undefined) return next()

      // sync
      if (buff) {
        buff.toString().split(/\r?\n/).clean("").forEach(function(line){
          var redirect = line2route(line)(req.url)
          if (redirect !== null) {
            rsp.statusCode = redirect.route[0]
            rsp.setHeader('Location', redirect.pathOut)
            rsp.send("redirecting to " + redirect.pathOut)
            return
          }
        })
      }


      return next()
    })
  }

}
