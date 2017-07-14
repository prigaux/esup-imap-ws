"use strict";

var querystring = require('querystring');
var url = require("url");

// workaround X-Forwarded-Port not handled by expressjs "trust proxy"
// useful for cas "authenticate" or "gateway" middleware
exports.trust_proxy_host_port = (req, res, next) => {
    let host = req.hostname;
    let port = req.headers['x-forwarded-port'];
    if (port) {
        if (req.protocol === 'http' && port == '80' ||
            req.protocol === 'https' && port == '443') {
            // no port
        } else {
            host = host + ':' + port;
        }
        req.headers.host = host;
    }
    next();
};

exports.pathname = (req) => (
    url.parse(req.originalUrl).pathname
);

// from connect-cas
exports.currentUrl = function(req){
    var query = req.query;
    if (query.ticket) delete query.ticket;
    var qs = querystring.stringify(query);
    return req.protocol + '://' + req.get('host') + exports.pathname(req) + (qs ? '?' + qs  : '');
};