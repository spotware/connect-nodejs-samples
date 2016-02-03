var logTraffic;
var logData;

process.argv.forEach(function(arg){
    logAllTraffic = logTraffic || (arg == 'logAllTraffic');
});


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

// Common Buffers
var PingBuf = commonBuilder.build('ProtoPingReq');
var ProtoPayloadType = commonBuilder.build('ProtoPayloadType');
var ProtoMessageBuf = commonBuilder.build('ProtoMessage');
var ErrorBuf = commonBuilder.build('ProtoErrorRes');

//API Buffers
var ProtoOAPayloadType = openApiBuilder.build('ProtoOAPayloadType');
var OAuthBuf = openApiBuilder.build('ProtoOAAuthReq');
var SpotsBuf = openApiBuilder.build('ProtoOASubscribeForSpotsReq');
var SpotBuf = openApiBuilder.build('ProtoOASpotEvent');


var pingInterval;
var start = Math.floor(new Date() / 1000);
var prevBidPrice, prevAskPrice;

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
        case ProtoPayloadType.ERROR_RES:
            var msg = ErrorBuf.decode(data.payload);
            console.log(chalk.red('Received error response'));
            console.log(chalk.red(msg.description));

            break;
        case ProtoOAPayloadType.OA_AUTH_RES:
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
        case ProtoOAPayloadType.OA_SPOT_EVENT:
            var msg = SpotBuf.decode(data.payload);
            console.log('Bid price: ' + formatPrice(msg.bidPrice, prevBidPrice) + ', ask price: ' + formatPrice(msg.askPrice, prevAskPrice));
            prevBidPrice = msg.bidPrice;
            prevAskPrice = msg.askPrice;

            break;
        default:
            //if passed parameter logAllTraffic, the app will log even PING requests.
            logAllTraffic && console.log('Received misc payloadType: ' + payloadType);
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

/***
 * Returns colored price according its previous value. Green if the price was less or equal, otherwise red.
 * @param price
 * @param prevPrice
 * @returns {*}
 */
function formatPrice(price, prevPrice) {
    return (prevPrice <= price) ?  chalk.green(price) : chalk.red(price);
}

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
