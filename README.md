
# yonder

> a ROUTER for for serving front-end application

### API

    // PUBLIC

    yonder.route("path/to/ROUTER")    // middleware where ROUTER is path to file.
    yonder.route(Array)               // middleware where Array is Array of routes.
    yonder.route(Function)            // middleware where Function returns Array of routes.
    yonder.parse(path/to/ROUTER)      // parses ROUTER file and returns array of routes.

    // PRIVATE
    yonder._file2routes               // pass in path to ROUTER file
    yonder._buffer2routes             // pass in file Buffer OR String of a ROUTER file
    yonder._lines2routes              // pass in array of file lines
    yonder._line2route                // pass in line get route


Yonder can be used as express middleware…

    var yonder = require("yonder")

    require("express")()
      .use(static(__dirname + "/public"))
      .use(yonder.route(__dirname + "/public/ROUTER"))
      .listen()


#### In your `ROUTER` file...

    301     /:yr/:mo/:dy/:slug       /articles/:slug
    301     /blog?title=:slug        /articles/:slug
    302     /blog                    http://medium.com/sintaxi

## License

[The MIT License (MIT)](LICENSE.md)

Copyright © 2015 [Chloi Inc.](http://chloi.io) All rights reserved.
