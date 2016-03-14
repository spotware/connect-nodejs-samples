var tls = require('tls');
var Connect = require('./index');

var connect = new Connect({
    socket: tls
});

connect.start();
