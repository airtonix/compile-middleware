var path = require('path');
var Gaze = require('gaze').Gaze;

var compile = function (options) {
    options = options || {};
    var filename = options.filename;
    var src_ext = options.src_ext || '';
    var src = options.src;
    var render = options.render;
    var headers = options.headers || {};
    if(typeof src != 'string') 
        throw new Error('src path string is expected');
    if(typeof render != 'function')
        throw new Error('render function is expected');
    if(filename instanceof RegExp) {
        var regex = filename;
        filename = function (req) {
            var match = regex.exec(req.path);
            return match && match[1];
        };
    }
    if(typeof filename != 'function')
        throw new Error('filename RegExp or function is expected');

    var resolve = path.resolve;

    // Map: Filename -> Compile Result
    var cache = {};

    // Forward Map: Filename -> [ Depender ]
    // Backward Map: Depender -> [ Filename ]
    var dependency = {
        forward: {},
        backward: {},
    };

    // FIXME Cannot initialize Gaze without arguments
    var gaze = new Gaze('nothing', function () {
        
        this.on('all', function (event, path) {
            // Remove cache file delete cache[path];
            var targets = dependency.forward[path] || [];
            for(var i = targets.length - 1; i >= 0; i--) {
                var target = targets[i];
                if(dependency.backward[target].indexOf(path) == -1) {
                    delete targets[i];
                }else{
                    delete cache[target];
                }
            }
        });

    }); 

    var middleware = function (req, res, next) {

        if ('GET' != req.method.toUpperCase() && 
            'HEAD' != req.method.toUpperCase()) { 
            return next(); 
        }

        var name = filename(req);
        if(name) {
            var file = resolve(path.join(src, name + src_ext));
            var built = cache[file];
            if(built) {
                res.writeHead(200, headers);
                res.end(built);
            } else {
                var deps = [ file ];
                render(file, function(err, content) {
                    if(err) return next(err);
                    built = cache[file] = content;
                    // Update backward map
                    dependency.backward[file] = deps;
                    deps.forEach(function (dep) {
                        dependency.forward[dep] = dependency.forward[dep] || [];
                        if(dependency.forward[dep].indexOf(dep) == -1) {
                            dependency.forward[dep].push(dep);
                        }
                        if(gaze._patterns.indexOf(dep) === -1) {
                            // If not watched
                            gaze.add(dep, function () { 
                                // Gaze Added
                            });
                        }
                    });
                    res.writeHead(200, headers);
                    res.end(built);
                }, function (dependency) {
                    // Dependency Register
                    if(typeof dependency == 'string') {
                        dependency = [ dependency ];
                    }
                    if(Array.isArray(dependency)) {
                        for(var dep in dependency) {
                            if(deps.indexOf(dep) == -1) {
                                deps.push(dep);
                            }
                        }
                    } 
                });
            }
        }else{
            next();
        }

    };

    middleware.close = gaze.close;
    middleware.cache = cache;

    return middleware;
};

module.exports = compile;
