'use strict';

var ACCOUNT_ID = 62002;
var ACCOUNT_TOKEN = 'test002_access_token';

var subscribeForSpots = function (symblolName) {
    var name ='ProtoOASubscribeForSpotsReq';
    var ProtoOASubscribeForSpotsReq = this.protoMessagesOpenApi.getMessageByName(name);
    var payloadType = this.protoMessagesOpenApi.getPayloadTypeByName(name);
    var msg = new ProtoOASubscribeForSpotsReq({
        accountId: ACCOUNT_ID,
        accessToken: ACCOUNT_TOKEN,
        symblolName: symblolName
    });
    return this.sendGuaranteedCommand(payloadType, msg);
};

module.exports = subscribeForSpots;
