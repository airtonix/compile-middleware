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
    var cache = {};

    // FIXME Cannot initialize Gaze without arguments
    var gaze = new Gaze('nothing', function () {
        
        this.on('changed', function (path) {
            // Remove cache file
            delete cache[path];
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
                render(file, function(err, content) {
                    if(err) return next(err);
                    built = cache[file] = content;
                    if(gaze._patterns.indexOf(file) === -1) {
                        // If not watched
                        gaze.add(file, function () { 
                            // Gaze Added
                        });
                    }
                    res.writeHead(200, headers);
                    res.end(built);
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
