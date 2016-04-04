'use strict';

var protostream = require('protobuf-stream');
var hat = require('hat');
var chalk = require('chalk');
var ProtoMessages = require('./proto_messages');
var ping = require('./ping');
var auth = require('./auth');
var onEnd = require('./onend');
var onError = require('./onerror');
var onMessage = require('./onmessage');
var state = require('./state');
var Command = require('./command');
var subscribeForSpots = require('./subscribe_for_spots');

var Connect = function (params) {
    this.gate = params.gate;
    this.host = params.host;
    this.port = params.port;
    this.proto = params.proto;

    this.init();
};

Connect.prototype.init = function () {
    this.socket = undefined;
    this.startTime = undefined;
    this.pingInterval = undefined;
    this.state = state.disconnect;
    this.openCommands = [];

    this.setupBufferLength();
};

Connect.prototype.setupBufferLength = function () {
    this.bufferLength = new Buffer(4);
};

Connect.prototype.loadProto = function () {
    this.loadProtoMessagesCommon(this.proto[0]);
    this.loadProtoMessagesOpenApi(this.proto[1]);
};

Connect.prototype.loadProtoMessagesCommon = function (config) {
    this.protoMessagesCommon = new ProtoMessages(config);
    this.protoMessagesCommon.load();
    this.protoMessagesCommon.build();
};

Connect.prototype.loadProtoMessagesOpenApi = function (config) {
    this.protoMessagesOpenApi = new ProtoMessages(config);
    this.protoMessagesOpenApi.load();
    this.protoMessagesOpenApi.build();
};

Connect.prototype.start = function () {
    this.socket = this.gate.connect(this.port, this.host, this.onConnect.bind(this));

    var socket = this.socket;

    var ProtoMessage = this.protoMessagesCommon.getMessageByName('ProtoMessage');

    var transport = new protostream.Stream(ProtoMessage, socket, 4);

    transport.on('message', this.onMessage.bind(this));

    socket.on('end', this.onEnd.bind(this));
    socket.on('error', this.onError);
};

Connect.prototype.onConnect = function () {
    this.startTime = new Date();
    console.log('Connected');
    this.state = state.connected;

    this.ping(1000);
    this.auth().then(function () {
        this.subscribeForSpots('EURUSD');
    }.bind(this));
};

Connect.prototype.ping = ping;

Connect.prototype.auth = auth;

Connect.prototype.subscribeForSpots = subscribeForSpots;

Connect.prototype.onEnd = onEnd;

Connect.prototype.onError = onError;

Connect.prototype.isConnected = function () {
    return this.state === state.connected;
};

Connect.prototype.sendGuaranteedCommand = function (payloadType, msg) {
    var ProtoMessage = this.protoMessagesCommon.getMessageByName('ProtoMessage');
    var protoMessage = new ProtoMessage({
        payloadType: payloadType,
        payload: msg.toBuffer(),
        clientMsgId: hat()
    });

    var command = new Command({
        protoMessage: protoMessage
    });

    this.openCommands.push(command);

    if (this.isConnected()) {
        this.sendCommand(protoMessage.toBuffer());
    }
    return command;
};

Connect.prototype.sendCommand = function(msg) {
    var buffer = Buffer.concat([this.getLength(msg), msg], 4 + msg.length);
    this.socket.write(buffer);
};

Connect.prototype.getLength = function (msg) {
    var length = msg.length;
    var bufferLength = this.bufferLength;
    bufferLength.writeInt32BE(length, 0);
    return bufferLength;
};

Connect.prototype.onMessage = onMessage;

Connect.prototype.processMessage = function (msg, clientMsgId) {
    var command = this.findCommand(clientMsgId);
    command.done(msg);
    this.deleteCommand(command);
};

Connect.prototype.processPushEvent = function (msg, payloadType) {
    var protoMessagesCommon = this.protoMessagesCommon;
    var protoMessagesOpenApi = this.protoMessagesOpenApi;

    if (payloadType === protoMessagesOpenApi.getPayloadTypeByName('ProtoOASpotEvent')) {
        console.log('OA_SPOT_EVENT');
        console.log(chalk.blue('Bid price: ' + msg.bidPrice + ', ask price: ' + msg.askPrice));
    } else if (payloadType === protoMessagesCommon.getPayloadTypeByName('ProtoHeartbeatEvent')) {
        console.log('HEARTBEAT_EVENT');
    }
};

Connect.prototype.findCommand = function (clientMsgId) {
    return this.openCommands.find(function (command) {
        return command.protoMessage.clientMsgId === clientMsgId;
    });
};

Connect.prototype.deleteCommand = function (command) {
    var index = this.openCommands.indexOf(command);
    this.openCommands.splice(index, 1);
};

module.exports = Connect;
