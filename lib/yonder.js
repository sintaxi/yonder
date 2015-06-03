
exports.match = function(url, routes){

  for (var route in routes) {
    if (route === url) {
      var match = routes[route]
      return match
      break
    }
  }

}