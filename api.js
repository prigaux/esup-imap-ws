"use strict";

let utils = require('./utils');
let imap = require('./imap');
let conf = require('./conf');

const isJsonp = (req) => req.method === 'GET' && req.query.callback

const respondError = (req, res, err) => {
    let msg = {error: "" + err};
    if (err.stack) msg.stack = err.stack;
    res.status(400);
    respondJson(req, res, msg);
};

const respondJson = (req, res, json) => {
    if (isJsonp(req)) {
        res.header('Content-type', 'application/javascript; charset=UTF-8');
        res.send(req.query.callback + '(' + JSON.stringify(json || {}) + ');');  
    } else {
        res.json(json || {});
    }   
};

let gotoCas = (req, res) => {
    res.redirect(`${conf.cas_server}?service=${encodeURIComponent(utils.currentUrl(req))}`);
};

module.exports = (req, res) => {
    let queryTicket = req.query.ticket; // save it, utils.currentUrl will delete it
    let pw = queryTicket ? `${queryTicket} ${utils.currentUrl(req)}` : req.cookies.pw;
    if (!pw) {
        gotoCas(req, res);
        return;
    }

    if (queryTicket) {
        res.cookie('pw', pw, { 
            path: utils.pathname(req),
            httpOnly: true,
            secure: req.protocol === 'https',
        });
    }
    imap.status(res, req.query.user, pw).then(val =>
        respondJson(req, res, val)
    ).catch(err => {
        if (err.match(/AUTHENTICATIONFAILED/) && !queryTicket) {
            // cookies.pw may have been obsolete, ignore it
            gotoCas(req, res);
        } else {
            respondError(req, res, err);
        }
    });
};