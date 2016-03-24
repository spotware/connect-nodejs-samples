'use strict';

var startPing = function (interval) {
    var name = 'ProtoPingReq';
    var ProtoPingReq = this.protoMessagesCommon.getMessageByName(name);
    var payloadType = this.protoMessagesCommon.getPayloadTypeByName(name);
    this.pingInterval = setInterval(function () {
        var msg = new ProtoPingReq({
            timestamp: Date.now()
        });
        this.sendGuaranteedCommand(payloadType, msg).then(function () {
            console.log('PING_RES');
        });
    }.bind(this), interval);
};

module.exports = startPing;
