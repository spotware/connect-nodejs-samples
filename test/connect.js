'use strict';

var tls = require('tls');
var Connect = require('../lib/connect');
var state = require('../lib/state');
var ping = require('../lib/ping');
var auth = require('../lib/auth');
var subscribeForSpots = require('../lib/subscribe_for_spots');

describe('Connect', function () {
    var connect;

    beforeAll(function () {
        connect = new Connect({
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
    });

    it('loadProto', function () {
        connect.loadProto();
        var ProtoMessage = connect.protoMessagesCommon.getMessageByName('ProtoMessage');
        var protoMessage = new ProtoMessage({
            payloadType: 1
        });
        expect(protoMessage.payloadType).toBe(1);
    });

    it('onConnect', function (done) {
        connect.onConnect = function () {
            connect.state = state.connected;
            connect.onConnect = Connect.prototype.onConnect;
            done();
        };
        connect.start();
    });

    it('ping', function () {
        spyOn(connect, 'sendGuaranteedCommand');
        ping.call(connect, 1000);
        setTimeout(function () {
            connect.sendGuaranteedCommand.toHaveBeenCalledTimes(5);
        }, 5000);
    });

    it('ping 5 times', function () {
        spyOn(connect, 'sendGuaranteedCommand');
        ping.call(connect, 1000);
        setTimeout(function () {
            connect.sendGuaranteedCommand.toHaveBeenCalledTimes(5);
        }, 5000);
    });

    it('ping', function (done) {
        var name = 'ProtoPingReq';
        var ProtoPingReq = connect.protoMessagesCommon.getMessageByName(name);
        var payloadType = connect.protoMessagesCommon.getPayloadTypeByName(name);
        var msg = new ProtoPingReq({
            timestamp: Date.now()
        });
        connect.sendGuaranteedCommand(payloadType, msg).then(done);
    });

    it('auth', function (done) {
        auth.call(connect).then(done);
    });

    it('subscribeForSpots', function (done) {
        subscribeForSpots.call(connect, 'EURUSD').then(done);
    });

    //it('onError', function () {
    //    var socket = connect.socket;
    //    socket.on('error', function () {
    //        expect(connect.state).toBe(state.disconnected);
    //    });
    //    socket.write(new Buffer(0));
    //});

    //it('start', function () {
    //    connect.start();
    //    expect(connect.socket instanceof tls.TLSSocket).toBeTruthy();
    //});

});
