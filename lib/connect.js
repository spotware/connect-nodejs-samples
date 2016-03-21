'use strict';

var protobuf = require('protobufjs');
var chalk = require('chalk');
var protostream = require('protobuf-stream');
var onmessage = require('./onmessage');

var CLIENT_ID = '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc';
var CLIENT_SECRET = '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4';

var Connect = function(params) {
    this.gate = params.gate;
    this.host = params.host;
    this.port = params.port;
    this.bufferLength = new Buffer(4);
};

Connect.prototype.loadProtoFiles = function () {
    var proto = {};

    var commonBuilder = protobuf.loadProtoFile('proto/CommonMessages.proto');
    var openApiBuilder = protobuf.loadProtoFile('proto/OpenApiMessages.proto');

    proto.commonBuilder = commonBuilder;
    proto.openApiBuilder = openApiBuilder;

    proto.PingBuf = commonBuilder.build('ProtoPingReq');
    proto.OAuthBuf = openApiBuilder.build('ProtoOAAuthReq');
    proto.SpotsBuf = openApiBuilder.build('ProtoOASubscribeForSpotsReq');
    proto.SpotBuf = openApiBuilder.build('ProtoOASpotEvent');
    proto.ProtoMessageBuf = commonBuilder.build('ProtoMessage');
    proto.ErrorBuf = commonBuilder.build('ProtoErrorRes');

    proto.CommonProtoPayloadType = commonBuilder.build('ProtoPayloadType');
    proto.OpenApiProtoPayloadType = openApiBuilder.build('ProtoOAPayloadType');

    this.proto = proto;
};

Connect.prototype.start = function() {
    var pingInterval;
    var startTime;
    var proto = this.proto;

    var socket = this.gate.connect(this.port, this.host, function () {
        startTime = new Date();
        console.log('Connected');
        // Sending pings in a loop
        pingInterval = setInterval(function() {
            var pingBuf = new proto.PingBuf({
                payloadType: 'PING_REQ',
                timestamp: Math.floor(new Date())
            });
            var msg = this.wrapMessage(pingBuf);

            socket.write(this.getLength(msg));
            socket.write(msg);
        }.bind(this), 1000);
        // Authenticating
        var oAuthBuf = new proto.OAuthBuf({
            payloadType: 'OA_AUTH_REQ',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        });
        console.log('Sending auth Request...');
        var msg = this.wrapMessage(oAuthBuf);
        socket.write(this.getLength(msg));
        socket.write(msg);
    }.bind(this));

    this.socket = socket;

    var transport = new protostream.Stream(proto.ProtoMessageBuf, socket, 4);

    transport.on('message', this.onmessage.bind(this));

    socket.on('end', function() {
        var finishTime = new Date();
        var seconds = Math.floor((finishTime - startTime) / 1000);
        console.log('Connection closed in ' + seconds + ' seconds');
        clearInterval(pingInterval);
    });

    socket.on('error', function(e) {
        console.log(chalk.red(e));
    });
};

Connect.prototype.onmessage = onmessage;

Connect.prototype.getLength = function (msg) {
    var length = msg.length;
    var bufferLength = this.bufferLength;
    bufferLength.writeInt32BE(length, 0);
    return bufferLength;
};

Connect.prototype.wrapMessage = function (data) {
    var protoMessageBuf = new this.proto.ProtoMessageBuf({
        payloadType: data.payloadType,
        payload: data.toBuffer()
    });
    return protoMessageBuf.toBuffer();
};

module.exports = Connect;
