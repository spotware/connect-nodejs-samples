'use strict';

var chalk = require('chalk');

var ACCOUNT_ID = 62002;
var ACCOUNT_TOKEN = 'test002_access_token';

var onmessage = function (data) {
    var msg;
    var proto = this.proto;
    var payloadType = data.payloadType;
    switch( payloadType ) {
        // Common payload types
        case proto.CommonProtoPayloadType.ERROR_RES:
            console.log( 'ERROR_RES' );
            msg = proto.ErrorBuf.decode(data.payload);
            console.log(chalk.red('Received error response'));
            console.log(chalk.red(msg.description));
            break;
        case proto.CommonProtoPayloadType.HEARTBEAT_EVENT:
            console.log( 'HEARTBEAT_EVENT' );
            break;
        case proto.CommonProtoPayloadType.PING_REQ:
            console.log( 'PING_REQ' );
            break;
        case proto.CommonProtoPayloadType.PING_RES:
            console.log( 'PING_RES' );
            break;
            // Open API payload types
        case proto.OpenApiProtoPayloadType.OA_AUTH_REQ:
            console.log( 'OA_AUTH_REQ');
            break;
        case proto.OpenApiProtoPayloadType.OA_AUTH_RES:
            console.log( 'OA_AUTH_RES');
            // Subscribing for EURUSD spots
            var spotsBuf = new proto.SpotsBuf({
                payloadType: 'OA_SUBSCRIBE_FOR_SPOTS_REQ',
                accountId: ACCOUNT_ID,
                accessToken: ACCOUNT_TOKEN,
                symblolName: 'EURUSD'
            });
            console.log('Sending subscribe event...');
            msg = this.wrapMessage(spotsBuf);
            var socket = this.socket;
            socket.write(this.getLength(msg));
            socket.write(msg);
            break;
        case proto.OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_TRADING_EVENTS_REQ:
            console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_TRADING_EVENTS_RES:
            console.log( 'OA_SUBSCRIBE_FOR_TRADING_EVENTS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_REQ:
            console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_RES:
            console.log( 'OA_UNSUBSCRIBE_FROM_TRADING_EVENTS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_SUBSCRIBED_ACCOUNTS_REQ:
            console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_SUBSCRIBED_ACCOUNTS_RES:
            console.log( 'OA_GET_SUBSCRIBED_ACCOUNTS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_CREATE_ORDER_REQ:
            console.log( 'OA_CREATE_ORDER_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_EXECUTION_EVENT:
            console.log( 'OA_EXECUTION_EVENT' );
            break;
        case proto.OpenApiProtoPayloadType.OA_CANCEL_ORDER_REQ:
            console.log( 'OA_CANCEL_ORDER_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_CLOSE_POSITION_REQ:
            console.log( 'OA_CLOSE_POSITION_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_AMEND_POSITION_SL_TP_REQ:
            console.log( 'OA_AMEND_POSITION_SL_TP_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_AMEND_ORDER_REQ:
            console.log( 'OA_AMEND_ORDER_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_SPOTS_REQ:
            console.log( 'OA_SUBSCRIBE_FOR_SPOTS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_SUBSCRIBE_FOR_SPOTS_RES:
            console.log( 'OA_SUBSCRIBE_FOR_SPOTS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_SPOTS_REQ:
            console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_UNSUBSCRIBE_FROM_SPOTS_RES:
            console.log( 'OA_UNSUBSCRIBE_FROM_SPOTS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_SPOT_SUBSCRIPTION_REQ:
            console.log( 'OA_GET_SPOT_SUBSCRIPTION_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_SPOT_SUBSCRIPTION_RES:
            console.log( 'OA_GET_SPOT_SUBSCRIPTION_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_ALL_SPOT_SUBSCRIPTIONS_REQ:
            console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_REQ' );
            break;
        case proto.OpenApiProtoPayloadType.OA_GET_ALL_SPOT_SUBSCRIPTIONS_RES:
            console.log( 'OA_GET_ALL_SPOT_SUBSCRIPTIONS_RES' );
            break;
        case proto.OpenApiProtoPayloadType.OA_SPOT_EVENT:
            console.log( 'OA_SPOT_EVENT' );
            msg = proto.SpotBuf.decode(data.payload);
            console.log(chalk.blue('Bid price: ' + msg.bidPrice + ', ask price: ' + msg.askPrice));
            break;
        default:
            console.log('Received unknown payloadType: ' + payloadType);
            break;
    }
};

module.exports = onmessage;
