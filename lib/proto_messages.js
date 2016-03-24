'use strict';

var protobuf = require('protobufjs');

var ProtoMessages = function (params) {
    this.file = params.file;
    this.protoPayloadType = params.protoPayloadType;
    this.builder = undefined;
    this.payloadTypes = {};
    this.names = {};
};

ProtoMessages.prototype.load = function () {
    this.builder = protobuf.loadProtoFile(this.file);
};

ProtoMessages.prototype.build = function () {
    var builder = this.builder;

    var protoPayloadTypes = builder.build(this.protoPayloadType);

    var messages = builder.ns.children.filter(function (reflect) {
        return (reflect.className === 'Message') && (typeof this.findPayloadType(reflect) === 'number');
    }, this);

    messages.forEach(function (message) {
        var payloadType = this.findPayloadType(message);
        var name = message.name;

        var messageBuilded = builder.build(name);

        this.names[name] = {
            messageBuilded: messageBuilded,
            payloadType: payloadType
        };
        this.payloadTypes[payloadType] = {
            messageBuilded: messageBuilded,
            name: name
        };
    }, this);

    this.buildWrapper();
};

ProtoMessages.prototype.buildWrapper = function () {
    var name = 'ProtoMessage';
    var messageBuilded = this.builder.build(name);
    this.names[name] = {
        messageBuilded: messageBuilded,
        payloadType: undefined
    };
};

ProtoMessages.prototype.findPayloadType = function (message) {
    var field = message.children.find(function (field) {
        return field.name === 'payloadType';
    });

    if (field) {
        return field.defaultValue;
    }
};

ProtoMessages.prototype.getMessageByPayloadType = function (payloadType) {
    payloadType = this.payloadTypes[payloadType];
    if (payloadType) {
        return payloadType.messageBuilded;
    }
};

ProtoMessages.prototype.getMessageByName = function (name) {
    name = this.names[name];
    if (name) {
        return name.messageBuilded;
    }
};

ProtoMessages.prototype.getPayloadTypeByName = function (name) {
    name = this.names[name];
    if (name) {
        return name.payloadType;
    }
};

ProtoMessages.prototype.getNameByPayloadType = function (payloadType) {
    payloadType = this.payloadTypes[payloadType];
    if (payloadType) {
        return payloadType.name;
    }
};

module.exports = ProtoMessages;
