'use strict';

var state = require('./state');

var onEnd = function () {
    this.state = state.disconnected;
    var seconds = Math.floor((Date.now() - this.startTime) / 1000);
    console.log('Connection closed in ' + seconds + ' seconds');
    clearInterval(this.pingInterval);
};

module.exports = onEnd;
