'use strict';

var ping = function (interval) {
    var payloadType = this.protocol.getPayloadTypeByName('ProtoPingReq');
    this.pingInterval = setInterval(function () {
        this.sendGuaranteedCommand(payloadType, {
            timestamp: Date.now()
        });
    }.bind(this), interval);
};

module.exports = ping;
