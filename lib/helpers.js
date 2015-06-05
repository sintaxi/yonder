
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

exports.alt = function(path) {
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



exports.buildPath = function(path, params){
  for (var param in params)(function(param){
    var re = new RegExp(":" + param, "g")
    path = path.replace(re, params[param])
  })(param)
  return path
}


/**
 * (from an old version of express by tj.)
 *
 * Expose `pathtoRegexp`.
 *
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

exports.path2regexp = function(path) {
  var keys = []

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .replace(/\/\(/g, '(?:/')
    .replace(/\+/g, '__plus__')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push(key);
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/__plus__/g, '(.+)')
    .replace(/\*/g, '(.*)');

  re = new RegExp('^' + path + '$')
  re.params = keys

  return re
};


Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
}







