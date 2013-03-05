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
    filename  : function (req) { 
                  // Function obtaining filename 
                },
    src       : '/path/to/source',
    render    : function (source_path, cb) {
                  // Function render file 
                },
    age       : 86400
  }),
  jade: compile({
    filename  : <RegEx>,
    src       : '/path/to/source',
    render    : function (source_path, cb) {
                  // Function rendering file
                },
    age       : 86400
  })
};

app.use(midware.less);
app.use(midware.jade);
```

Either a function or Regular Expression is accepted as filename parameter.
When using RegEx, a special capture group named as `name` should be defined.

Related Works
-------------

**TODO** Put some projects providing solution to compilers

License
-------

Copyright 2013 Shinone&lt;imandry.c@gmail.com&gt;

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and 
limitations under the License.

