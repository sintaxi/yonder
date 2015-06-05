
# yonder

> a ROUTER for for serving front-end application

Yonder can be used as express middle...

    var yonder = require("yonder").middleware

    require("express")()
      .use(static(__dirname + "/public"))
      .use(yonder(__dirname + "/public/ROUTER"))
      .listen()


## In your `ROUTER` file...

    301     /:yr/:mo/:dy/:slug       /articles/:slug
    301     /blog?title=:slug        /articles/:slug
    302     /blog                    http://medium.com/sintaxi



