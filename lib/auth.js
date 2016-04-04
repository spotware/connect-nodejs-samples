'use strict';

var auth = function (params) {
    return this.sendGuaranteedCommand(
        this.protocol.getPayloadTypeByName('ProtoOAAuthReq'),
        {
            clientId: params.clientId,
            clientSecret: params.clientSecret
        }
    );
};

module.exports = auth;
