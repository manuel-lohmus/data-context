/**  Copyright (c) Manuel Lõhmus (MIT). */

"use strict";

importModules(["data-context"], function (DC) {

    var { parse, stringify } = DC;

    /***** Init TESTS *********************************************************/
    testRunner('Init TESTS                    ', { skip: false }, (test) => {
        // UNDEFINED
        test('DC(undefined)                 ', { skip: false }, (check) => {
            return check(DC(undefined)).mustBe(undefined);
        });
        // NULL
        test('DC(null)                      ', { skip: false }, (check) => {
            return check(DC(null)).mustBe(null);
        });
        // BOOLEAN
        test('DC(false)                     ', { skip: false }, (check) => {
            return check(DC(false).valueOf()).mustBe(false);
        });
        test('DC(true)                      ', { skip: false }, (check) => {
            return check(DC(true).valueOf()).mustBe(true);
        });
        // NUMBER
        test('DC(123)                       ', { skip: false }, (check) => {
            return check(DC(123).valueOf()).mustBe(123);
        });
        test('DC(-456)                      ', { skip: false }, (check) => {
            return check(DC(-456).valueOf()).mustBe(-456);
        });
        test('DC(-456) + 123                ', { skip: false }, (check) => {
            return check(DC(-456) + 123).mustBe(-333);
        });
        // STRING
        test('DC("")                        ', { skip: false }, (check) => {
            return check(DC("").valueOf()).mustBe("");
        });
        test('DC("test")                    ', { skip: false }, (check) => {
            return check(DC("test").valueOf()).mustBe("test");
        });
        test('DC("test") + 123              ', { skip: false }, (check) => {
            return check(DC("test") + 123).mustBe("test123");
        });
        // ARRAY
        test('DC([])                        ', { skip: false }, (check) => {
            return check(DC([]).toString()).mustBe("[" + [].toString() + "]");
        });
        test('DC(["test"])                  ', { skip: false }, (check) => {
            return check(DC(["test"]).toString()).mustBe("[\"test\"]");
        });
        test('DC(["test"]).push(123)        ', { skip: false }, (check) => {
            var dc = DC(["test"]);
            dc.push(123);
            return check(dc.toString()).mustBe("[\"test\",123]");
        });
        // OBJECT;
        test('DC({})                        ', { skip: false }, (check) => {
            return check(Object.keys(DC({})).toString()).mustBe("");
        });
        test('DC({ key: "val" })            ', { skip: false }, (check) => {
            var dc = DC({ key: "val" });
            check(Object.keys(dc).toString()).mustBe("key");
            return DC.convertPrimitiveTypes
                ? check(Object.entries(dc).toString()).mustBe("key,\"val\"")
                : check(Object.entries(dc).toString()).mustBe("key,val");
        });
        test('DC({}).key = 123              ', { skip: false }, (check) => {
            var dc = DC({});
            dc.key = 123;
            check(Object.keys(dc).toString()).mustBe("key");
            return check(Object.entries(dc).toString()).mustBe("key,123");
        });
    });
    /***** Event Emitter TESTS ************************************************/
    testRunner('Event Emitter TESTS           ', { skip: false }, (test) => {
        test('VALUE set_event                 ', { skip: false }, (check) => {
            var parent = DC({});
            var arr = DC([0]);
            parent.dc = arr;
            parent.on("-set", function (event) {

                check(event.newValue).mustBe(123);
                check(event.propertyPath.pop()).mustBe("dc");
                //check(typeof event.timestamp).mustBe("number");

                return true;
            }, true);
            arr.on("-set", function (event) {

                check(event.oldValue + '').mustBe('0');
                check(event.newValue).mustBe(123);
                check(event.propertyPath.pop() + '').mustBe("0");
                //check(typeof event.timestamp).mustBe("number");

                return true;
            }, true);
            arr[0] = 123;
            return check(arr[0] + '').mustBe('123');
        });
        test('OBJECT delete_event             ', { skip: false }, (check) => {
            var parent = DC({ dc: { number: 123 } });
            parent.on("-delete", function (event) {

                check(event.oldValue).mustBe(789);
                check(event.propertyPath.pop()).mustBe("dc");
                //check(typeof event.timestamp).mustBe("number");

                event.oldValue = 456;
            });
            parent.dc.on("-delete", function (event) {

                check(event.oldValue).mustBe(123);
                check(event.propertyPath.pop()).mustBe("number");
                //check(typeof event.timestamp).mustBe("number");

                event.oldValue = 789;
            });
            delete parent.dc.number;

            return check(parent.dc.number).mustBe(undefined);
        });
        test('ARRAY pop                       ', { skip: false }, (check) => {
            var dc = DC([1, 2, 3]);
            dc.on("-", function (event) {

                check(typeof event.oldValue).mustBe("number");
                check(typeof parseInt(event.propertyPath.pop())).mustBe("number");
                //check(typeof event.timestamp).mustBe("number");
            }, true);
            check(dc.pop() + "").mustBe("3");
            check(dc.pop() + "").mustBe("2");
            check(dc.pop() + "").mustBe("1");
            return true;
        });
        test('ARRAY push                      ', { skip: false }, (check) => {
            var dc = DC([]);
            dc.on("-set", function (event) {

                check(typeof event.newValue.valueOf()).mustBe("number");
                check(typeof parseInt(event.propertyPath.pop())).mustBe("number");
                //check(typeof event.timestamp).mustBe("number");
            }, true);
            dc.on("-new", function (event) {

                check(typeof event.newValue.valueOf()).mustBe("number");
            }, true);
            check(dc.push(1) + "").mustBe("1");
            check(dc.push(2) + "").mustBe("2");
            check(dc.push(3) + "").mustBe("3");
            return true;
        });
    });
    /***** Parse TESTS ********************************************************/
    testRunner('Parse TESTS                   ', { skip: false }, (test) => {
        test('parse(undefined)                ', { skip: false }, (check) => {
            return check(parse(undefined)).mustBe(undefined);
        });
        test('parse(null)                     ', { skip: false }, (check) => {
            return check(parse(null)).mustBe(null);
        });
        test('parse(0)                        ', { skip: false }, (check) => {
            return check(parse(0)).mustBe(0);
        });
        test('parse(-0)                       ', { skip: false }, (check) => {
            return check(parse(-0)).mustBe(0);
        });
        test('parse(0x01)                     ', { skip: false }, (check) => {
            return check(parse(0x01)).mustBe(1);
        });
        test('parse("")                       ', { skip: false }, (check) => {
            return check(parse("")).mustBe(undefined);
        });
        test('parse(\'""\')?.valueOf()        ', { skip: false }, (check) => {
            return check(parse('""')?.valueOf()).mustBe('');
        });
        test('parse(\'"abc"\')?.valueOf()     ', { skip: false }, (check) => {
            return check(parse('"abc"')?.valueOf()).mustBe('abc');
        });
        test('parse(\'"\\uD800"\')?.valueOf() ', { skip: false }, (check) => {
            return check(parse('"\uD800"')?.valueOf()).mustBe('\uD800');
        });
        test('parse(\'null\')                 ', { skip: false }, (check) => {
            return check(parse('null')).mustBe(null);
        });
        test('parse(\'false\')?.valueOf()     ', { skip: false }, (check) => {
            return check(parse('false')?.valueOf()).mustBe(false);
        });
        test('parse(\'true\')?.valueOf()      ', { skip: false }, (check) => {
            return check(parse('true')?.valueOf()).mustBe(true);
        });
        test('parse(\'0\')?.valueOf()         ', { skip: false }, (check) => {
            return check(parse('0')?.valueOf()).mustBe(0);
        });
        test('parse(\'123\')?.valueOf()       ', { skip: false }, (check) => {
            return check(parse('123')?.valueOf()).mustBe(123);
        });
        test('parse(\'-123\')?.valueOf()      ', { skip: false }, (check) => {
            return check(parse('-123')?.valueOf()).mustBe(-123);
        });
        test('parse(\'[]\')                   ', { skip: false }, (check) => {
            return check(Array.isArray(parse('[]'))).mustBe(true);
        });
        test('parse(\'[\\n]\')                ', { skip: false }, (check) => {
            return check(Array.isArray(parse('[\n]'))).mustBe(true);
        });
        test('parse(\'["abc"]\')              ', { skip: false }, (check) => {
            return check(Array.isArray(parse('[ "abc" ]'))).mustBe(true);
        });
        test('parse(\'{}\')                   ', { skip: false }, (check) => {
            var data = parse('{}')?.valueOf();
            check(data).mustNotBe(null);
            check(typeof data).mustBe("object");
            check(Object.keys(data).length).mustBe(0);
            return true;
        });
        test('parse(\'{\\n}\')                ', { skip: false }, (check) => {
            var data = parse('{\n}')?.valueOf();
            check(data).mustNotBe(null);
            check(typeof data).mustBe("object");
            check(Object.keys(data).length).mustBe(0);
            return true;
        });
        test('parse(\'[1]\')                  ', { skip: false }, (check) => {
            var data = parse('[1]');
            check(Array.isArray(data)).mustBe(true);
            check(data[0]?.valueOf()).mustBe(1);
            return true;
        });
        test('parse(\'{"arr":[1]}\')          ', { skip: false }, (check) => {
            var data = parse('{"arr":[1]}');
            check(Array.isArray(data.arr)).mustBe(true);
            check(data.arr[0]?.valueOf()).mustBe(1);
            return true;
        });
        test('parse(\'[{"nr":1}]\')           ', { skip: false }, (check) => {
            var data = parse('[{"nr":1}]');
            check(Array.isArray(data)).mustBe(true);
            check(data[0].nr?.valueOf()).mustBe(1);
            return true;
        });
    });
    /***** Stringify TESTS ****************************************************/
    testRunner('Stringify TESTS               ', { skip: false }, (test) => {
        test('stringify(undefined)            ', { skip: false }, (check) => {
            return check(stringify(undefined)).mustBe(undefined);
        });
        test('stringify(null)                 ', { skip: false }, (check) => {
            return check(stringify(null)).mustBe('null');
        });
        test('stringify(true)                 ', { skip: false }, (check) => {
            return check(stringify(true)).mustBe('true');
        });
        test('stringify(false)                ', { skip: false }, (check) => {
            return check(stringify(false)).mustBe('false');
        });
        test('stringify(0)                    ', { skip: false }, (check) => {
            return check(stringify(0)).mustBe('0');
        });
        test('stringify(-0)                   ', { skip: false }, (check) => {
            return check(stringify(-0)).mustBe('0');
        });
        test('stringify(0.123)                ', { skip: false }, (check) => {
            return check(stringify(0.123)).mustBe('0.123');
        });
        test('stringify(-0.123)               ', { skip: false }, (check) => {
            return check(stringify(-0.123)).mustBe('-0.123');
        });
        test('stringify(0.0000123)            ', { skip: false }, (check) => {
            return check(stringify(0.0000123)).mustBe('0.0000123');
        });
        test('stringify("")                   ', { skip: false }, (check) => {
            return check(stringify("")).mustBe('""');
        });
        test('stringify("abc")                ', { skip: false }, (check) => {
            return check(stringify("abc")).mustBe('"abc"');
        });
        test('stringify("\\uD800")            ', { skip: false }, (check) => {
            return check(stringify("\uD800")).mustBe('"\uD800"');
        });
        test('stringify([])                   ', { skip: false }, (check) => {
            return check(stringify([])).mustBe('[]');
        });
        test('stringify({})                   ', { skip: false }, (check) => {
            return check(stringify({})).mustBe('{}');
        });
        test('stringify([1])                  ', { skip: false }, (check) => {
            return check(stringify([1])).mustBe('[1]');
        });
        test('stringify({arr:[1]})            ', { skip: false }, (check) => {
            return check(stringify({ arr: [1] })).mustBe('{"arr":[1]}');
        });
        test('stringify([{nr:1}])             ', { skip: false }, (check) => {
            return check(stringify([{ nr: 1 }])).mustBe('[{"nr":1}]');
        });

        test('stringify(DC(undefined))        ', { skip: false }, (check) => {
            return check(stringify(DC(undefined))).mustBe(undefined);
        });
        test('stringify(DC(null))             ', { skip: false }, (check) => {
            return check(stringify(DC(null))).mustBe('null');
        });
        test('stringify(DC(true))             ', { skip: false }, (check) => {
            return check(stringify(DC(true))).mustBe('true');
        });
        test('stringify(DC(false))            ', { skip: false }, (check) => {
            return check(stringify(DC(false))).mustBe('false');
        });
        test('stringify(DC(0))                ', { skip: false }, (check) => {
            return check(stringify(DC(0))).mustBe('0');
        });
        test('stringify(DC(-0))               ', { skip: false }, (check) => {
            return check(stringify(DC(-0))).mustBe('0');
        });
        test('stringify(DC(0.123))            ', { skip: false }, (check) => {
            return check(stringify(DC(0.123))).mustBe('0.123');
        });
        test('stringify(DC(-0.123))           ', { skip: false }, (check) => {
            return check(stringify(DC(-0.123))).mustBe('-0.123');
        });
        test('stringify(DC(0.0000123))        ', { skip: false }, (check) => {
            return check(stringify(DC(0.0000123))).mustBe('0.0000123');
        });
        test('stringify(DC(""))               ', { skip: false }, (check) => {
            return check(stringify(DC(""))).mustBe('""');
        });
        test('stringify(DC("abc"))            ', { skip: false }, (check) => {
            return check(stringify(DC("abc"))).mustBe('"abc"');
        });
        test('stringify(DC([]))               ', { skip: false }, (check) => {
            return check(stringify(DC([]))).mustBe('[]');
        });
        test('stringify(DC({}))               ', { skip: false }, (check) => {
            return check(stringify(DC({}))).mustBe('{}');
        });
        test('stringify(DC([{ nr: 1 }]))      ', { skip: false }, (check) => {
            return check(stringify(DC([{ nr: 1 }]))).mustBe('[{"nr":1}]');
        });

        test('stringify(DC({n:1}),replacer)   ', { skip: false }, (check) => {
            var keys = [], data = stringify(DC({ n: 1 }), function (k, v) {
                check(typeof this).mustBe("object");
                check(typeof k).mustBe("string");
                check(v).mustNotBe(undefined);
                keys.push(k); this;
                return v;
            });
            check(keys.toString())
                .mustBe(",n")
                .done();
        });
        test('stringify({s:"a",n:1},["n"])    ', { skip: false }, (check) => {
            check(stringify(DC({ n: 1 }), ["n"])).mustBe('{"n":1}').done();
        });
        test('stringify({n:1,o:{toJSON:...}}) ', { skip: false }, (check) => {
            var obj = {
                n: 1,
                o: {
                    toJSON: function (k) {

                        return {};
                    }
                }
            };
            check(stringify(DC(obj))).mustBe('{"n":1,"o":{}}').done();
        });
    });
    /***** Complex TESTS ******************************************************/
    testRunner('Complex TESTS                 ', { skip: false }, (test) => {
        test('parse - stringify //metadata    ', { skip: false }, (check) => {
            var json = `{
    "test": {
        "arr": [
            123,
            "abc"
        ]
    },
    "str": "abc"
}`;
            var jsme = `/*obj*/
{
    /*obj*/
    /*{"timestamp":126546199,"delete":true}*/
    "test": {
        /*array*/
        "arr": [
            /*number*/
            123,
            /*string*/
            "abc"
        ]
    },
    /*abc*/
    "str": "abc"
}`;
            var obj = parse(jsme, DC);
            var jsme2 = stringify(obj, null, 4);
            check(jsme2).mustBe(jsme);
            var json2 = JSON.stringify(obj, null, 4);
            check(json2).mustBe(json)

            return true;
        });
        test('overwriting data                ', { skip: false }, (check) => {

            var json = `{
    "test":{
        "arr":[
            123,
            456,
            "abc"
        ]
    },
    "str":"abc"
}`;
            var dc = DC({ test: { arr: [] }, str: "abc" });
            var obj = parse(json, dc);
            obj.test.arr.pop();
            var result = stringify(obj, null, 4, { modifiedData: true, setUnmodified: true });
            check(result).mustBe(`{
    "test": {
        "arr": [\r\r            0: 123,
            1: 456
        ]
    }
}`);
            check(stringify(obj, null, 0, { modifiedData: true, setUnmodified: true })).mustBe(undefined);
            return true;
        });
        test('overwriting data  minify        ', { skip: false }, (check) => {

            var json = '{"test":{"arr":[123,"abc"]},"str":"abc"}';
            var dc = DC({ test: { arr: [] }, str: "abc" });
            var obj = parse(json, dc);
            var result = stringify(obj, null, "", { modifiedData: true, setUnmodified: true });
            check(result).mustBe('{"test":{"arr":[0:123,1:"abc"]}}');
            check(stringify(obj, null, "", { modifiedData: true, setUnmodified: true })).mustBe(undefined);
            return true;
        });
        test('overwriting array delete dc     ', { skip: false }, (check) => {

            var json = `{
    "arr": [
        { "nr": 1 },
        { "nr": 2 },
        { "nr": 3 },
        { "nr": 4 },
        { "nr": 5 },
        { "nr": 6 },
        { "nr": 7 }
    ]
}`;
            var obj = parse(json, DC);
            var arr = obj.arr.splice(0, 4);
            var result = stringify(obj, null, 4, { modifiedData: true, setUnmodified: true });
            check(result).mustBe(`{
    "arr": [\r\r        0: {
            "nr": 5
        },
        1: {
            "nr": 6
        },
        2: {
            "nr": 7
        }
    ]
}`);
            obj.arr.push(8);
            parse(result, obj);
            result = stringify(obj, null, 4, { modifiedData: true, setUnmodified: true });
            check(result).mustBe(`{
    "arr": [\r\r        0: {
            "nr": 5
        },
        1: {
            "nr": 6
        },
        2: {
            "nr": 7
        }
    ]
}`);

            return true;
        });
        test('overwriting object delete key   ', { skip: false }, (check) => {

            var json = `
{
    "dc": {
        "key0": 0,
        "key1": 1,
        "key2": 2
    }
}
`;
            var obj = parse(json, DC);
            delete obj.dc.key0;
            var result = stringify(obj, null, 4, { modifiedData: true, setUnmodified: true });
            check(result).mustBe(`{
    "dc": {
        "key0": 
    }
}`);
            return true;
        });
        test('overwriting array               ', { skip: false }, (check) => {

            var json = `
[
    {
        "key0": 0
    }
]`;
            var obj = parse(json, DC);
            obj[0].key0 = 1;
            var result = obj.stringifyChanges(null, 4);
            check(result).mustBe(`[
    0: {
        "key0": 1
    }
]`);
            return true;
        });
    });
});


/**
 * Test runner. Function to run unit tests in the console.
 * @author Manuel Lõhmus (MIT License)
 * @version 1.1.5
 * [2024-12-29] adde    d functionality to select tests by ID in the command line arguments (e.g. --testIDs=1 2 3)
 * @example `npm test '--'` or `node index.test.js`
 * @example `npm test '--' --help` or `node index.test.js --help`
 * @example `npm test '--' --testIDs=1 2 3` or `node index.test.js --testIDs=1 2 3`
 * @param {string} runnerName Test runner name.
 * @param {{skip:boolean}} options Test runner options.
 * @param {(test:Test)=>void} cb Callback function to run the unit tests.
 * @returns {boolean} If the tests are OK
 * @example testRunner('Module name', { skip: false },  function (test) {...});
 * 
 * @callback Test Unit test callback function
 * @param {string} testName Test name.
 * @param {{skip:boolean,timeout:number}} options Test options. (default: {skip:false,timeout:3000})))
 * @param {(check:Check,done:Done)=>void} fn Test function. Function parameters: check, done. `check` is used to check the test result. `done` is used to end the test.
 * @returns {void}
 * @example test("Test name", {skip:false,timeout:3000}, function(check,done){...});
 * @example test("Test name", function(check,done){...});
 * @example test("Test name", {skip:checkableObject === undefined}, function(check,done){...});
 * 
 * @callback Check Check function to check the test result.
 * @param {string} label Value name. Opional.
 * @param {any} value Value to check.
 * @returns {Validator} 
 * @example check('name', value).mustBe(true);
 * @example check('name', value).mustNotBe(false);
 * @example check('name', value).mustBe(true).done();
 * @example check('name', value).mustBe(true).mustNotBe(false).done();
 * 
 * @callback Done Callback function to end the test.
 * @param {Error} err Error message. If the error message is empty, the test is considered successful.
 * @returns {void}
 * 
 * @typedef Validator
 * @property {Check} check Check function to check the test result.
 * @property {(value:any)=>Validator} mustBe Check if the value is equal to the specified value.
 * @property {(value:any)=>Validator} mustNotBe Check if the value is not equal to the specified value.
 * @property {(value:any)=>Validator} mustInclude Check if the value is included to the specified value.
 * @property {Done} done Callback function to end the test.
 */
function testRunner(runnerName, options, cb) {

    var globalScope = this || globalThis;

    globalScope?.process?.on('uncaughtException', function noop() { });

    testRunner.testRunnerOK = true;
    clearTimeout(testRunner.exitTimeoutID);

    var stdout = {},
        timeouts = {},
        countStarted = 0,
        countCompleted = 0,
        testsStarted = false,
        testRunnerOK = true,
        strSKIP = "\t\t[\x1b[100m\x1b[97m  SKIP  \x1b[0m]",
        strTestsERR = "[\x1b[41m\x1b[97m The tests failed! \x1b[0m]",
        strTestsDONE = "[\x1b[42m\x1b[97m The tests are done! \x1b[0m]",
        { help, testID } = arg_options();

    if (help !== undefined) {

        console.log(`
npm test '--' [OPTION1=VALUE1] [OPTION2=VALUE2] ...
or
node index.test.js [OPTION1=VALUE1] [OPTION2=VALUE2] ...

The following options are supported:
    --help      Display this help
    --testID   Number of the test to run (e.g. node index.test.js --testID=1 --testID=2 --testID=3)
    `);

        if (globalScope?.process?.argv[1].endsWith(".js")) { exitPressKey(); }
        else { globalScope?.process?.exit(0); }

        return;
    }

    if (!Array.isArray(testID)) { testID = testID ? [testID] : []; }

    //skip all tests
    if (options?.skip) {

        testsStarted = "SKIP";
        if (runnerName) { log(0, "SKIP  > ", runnerName, strSKIP); }
        testCompleted();

        return testRunnerOK;
    }


    if (runnerName) { log(0, "START > ", runnerName); }
    cb(test);
    testsStarted = true;
    testCompleted();

    return testRunnerOK;

    function log() {

        var line = "";

        for (let i = 1; i < arguments.length; i++) {

            line += arguments[i];
        }

        if (stdout[arguments[0]]) {

            stdout[arguments[0]] += line + "\n";
        }
        else {

            stdout[arguments[0]] = line + "\n";
        }
    }
    function print_stdout() {

        console.log();
        console.log(
            Object.keys(stdout).reduce((output, value, i) => output += stdout[i], '')
        );
    }
    /**
     * Unit test function.
     * @type {Test} 
     */
    function test(testName, options, fn) {

        var startTime, endTime,
            id = ++countStarted,
            testOK = true,
            label = "  " + id + ".\tTEST > " + testName + "\t",
            strOK = "\t[\x1b[42m\x1b[97m   OK   \x1b[0m]",
            strERR = "\t[\x1b[41m\x1b[97m FAILED \x1b[0m] -> ";

        //skip
        if (options?.skip || testID && testID.length && !testID.includes(id)) {

            log(id, label, "\t", strSKIP);
            testCompleted();

            return;
        }
        //timeout 
        timeouts[id] = setTimeout(function () {
            done("timeout");
        }, options?.timeout || 3000);

        startTime = performance.now();

        try {
            if (fn(check, done)) { done(); }

        }
        catch (err) { done(err); }

        /**
         *  Callback function to end the test.
         * @type {Done}
         */
        function done(err = '') {

            endTime = performance.now();
            if (err) { testRunnerOK = testOK = false; }
            if (err || testOK)
                log(id, label, ": ", (endTime - startTime).toFixed(2), "ms\t", err ? strERR : strOK, err || "");
            if (timeouts[id]) { testCompleted(); }
            clearTimeout(timeouts[id]);
            delete timeouts[id];
        }
        /**
         * Check function to check the test result.
         * @type {Check}
         */
        function check(label, value) {

            if (arguments.length === 1) { value = label; label = 'returned'; }
            if (label === undefined) { label = 'returned'; }

            /**
             * Selection fuctions to check.
             * @type {Validator}
             */
            return {

                check,

                mustBe: function mustBe(mustBe) {
                    if (value !== mustBe) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must be \x1b[0m '" + mustBe + "'"); }
                    return this;
                },

                mustNotBe: function mustNotBe(mustNotBe) {
                    if (value === mustNotBe) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must not be \x1b[0m '" + mustNotBe + "'"); }
                    return this;
                },

                mustInclude: function mustInclude(mustInclude) {
                    if (!value?.includes || !value.includes(mustInclude)) { done("\x1b[44m\x1b[97m " + label + " \x1b[0m '" + value + "' \x1b[44m\x1b[97m must include \x1b[0m '" + mustInclude + "'"); }
                    return this;
                },

                done
            };
        }
    }
    function testCompleted() {

        countCompleted++;

        if (!testsStarted || countStarted >= countCompleted) { return; }

        if (runnerName) {

            if (testsStarted === "SKIP") {

                print_stdout();
            }
            else if (!testRunnerOK) {
                log(++countStarted, "END   > " + runnerName + "\t" + strTestsERR);
                print_stdout();
            }
            else {
                log(++countStarted, "END   > ", runnerName, "\t", strTestsDONE);
                print_stdout();
            }

            globalScope?.process?.removeAllListeners('uncaughtException');

            if (globalScope?.process?.argv[1].endsWith(".js")) {

                exitPressKey();
            }
            else if (globalScope?.process) {

                if (!testRunnerOK) { testRunner.testRunnerOK = false; }

                testRunner.exitTimeoutID = setTimeout(function (exit) {

                    exit(testRunner.testRunnerOK ? 0 : 1);

                }, 100, globalScope?.process?.exit);
            }
        }
    }

    function exitPressKey() {

        globalScope?.process?.stdin.setRawMode(true);
        globalScope?.process?.stdin.resume();
        globalScope?.process?.stdin.on('data', globalScope?.process?.exit.bind(globalScope?.process, testRunnerOK ? 0 : 1));

        console.log('Press any key to exit');
    }

    function arg_options() {

        if ("undefined" === typeof globalScope?.process) { return {}; }

        var isKey = false,
            key = '',
            values,
            args = globalScope?.process?.argv
                .slice(2)
                .join('')
                .split('')
                .reduce(function (args, c) {


                    if (c === '-') {
                        if (isKey && key && !args[key]) { args[key] = ['true']; }
                        isKey = true;
                        key = '';
                        return args;
                    }

                    if (c === '=') {
                        isKey = false;
                        if (!args[key]) { args[key] = []; }
                        values = args[key];
                        values.push('');
                        return args;
                    }

                    if (isKey && /\s/.test(c)) {
                        return args;
                    }

                    if (isKey) {
                        key += c;
                        return args;
                    }

                    values[values.length - 1] += c;

                    return args;
                }, {});

        if (isKey && key && !args[key]) { args[key] = ['true']; }

        Object.keys(args).forEach((k) => {

            if (!args[k].length) {

                args[k] = '';

                return;
            }

            if (args[k].length === 1) {

                args[k] = convertValue(args[k][0].trim());

                return;
            }

            args[k] = args[k].map((s) => {

                return convertValue(s.trim());
            });
        });

        return args;

        function convertValue(val) {

            if (val === 'null') { return null; }
            if (val === 'true') { return true; }
            if (val === 'false') { return false; }
            if (!isNaN(Number(val))) { return Number(val); }

            return val;
        }
    }
}

/**
 * Import modules.
 * @param {string[]} importIdentifierArray Modules to import.
 * @param {(...importModules:any[]) => void} callback Callback function.
 */
function importModules(importIdentifierArray, callback) {

    var thisScope = "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
            ? window
            : "undefined" != typeof global
                ? global : "undefined" != typeof self
                    ? self
                    : {};

    if (!thisScope.modules) { thisScope.modules = {}; }

    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS

        if (importIdentifierArray.length) {

            importIdentifierArray = importIdentifierArray.map(function (id) { return require(id); });
        }

        return module.exports = callback.call(thisScope, ...importIdentifierArray);
    }

    // Browser
    waitModules();


    function waitModules() {

        if (importIdentifierArray.length) {

            for (let i = 0; i < importIdentifierArray.length; i++) {

                if (!thisScope.modules[importIdentifierArray[i]]) { return setTimeout(waitModules, 10); }
            }
        }

        callback.call(thisScope, ...importIdentifierArray.map(function (id) { return thisScope.modules[id]; }));
    }
}