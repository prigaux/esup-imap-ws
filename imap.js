"use strict";

let net = require('net');
let conf = require('./conf');

function parse_STATUS(line) {
    let m = line.match(/^\* STATUS (.*?) \((.*)\)$/);
    if (!m) return;

    let kv = m[2].split(' ');
    let vals = {};
    for (let i = 0; i < kv.length; i += 2) {
        vals[kv[i]] = parseInt(kv[i+1]);
    }
    return { [m[1]]: vals };    
}

exports.status = (res, user, password) => new Promise((resolve, reject) => {
    let client = new net.Socket();
    client.connect(conf.imap.port, conf.imap.server, () => {
        client.write(
            `1 LOGIN "${user}" "${password}"` + "\n" +
            '2 STATUS INBOX (RECENT UNSEEN)' + "\n");
    });

    let result = {};
    client.pipe(require('split')()).on('data', (line) => {
        //console.log(line);
        if (line.match(/^\* STATUS /)) {
            result.STATUS = parse_STATUS(line);
        } else if (line.match(/^1 NO/)) {
            reject(line);
        } else if (line.match(/^2 /)) {
            resolve(result);
            client.destroy();
        }
    });
});
