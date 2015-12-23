var protobuf = require('protobufjs');
var bytebuffer = require('byte');
var tls = require('tls');
var chalk = require('chalk');

var API_HOST = 'sandbox-tradeapi.spotware.com';
var API_PORT = 5032;
var CLIENT_ID = '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc';
var CLIENT_SECRET = '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4';
var ACCOUNT_ID = 62002;
var ACCOUNT_TOKEN = 'test002_access_token';

// Proto Message Builds
var commonBuilder = protobuf.loadProtoFile('proto/CommonMessages.proto');
var openApiBuilder = protobuf.loadProtoFile('proto/OpenApiMessages.proto');


// Buffers
var PingBuf = commonBuilder.build('ProtoPingReq');
var OAuthBuf = openApiBuilder.build('ProtoOAAuthReq');
var SpotsBuf = openApiBuilder.build('ProtoOASubscribeForSpotsReq');
var ProtoMessageBuf = commonBuilder.build('ProtoMessage');
var ErrorBuf = commonBuilder.build('ProtoErrorRes');


var pingInterval;
var start = Math.floor(new Date() / 1000);

var socket = tls.connect(API_PORT, API_HOST, function() {
    console.log('Connected');
    // Sending pings in a loop
    pingInterval = setInterval(function() {
        var pingBuf = new PingBuf({
            payloadType: 'PING_REQ',
            timestamp: Math.floor(new Date())
        });
        //console.log('Sending ping...');
        var msg = wrapMessage(pingBuf);
        socket.write(getLength(msg));
        socket.write(msg);
    }, 1000);
    // Authenticating
    var oAuthBuf = new OAuthBuf({
        payloadType: 'OA_AUTH_REQ',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });
    console.log('Sending auth Request...');
    var msg = wrapMessage(oAuthBuf);
    socket.write(getLength(msg));
    socket.write(msg);
});

socket.on('readable', function() {
    var length = new Buffer(socket.read(4)).readInt32BE(0);
    var data = socket.read(length);

    data = ProtoMessageBuf.decode(data);
    var payloadType = data.payloadType;

    switch( payloadType ) {
        case 50:
            console.log( 'ERROR_RES' );

            var msg = ErrorBuf.decode(data.payload);
            console.log(chalk.red('Received error response'));
            console.log(chalk.red(msg.description));

            break;
        case 51:
            console.log( 'HEARTBEAT_EVENT' );
            break;
        case 52:
            console.log( 'PING_REQ' );
            break;
        case 53:
            console.log( 'PING_RES' );
            break;
        case 2000:
            console.log( 'AUTH REQ');
            break;
        case 2001:
            console.log( 'AUTH RES');

            // Subscribing for EURUSD spots

            var spotsBuf = new SpotsBuf({
                payloadType: 'OA_SUBSCRIBE_FOR_SPOTS_REQ',
                accountId: ACCOUNT_ID,
                accessToken: ACCOUNT_TOKEN,
                symblolName: 'EURUSD'
            });
            console.log('Sending subscribe event...');
            var msg = wrapMessage(spotsBuf);
            socket.write(getLength(msg));
            socket.write(msg);

            break;
        case 2002:
            console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_REQ' );
            break;
        case 2003:
            console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_RES' );
            break;
        case 2004:
            console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_REQ' );
            break;
        case 2005:
            console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_RES' );
            break;
        case 2006:
            console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_REQ' );
            break;
        case 2007:
            console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_RES' )
            break;
        case 2013:
            console.log( 'OA_CREATE_ORDER_REQ' );
            break;
        case 2016:
            console.log( 'OA_EXECUTION_EVENT' );
            break;
        case 2017:
            console.log( 'OA_CANCEL_ORDER_REQ' );
            break;
        case 2018:
            console.log( 'OA_CLOSE_POSITION_REQ' );
            break;
        case 2019:
            console.log( 'OA_AMEND_POSITION_SL_TP_REQ' );
            break;
        case 2020:
            console.log( 'OA_AMEND_ORDER_REQ' );
            break;
        case 2021:
            console.log( 'OA_SUBSCRIBE_FOR_SPOTS_REQ' );
            break;
        case 2022:
            console.log( 'OA_SUBSCRIBE_FOR_SPOTS_RES' );
            break;
        case 2023:
            console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_REQ' );
            break;
        case 2024:
            console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_RES' );
            break;
        case 2025:
            console.log( 'OA_GET_SPOT_SUBSCRIPTION_REQ' );
            break;
        case 2026:
            console.log( 'OA_GET_SPOT_SUBSCRIPTION_RES' );
            break;
        case 2027:
            console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_REQ' );
            break;
        case 2028:
            console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_RES' );
            break;
        case 2029:
            console.log( 'OA_SPOT_EVENT' );

            var msg = SpotBuf.decode(data.payload);
            console.log(chalk.blue('Bid price: ' + msg.bidPrice + ', ask price: ' + msg.askPrice));

            break;
        default:
            console.log('Received misc payloadType: ' + payloadType);
            break;
    }

});

socket.on('end', function() {
    var finish = Math.floor(new Date() / 1000);
    var secs = finish - start;
    console.log('Connection closed in ' + secs.toString() + ' secs');
    clearInterval(pingInterval);
});

socket.on('error', function(e) {
    console.log(chalk.red(e));
});

function wrapMessage(data) {
    var protoMessageBuf = new ProtoMessageBuf({
        payloadType: data.payloadType,
        payload: data.toBuffer(),
        clientMsgId: null
    });
    return protoMessageBuf.toBuffer();
}

function getLength(msg) {
    var sizeBuf = bytebuffer.allocate(4);
    sizeBuf.putInt(msg.length);
    return sizeBuf.get(0, 4);
}
