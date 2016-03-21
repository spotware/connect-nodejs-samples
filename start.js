'use strict';

var tls = require('tls');
var Connect = require('./index');

var connect = new Connect({
    gate: tls,
    host: 'sandbox-tradeapi.spotware.com',
    port: 5032
});

connect.loadProtoFiles();
connect.start();
