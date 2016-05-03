# connect-nodejs-samples
Samples of using [Connect Open API](https://connect.spotware.com/documentation/section/api-reference) in JavaScript and Node.js

## How to get started your own app in JavaScript and Node.js:

* Download and install [Node.js](https://nodejs.org/en)
* Download and install [npm](https://www.npmjs.com)
* Download this example
* In the application folder run the commands:
```shell
    npm install
    npm start
```
* The application will connect to sandbox Open API server, authenticate and subscribe for EURUSD spot prices

![Alt text](http://g.gravizo.com/g?
  digraph usage {
    "connect-js-adapter-tls" -> "connect-js-api";
    "connect-protobuf-messages" -> "connect-js-api";
    "connect-js-encode-decode" -> "connect-js-api";
    "connect-nodejs-samples" [style=filled,color="grey"];
    "connect-js-api" -> "ctrader-telegram-bot";
    "connect-js-api" -> "connect-nodejs-samples";
  }
)
