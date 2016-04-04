'use strict';

var subscribeForSpots = function (params) {
    return this.sendGuaranteedCommand(
        this.protocol.getPayloadTypeByName('ProtoOASubscribeForSpotsReq'),
        {
            accountId: params.accountId,
            accessToken: params.accessToken,
            symblolName: params.symblolName
        }
    );
};

module.exports = subscribeForSpots;
