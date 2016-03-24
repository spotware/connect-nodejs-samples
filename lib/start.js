'use strict';

var tls = require('tls');
var Connect = require('./connect');

var connect = new Connect({
    gate: tls,
    host: 'sandbox-tradeapi.spotware.com',
    port: 5032,
    proto: [
        {
            file: 'proto/CommonMessages.proto',
            protoPayloadType: 'ProtoPayloadType'
        },
        {
            file: 'proto/OpenApiMessages.proto',
            protoPayloadType: 'ProtoOAPayloadType'
        }
    ]
});

connect.loadProto();
connect.start();
