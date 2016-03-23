'use strict';

var protobuf = require('protobufjs');
var chalk = require('chalk');
var protostream = require('protobuf-stream');
var onMessage = require('./onmessage');

var CLIENT_ID = '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc';
var CLIENT_SECRET = '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4';

var Connect = function(params) {
    this.gate = params.gate;
    this.host = params.host;
    this.port = params.port;

    this.init();
};

Connect.prototype.init = function () {
    this.bufferLength = new Buffer(4);
    this.socket = undefined;
    this.startTime = undefined;
    this.pingInterval = undefined;
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
    this.socket = this.gate.connect(this.port, this.host, this.onConnect.bind(this));

    var socket = this.socket;

    var transport = new protostream.Stream(this.proto.ProtoMessageBuf, socket, 4);

    transport.on('message', this.onMessage.bind(this));

    socket.on('end', this.onEnd.bind(this));

    socket.on('error', this.onError);
};

Connect.prototype.onConnect = function () {
    var proto = this.proto;
    this.startTime = new Date();
    console.log('Connected');
    this.pingInterval = setInterval(function () {
        var pingBuf = new proto.PingBuf({
            payloadType: 'PING_REQ',
            timestamp: Date.now()
        });
        this.send(pingBuf);
    }.bind(this), 1000);

    var oAuthBuf = new proto.OAuthBuf({
        payloadType: 'OA_AUTH_REQ',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
    });
    this.send(oAuthBuf);
};

Connect.prototype.onEnd = function () {
    var seconds = Math.floor((Date.now() - this.startTime) / 1000);
    console.log('Connection closed in ' + seconds + ' seconds');
    clearInterval(this.pingInterval);
};

Connect.prototype.onError = function (e) {
    console.log(chalk.red(e));
};

Connect.prototype.send = function(msg) {
    msg = this.wrapMessage(msg);
    var buffer = Buffer.concat([this.getLength(msg), msg], 4 + msg.length);
    this.socket.write(buffer);
};

Connect.prototype.wrapMessage = function (data) {
    var protoMessageBuf = new this.proto.ProtoMessageBuf({
        payloadType: data.payloadType,
        payload: data.toBuffer()
    });
    return protoMessageBuf.toBuffer();
};

Connect.prototype.getLength = function (msg) {
    var length = msg.length;
    var bufferLength = this.bufferLength;
    bufferLength.writeInt32BE(length, 0);
    return bufferLength;
};

Connect.prototype.onMessage = onMessage;

module.exports = Connect;
