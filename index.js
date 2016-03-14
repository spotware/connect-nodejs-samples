var protobuf = require('protobufjs');
var bytebuffer = require('byte');
var chalk = require('chalk');
var protostream = require('protobuf-stream');

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
var SpotBuf = openApiBuilder.build('ProtoOASpotEvent');
var ProtoMessageBuf = commonBuilder.build('ProtoMessage');
var ErrorBuf = commonBuilder.build('ProtoErrorRes');

// Payload Types
var CommonProtoPayloadType = commonBuilder.build('ProtoPayloadType');
var OpenApiProtoPayloadType = openApiBuilder.build('ProtoOAPayloadType');

var wrapMessage = function(data) {
    var protoMessageBuf = new ProtoMessageBuf({
        payloadType: data.payloadType,
        payload: data.toBuffer(),
        clientMsgId: null
    });
    return protoMessageBuf.toBuffer();
};

var getLength = function(msg) {
    var sizeBuf = bytebuffer.allocate(4);
    sizeBuf.putInt(msg.length);
    return sizeBuf.get(0, 4);
};

var pingInterval;
var start = Math.floor(new Date() / 1000);

var Connect = function(params) {
    this.socket = params.socket;
};

Connect.prototype.start = function() {
    var socket = this.socket.connect(API_PORT, API_HOST, function() {
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

    var transport = new protostream.Stream(ProtoMessageBuf, socket, 4);

    transport.on('message', function(data) {
        var msg;
        var payloadType = data.payloadType;
        switch( payloadType ) {
            // Common payload types
            case CommonProtoPayloadType.ERROR_RES:
                console.log( 'ERROR_RES' );
                msg = ErrorBuf.decode(data.payload);
                console.log(chalk.red('Received error response'));
                console.log(chalk.red(msg.description));
                break;
            case CommonProtoPayloadType.HEARTBEAT_EVENT:
                console.log( 'HEARTBEAT_EVENT' );
                break;
            case CommonProtoPayloadType.PING_REQ:
                console.log( 'PING_REQ' );
                break;
            case CommonProtoPayloadType.PING_RES:
                console.log( 'PING_RES' );
                break;
                // Open API payload types
            case OpenApiProtoPayloadType.OA_AUTH_REQ:
                console.log( 'OA_AUTH_REQ');
                break;
            case OpenApiProtoPayloadType.OA_AUTH_RES:
                console.log( 'OA_AUTH_RES');
                // Subscribing for EURUSD spots
                var spotsBuf = new SpotsBuf({
                    payloadType: 'OA_SUBSCRIBE_FOR_SPOTS_REQ',
                    accountId: ACCOUNT_ID,
                    accessToken: ACCOUNT_TOKEN,
                    symblolName: 'EURUSD'
                });
                console.log('Sending subscribe event...');
                msg = wrapMessage(spotsBuf);
                transport.send(msg);
                break;
            case OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_TRADING_EVENTS_REQ:
                console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_TRADING_EVENTS_RES:
                console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_REQ:
                console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_RES:
                console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_GET_SUBSCRIBED_ACCOUNTS_REQ:
                console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_GET_SUBSCRIBED_ACCOUNTS_RES:
                console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_CREATE_ORDER_REQ:
                console.log( 'OA_CREATE_ORDER_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_EXECUTION_EVENT:
                console.log( 'OA_EXECUTION_EVENT' );
                break;
            case OpenApiProtoPayloadType.OA_CANCEL_ORDER_REQ:
                console.log( 'OA_CANCEL_ORDER_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_CLOSE_POSITION_REQ:
                console.log( 'OA_CLOSE_POSITION_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_AMEND_POSITION_SL_TP_REQ:
                console.log( 'OA_AMEND_POSITION_SL_TP_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_AMEND_ORDER_REQ:
                console.log( 'OA_AMEND_ORDER_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_SPOTS_REQ:
                console.log( 'OA_SUBSCRIBE_FOR_SPOTS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_SPOTS_RES:
                console.log( 'OA_SUBSCRIBE_FOR_SPOTS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_SPOTS_REQ:
                console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_SPOTS_RES:
                console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_GET_SPOT_SUBSCRIPTION_REQ:
                console.log( 'OA_GET_SPOT_SUBSCRIPTION_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_GET_SPOT_SUBSCRIPTION_RES:
                console.log( 'OA_GET_SPOT_SUBSCRIPTION_RES' );
                break;
            case OpenApiProtoPayloadType.OA_GET_ALL_SPOT_SUBSCRIPTIONS_REQ:
                console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_REQ' );
                break;
            case OpenApiProtoPayloadType.OA_GET_ALL_SPOT_SUBSCRIPTIONS_RES:
                console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_RES' );
                break;
            case OpenApiProtoPayloadType.OA_SPOT_EVENT:
                console.log( 'OA_SPOT_EVENT' );
                msg = SpotBuf.decode(data.payload);
                console.log(chalk.blue('Bid price: ' + msg.bidPrice + ', ask price: ' + msg.askPrice));
                break;
            default:
                console.log('Received unknown payloadType: ' + payloadType);
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
};

module.exports = Connect;
