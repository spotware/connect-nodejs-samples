'use strict';

var tls = require('tls');
var Connect = require('../index');

describe('Connect', function () {
    var connect;

    beforeAll(function () {
        connect = new Connect({
            gate: tls,
            host: 'sandbox-tradeapi.spotware.com',
            port: 5032
        });
    });

    it('loadProtoFiles', function () {
        connect.loadProtoFiles();

        var proto = connect.proto;

        expect(proto.commonBuilder).toBeDefined();
        expect(proto.openApiBuilder).toBeDefined();
        expect(proto.PingBuf).toBeDefined();
        expect(proto.OAuthBuf).toBeDefined();
        expect(proto.SpotsBuf).toBeDefined();
        expect(proto.SpotBuf).toBeDefined();
        expect(proto.ProtoMessageBuf).toBeDefined();
        expect(proto.ErrorBuf).toBeDefined();
        expect(proto.CommonProtoPayloadType).toBeDefined();
        expect(proto.OpenApiProtoPayloadType).toBeDefined();
    });

    it('start', function (done) {
        connect.start();
        done();
    });

});
