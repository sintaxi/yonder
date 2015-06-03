// module dependencies
var util = require("util");
var assert = require("assert")
var url = require("url")

exports.matchURL = function(path, re) {
    var i = 0
    var result = re.exec(path)
    var params = {}

    // GTFO id no match
    if (!result) return false

    // This means the user original specified a regexp match, not a url
    // string like /:foo/:bar
    if (!re.params) {
      for (i = 1; i < result.length; i++){ params[(i - 1)] = result[i] }
      return (params)
    }

    // This was a static string, like /foo
    if (re.params.length === 0) return (params)

    // This was the "normal" case, of /foo/:id
    re.params.forEach(function (p) {
      if (++i < result.length) params[p] = decodeURIComponent(result[i])
    })

    return (params);
}


/**
 *  Coverts url (String) to (RegExp) with params (Array)
 *
 *  /person/:name/belongings/:item
 *
 *  to..
 *
 *  /^\/+person\/+([^/]*)\/+belongings\/+([^/]*)$/ params: [ 'name', 'item' ]
 *
 */

exports.compileURL = function(path) {
    var params = []
    var pattern = '^'
    var re

    url.parse(path).pathname.split('/').forEach(function (frag) {

        // empty
        if (frag.length <= 0) return false

        pattern += '\\/+';

        if (frag.charAt(0) === ':') {
          var label = frag
          var index = frag.indexOf('(')
          var subexp

          if (index === -1) {
            subexp = '[^/]*'
          } else {
            label = frag.substring(0, index)
            subexp = frag.substring(index + 1, frag.length - 1)
          }

          pattern += '(' + subexp + ')'
          params.push(label.slice(1))
        } else {
          pattern += frag;
        }

        return true
    })

    if (pattern === '^') pattern += '\\/'

    // end
    pattern += '$';

    // RegExp form matching
    re = new RegExp(pattern)

    // attach params
    re.params = params

    return re
}

exports.buildURL = function(path, params){
  for (var param in params)(function(param){
    var re = new RegExp(":" + param, "g")
    path = path.replace(re, params[param])
  })(param)
  return path
}
