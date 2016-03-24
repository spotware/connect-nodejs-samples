'use strict';

var chalk = require('chalk');
var state = require('./state');

var onError = function (e) {
    this.state = state.disconnected;
    console.log(chalk.red(e));
};

module.exports = onError;
