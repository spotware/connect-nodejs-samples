'use strict';

var ProtoMessages = require('connect-protobuf-messages');
var connectJsApi = require('connect-js-api');
var AdapterTLS = connectJsApi.AdapterTLS;
var EncodeDecode = connectJsApi.EncodeDecode;
var Connect = connectJsApi.Connect;
var ping = require('./lib/ping');
var auth = require('./lib/auth');
var subscribeForSpots = require('./lib/subscribe_for_spots');
var startTime;
var protocol = new ProtoMessages([
    {
        file: 'node_modules/connect-protobuf-messages/src/main/protobuf/CommonMessages.proto',
        protoPayloadType: 'ProtoPayloadType'
    },
    {
        file: 'node_modules/connect-protobuf-messages/src/main/protobuf/OpenApiMessages.proto',
        protoPayloadType: 'ProtoOAPayloadType'
    }
]);
var adapter = new AdapterTLS({
    host: 'sandbox-tradeapi.spotware.com',
    port: 5032
});
var encodeDecode = new EncodeDecode();
var connect = new Connect({
    adapter: adapter,
    encodeDecode: encodeDecode,
    protocol: protocol
});

ping = ping.bind(connect);
auth = auth.bind(connect);
subscribeForSpots = subscribeForSpots.bind(connect);

connect.onConnect = function () {
    startTime = Date.now();
    ping(1000);
    auth({
        clientId: '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc',
        clientSecret: '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4'
    }).then(function (respond) {
        console.log('auth');
        subscribeForSpots({
            accountId: 62002,
            accessToken: 'test002_access_token',
            symblolName: 'EURUSD'
        }).then(function (respond) {
            console.log('subscribed for spots');
            connect.on(protocol.getPayloadTypeByName('ProtoOASpotEvent'), function (msg) {
                console.log('Bid price: ' + msg.bidPrice + ', ask price: ' + msg.askPrice);
            });
        });
    });
};

connect.onEnd = function () {
    var seconds = Math.floor((Date.now() - startTime) / 1000);
    console.log('Connection closed in ' + seconds + ' seconds');
    clearInterval(this.pingInterval);
};

connect.onError = function (e) {
    console.log(e);
};

protocol.load();
protocol.build();

connect.start();
