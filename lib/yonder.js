

var helpers = require("./helpers")
var path    = require("path")
var fs      = require("fs")
var _       = require("underscore")


/**
 * Parse
 *
 * reads and parses a ROUTER file. returns array of routes
 *
 * [
 *   [ '302', '/articles/:slug', '/:slug' ],
 *   [ '301', '/terms', '/terms-of-use' ]
 * ]
 *
 */

var parse = exports.parse = function(routerPath){
  var routes = null

  try {
    var buff  = fs.readFileSync(routerPath)
    var lines = buff.toString().split(/\r?\n/)
    var arrs  = _.compact(lines.map(line2arr))
    routes = arrs
  } catch (e) {}

  return routes
}


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
  return function routeFn(requestPath){
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

// var line2route = exports.line2route = function(line){
//   var arr   = line2arr(line)
//   var route = arr2route(arr)
//   return route
// }

//http://rubular.com/r/Bb52nWP82I
var re = new RegExp(/(\d{3})\s+(\/\S*)\s+(\S+)/)
var line2arr = exports.line2route = function(line){
  var r = re.exec(line)
  if (r) {
    return [r[1], r[2], r[3]]
  } else {
    return null
  }
}

var arr2route = exports.arr2route = function(arr){
  if (arr){
    return createRoute.apply(this, arr)
  } else {
    return function(){ return null }
  }
}


var buff2arrs = exports.buff2arrs = function(buff){
  var arrs = buff.toString().split(/\r?\n/).clean("").map(line2arr)
  return arrs
}

exports.middleware = function(routerPath){

  if (typeof routerPath == 'function') {
    var fetchRoutes = routerPath
  } else {
    // returns array of routes.
    var fetchRoutes = function(req, rsp, cb){
      fs.readFile(path.resolve(routerPath), function(err, buff){
        if (buff) {
          var arrs = buff2arrs(buff)
          return cb(arrs)
        } else {
          return cb(null)
        }
      })
    }
  }

  return function(req, rsp, next){
    fetchRoutes(req, rsp, function(arrs){
      if (arrs === null) return next()

      for (var i = 0; i < arrs.length; i++){
        var redirect = arr2route(arrs[i])(req.url)
        if (redirect !== null) {
          rsp.statusCode = redirect.route[0]
          rsp.setHeader('Location', redirect.pathOut)
          rsp.end("redirecting to " + redirect.pathOut)
          return
        }
      }

      // arrs.forEach(function(arr){

      //   if (redirect !== null) {
      //     rsp.statusCode = redirect.route[0]
      //     rsp.setHeader('Location', redirect.pathOut)
      //     rsp.end("redirecting to " + redirect.pathOut)
      //     return
      //   }
      // })
      return next()
    })
  }

}
