'use strict';

var onMessage = function (data) {
    var payloadType = data.payloadType;
    var clientMsgId = data.clientMsgId;

    var msg = this.protoMessagesOpenApi.getMessageByPayloadType(payloadType) || this.protoMessagesCommon.getMessageByPayloadType(payloadType);

    msg = msg.decode(data.payload);

    if (clientMsgId) {
        this.processMessage(msg, clientMsgId);
    } else {
        this.processPushEvent(msg, payloadType);
    }
};

module.exports = onMessage;
