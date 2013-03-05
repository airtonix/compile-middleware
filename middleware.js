
var path = require('path');
var gaze = require('gaze');
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

    return function (req, res, next) {

        if ('GET' != req.method.toUpperCase() && 
            'HEAD' != req.method.toUpperCase()) { 
            return next(); 
        }

        var name = filename(req);
        if(name) {
            var path = compile.resolve(path.join(src, name + src_ext));
            var cache = compile.cache[path];
            if(cache) {
                res.writeHead(200, headers);
                res.end(cache);
            }
            compile.render(path, function(err, content) {
                if(err) return next(err);
                cache = compile.cache[path] = content;
                res.writeHead(200, headers);
                res.end(cache);
            });
        }else{
            next();
        }

    };
};

compile.cache = {};

compile.resolve = path.resolve;

module.exports = compile;
