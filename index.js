#!/usr/bin/env node

"use strict"

let express = require('express');
let cookieParser = require('cookie-parser');
let api = require('./api');
let utils = require('./utils');
let conf = require('./conf');

let app = express();
app.use(cookieParser());
app.set('trust proxy', conf['trust proxy']);
if (conf['trust proxy']) app.use(utils.trust_proxy_host_port);
app.get("/", api);

const our_port = process.env.PORT || 8080;
app.listen(our_port);
console.warn('Started on port ' + our_port);
