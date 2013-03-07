Compile
=======

Generic Express.js/Connect middleware handling runtime compilization tasks.

Feature
-------

* Compile source file on requested

* Cache the compiled data for next request

* Watch for source file changes

  Once the source file is changed, cache is invalidated.

Usage
-----

```javascript
var compile = require('compile-middleware');
var midware = {
  less: compile({
    filename  : function (req) {            // Source filename resolve
                  // Function obtaining filename 
                },
    src       : '/path/to/source',          // Path to source file
    render    : function (source_path, cb) {
                  // Function render file 
                },
  }),
  jade: compile({
    filename  : /(?:\/runtime\/)(.*).js/gi, // Capture group 1 will be used
    src_ext   : '.jade',                    // Optional, Default ''
    src       : '/path/to/source',
    render    : function (source_path, cb) {
                  // Function rendering file
                },
    headers   : {                           // Optional, HTTP Headers
                  'Cache-Control': 'public, max-age=86400',
                  'Content-Type': 'text/javascript' 
                }
  })
};

app.use(midware.less);
app.use(midware.jade);
```

Either a function or Regular Expression is accepted as filename parameter.
When using RegEx, the first capture group will be used as the name of source
file. A suffix to filename can be defined by `src_ext`.

Related Works
-------------

* [Compile-Middleware for Jade-Runtime](http://github.com/shinohane/compile-mw-jade-runtime)

* [Compile-Middleware for LESS](http://github.com/shinohane/compile-mw-less)

License
-------

Copyright 2013 Shinohane&lt;imandry.c@gmail.com&gt;

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and 
limitations under the License.

