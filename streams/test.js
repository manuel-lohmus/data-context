'use strict';

var fs = require("node:fs");
var { Writable, Readable, EventEmitter } = require("./index");
var DC = require("./../index");
var { parse, parsePromise, stringify } = DC;


var strJSON = `{
  "ess_setpoint_default": 30,
  "inverterPower_default": -1,
  "battery_SOC_limit_default": 75,
  "lastDatePrices": "2024-04-16",
  "2024-04-15T13:00:00Z": {
    "price": 29.94,
    "ess_setpoint": 30,
    "inverterPower": 0,
    "battery_SOC_limit": 75
  },
  "2024-04-15T14:00:00Z": {
    "price": 35.58,
    "ess_setpoint": 30,
    "inverterPower": 0,
    "battery_SOC_limit": 75
  },
  "2024-04-15T15:00:00Z": {
    "price": 80.09,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T16:00:00Z": {
    "price": 124.48,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T17:00:00Z": {
    "price": 135.2,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T18:00:00Z": {
    "price": 136.49,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T19:00:00Z": {
    "price": 114.51,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T20:00:00Z": {
    "price": 93.23,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T21:00:00Z": {
    "price": 87.87,
    "ess_setpoint": -750,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T22:00:00Z": {
    "price": 42.02,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-15T23:00:00Z": {
    "price": 42.01,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T00:00:00Z": {
    "price": 34.09,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T01:00:00Z": {
    "price": 42.01,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T02:00:00Z": {
    "price": 42.06,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T03:00:00Z": {
    "price": 78.05,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T04:00:00Z": {
    "price": 74.15,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T05:00:00Z": {
    "price": 132,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T06:00:00Z": {
    "price": 79.61,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T07:00:00Z": {
    "price": 71.42,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T08:00:00Z": {
    "price": 71.55,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T09:00:00Z": {
    "price": 55.01,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T10:00:00Z": {
    "price": 43.3,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T11:00:00Z": {
    "price": 42.37,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T12:00:00Z": {
    "price": 44.14,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T13:00:00Z": {
    "price": 51.36,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T14:00:00Z": {
    "price": 66.21,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T15:00:00Z": {
    "price": 83.39,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T16:00:00Z": {
    "price": 96.18,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T17:00:00Z": {
    "price": 116,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T18:00:00Z": {
    "price": 124.52,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T19:00:00Z": {
    "price": 112.24,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T20:00:00Z": {
    "price": 95.2,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  },
  "2024-04-16T21:00:00Z": {
    "price": 84.1,
    "ess_setpoint": 30,
    "inverterPower": -1,
    "battery_SOC_limit": 75
  }
}`;
//var readStream = fs.createReadStream("./streams/test.json", { highWaterMark: 5 });
var readStream = new Readable({ highWaterMark: 2 });
//readStream.push('{"s":"a"}');
readStream.push(strJSON);

//var dc = DC({});
//dc.overwritingData(readStream);
var dc;

(async function () {

    dc = await parsePromise(readStream/*, DC*/);
    //parse(strJSON, DC, function (err, val) {

    //    if (err) {

    //        debugger;
    //        console.log(err);
    //    }

    //    dc = val;
    //});

    //var dc = parse(strJSON, DC);

})();

setTimeout(function () { dc; debugger; }, 3000);