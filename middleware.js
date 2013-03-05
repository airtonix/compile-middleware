var path = require('path');
var Gaze = require('gaze').Gaze;
var should = require('should');

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
            var path = resolve(path.join(src, name + src_ext));
            var cache = cache[path];
            if(cache) {
                res.writeHead(200, headers);
                res.end(cache);
            }
            render(path, function(err, content) {
                if(err) return next(err);
                cache = cache[path] = content;
                if(gaze.watched().indexOf(path) === -1) {
                    // If not watched
                    gaze.add(path, function () { 
                        // Gaze Added
                    });
                }
                res.writeHead(200, headers);
                res.end(cache);
            });
        }else{
            next();
        }

    };

    middleware.close = gaze.close;
    middleware.cache = cache;

    return middleware;
};

module.exports = compile;
