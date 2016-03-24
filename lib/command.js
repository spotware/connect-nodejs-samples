'use strict';

var Command = function (params) {
    this.protoMessage = params.protoMessage;
    this.resolve = [];
};

Command.prototype.then = function (callback) {
    this.resolve.push(callback);
    return this;
};

Command.prototype.done = function (msg) {
    this.resolve.forEach(function (callback) {
        callback(msg);
    });
};

module.exports = Command;
