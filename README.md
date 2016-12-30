# yonder

> a ROUTER for serving front-end applications

### API

    // PUBLIC
    yonder.middleware("path/to/ROUTER")    // middleware where ROUTER is path to file.
    yonder.middleware(Array)               // middleware where Array is Array of routes.
    yonder.middleware(Function)            // middleware where Function returns Array of routes.
    yonder.middleware(path/to/ROUTER)      // parses ROUTER file and returns Array of routes.

    // PRIVATE
    yonder.arr2route                       // pass in Array of file lines to get route.
    yonder.line2route                      // pass in line to get route.


Yonder can be used as [express](https://expressjs.com/) middleware…

    var yonder = require("yonder")

    require("express")()
      .use(static(__dirname + "/public"))
      .use(yonder.middleware(__dirname + "/public/ROUTER"))
      .listen()

#### In your `ROUTER` file…

    301     /:yr/:mo/:dy/:slug       /articles/:slug
    301     /blog?title=:slug        /articles/:slug
    302     /blog                    http://medium.com/sintaxi

## License

[The MIT License (MIT)](LICENSE.md)

Copyright © 2015 [Chloi Inc.](http://chloi.io) All rights reserved.
