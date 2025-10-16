/**  Copyright (c) Manuel Lõhmus (MIT). */

"use strict";

importModules(["data-context"], async function (DC) {

    var { parse, stringify } = DC;

    /***** Init TESTS *********************************************************/
    await testRunner('Init TESTS                    ', { skip: false }, (test) => {
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
    await testRunner('Event Emitter TESTS           ', { skip: false }, (test) => {
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
    await testRunner('Parse TESTS                   ', { skip: false }, (test) => {
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
    await testRunner('Stringify TESTS               ', { skip: false }, (test) => {
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
    await testRunner('Complex TESTS                 ', { skip: false }, (test) => {
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

/**
 * @typedef Options - Options object for the test runner.
 * @type {object}
 * @property {string} [controlServerSocketPath="/tmp/test-runner-lite.sock"] - Path to the control server socket. Used for inter-process communication between primary and worker processes (on Node.js).
 * @property {boolean} [workers=false] - Allows tests to be run in a worker process. Does not create in a worker process.
 * @property {number} [timeout=5000] - Default timeout for tests in milliseconds.
 * @property {boolean} [json=false] - Whether to output results in JSON format.
 * @property {boolean} [raw=false] - Whether to disable colored output.
 * @property {boolean} [silent=false] - Whether to suppress console output.
 * @property {boolean} [bail=false] - Whether to stop on the first test failure.
 * @property {boolean} [noExit=false] - Whether to prevent exiting the process on completion.
 * @property {string[]} [testIDs] - Array of test IDs to run. If provided, only these tests will be executed.
 * @property {function} [onComplete] - Callback function to be called when all tests are complete. Receives the summary object as an argument.
 */

/**
 * @typedef Done - Function to call when the test is complete. Can be called with an error message to indicate failure.
 * @type {function}
 * @param {string} [err] - Optional error message. If provided, the test is marked as failed.
 * @returns {void}
 */

/**
 * @typedef Check - Object with assertion methods.
 * @type {object}
 * @property {function} mustBe - Asserts that the value is equal to one of the provided arguments.
 * @property {function} mustNotBe - Asserts that the value is not equal to any of the provided arguments.
 * @property {function} mustInclude - Asserts that the value includes the provided argument.
 * @property {function} mustBeDefined - Asserts that the value is defined.
 * @property {function} mustBeUndefined - Asserts that the value is undefined.
 * @property {function} mustBeNull - Asserts that the value is null.
 * @property {function} mustBeNotNull - Asserts that the value is not null.
 * @property {function} mustBeTrue - Asserts that the value is true.
 * @property {function} mustBeFalse - Asserts that the value is false.
 * @property {function} mustBeObject - Asserts that the value is an object.
 * @property {function} mustBeArray - Asserts that the value is an array.
 * @property {function} mustBeString - Asserts that the value is a string.
 * @property {function} mustBeNumber - Asserts that the value is a number.
 * @property {function} mustBeFunction - Asserts that the value is a function.
 * @property {function} mustBeGreaterThan - Asserts that the value is greater than the provided argument.
 * @property {function} mustBeLessThan - Asserts that the value is less than the provided argument.
 * @property {function} mustBeGreaterOrEqual - Asserts that the value is greater than or equal to the provided argument.
 * @property {function} mustBeLessOrEqual - Asserts that the value is less than or equal to the provided argument.
 * @property {function} mustMatch - Asserts that the value matches the provided regular expression.
 * @property {function} mustBeInstanceOf - Asserts that the value is an instance of the provided type.
 * @property {function} toBe - Alias for mustBe.
 * @property {function} notToBe - Alias for mustNotBe.
 * @property {function} toInclude - Alias for mustInclude.
 * @property {function} toBeDefined - Alias for mustBeDefined.
 * @property {function} toBeUndefined - Alias for mustBeUndefined.
 * @property {function} toBeNull - Alias for mustBeNull.
 * @property {function} toBeNotNull - Alias for mustBeNotNull.
 * @property {function} toBeTrue - Alias for mustBeTrue.
 * @property {function} toBeFalse - Alias for mustBeFalse.
 * @property {function} toBeObject - Alias for mustBeObject.
 * @property {function} toBeArray - Alias for mustBeArray.
 * @property {function} toBeString - Alias for mustBeString.
 * @property {function} toBeNumber - Alias for mustBeNumber.
 * @property {function} toBeFunction - Alias for mustBeFunction.
 * @property {function} toBeGreaterThan - Alias for mustBeGreaterThan.
 * @property {function} toBeLessThan - Alias for mustBeLessThan.
 * @property {function} toBeGreaterOrEqual - Alias for mustBeGreaterOrEqual.
 * @property {function} toBeLessOrEqual - Alias for mustBeLessOrEqual.
 * @property {function} toMatch - Alias for mustMatch.
 * @property {function} toBeInstanceOf - Alias for mustBeInstanceOf.
 * @property {function} truthy - Asserts that the value is truthy.
 * @property {function} falsy - Asserts that the value is falsy.
 * @property {Done} done - Function to call when the test is complete or to indicate failure.
 */

/**
 * @typedef TestCallback - Callback function for defining a test.
 * @type {function}
 * @param {Check} check - Object with assertion methods.
 * @param {function} done - Function to call when the test is complete. Can be called with an error message to indicate failure.
 * @param {boolean} isPrimary - Whether the current process is the primary process.
 */

/**
 * @typedef TestFunction - Function to define a test.
 * @type {function}
 * @param {string} name - Name of the test.
 * @param {Options|function} [opts] - Options object or test function if no options are provided.
 * @param {TestCallback} fn - Test callback function.
 */

/**
 * @typedef SuiteCallback - Callback function for defining tests.
 * @type {function}
 * @param {TestFunction} test - Function to define a test.
 * @param {boolean} isPrimary - Whether the current process is the primary process.
 * @param {boolean} isWorker - Whether the current process is a worker process.
 */

/**
 * Version number: 1.1.0
 * Test runner. Simple test execution framework for Node.js and the browser.
 * Can run tests in the primary process and worker processes (if workers are supported).
 * Collects and reports test results.
 * Uses a control server to collect results from worker processes.
 * @module test-runner-lite
 * @param {string} runnerName - Name of the test runner.
 * @param {Options|function} options - Options object or suite function if no options are provided.
 * @param {SuiteCallback} [suite] - Suite callback function to define tests.
 * @returns {Promise<object>} Promise that resolves with the test summary or rejects if any test fails.
 * @example
 * const testRunner = require('test-runner-lite');
 * 
 * testRunner("My Test Suite", { workers: true, timeout: 2000 }, (test, isPrimary, isWorker) => {
 *   test("Primary process test", { off: !isPrimary }, (check, done) => {
 *     check("typeof", typeof someModule).mustBe("object").done();
 *   });
 *   test("Worker process test", { off: !isWorker }, (check, done) => {
 *     check("isWorker", isWorker).mustBe(true).done('stop');
 *   });
 *   test("Universal test", (check, done) => {
 *     check("platform", process.platform).mustInclude("linux").done();
 *   });
 * });
 *   .then((summary) => {
 *     console.log("All tests completed", summary);
 *   })
 *   .catch(err => { throw err; });
 */
function testRunner(runnerName, options, suite) {

    if (typeof options === 'function') { suite = options; options = {}; }

    let numberOfTests = 0, ok = true, endTimer = null, resolveRunnerPromise, rejectRunnerPromise;
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined',
        color = makeColors(isBrowser || process.stdout.isTTY && !options.raw),
        isPrimary = typeof process === 'undefined' || !process.send, // process is undefined in the browser, process.send is undefined in the primary thread
        primaryOnly = !options.workers,
        printToConsole = !options.silent && !options.json,
        startTime = performance.now(),
        tests = [],
        summary = {
            runner: runnerName,
            ok,
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            turned_off: 0,
            time_ms: NaN,
            results: [],
        },
        controlServer = createControlServer(startTesting);

    // if controlServer is created, startTesting() will be called when all workers are connected
    // if controlServer is not created (e.g. in the browser or if workers are not used), startTesting() is called immediately
    if (!controlServer || isBrowser) { startTesting(); }

    return new Promise((resolve, reject) => { rejectRunnerPromise = reject; resolveRunnerPromise = resolve; });



    function startTesting() {

        // START print
        if (isPrimary) {
            if (printToConsole) console.log(`START > ${runnerName}`);
        }

        suite(testFn, isPrimary, !isPrimary);
        finish();
    }
    async function testFn(name, opts, fn) {

        if (!ok && options.bail) { return; }
        if (typeof opts === 'function') { fn = opts; opts = {}; }

        const test = {
            id: ++numberOfTests,
            name,
            status: 'OFF',
            time_ms: NaN,
        };

        if (!isPrimary && !isBrowser) { test.worker_pid = process.pid; }

        if (opts.off || options.testIDs && !options.testIDs.includes(String(test.id))) {
            test.status = 'OFF';
            return setTimeout(finish, 1, test);
        }
        if (opts.skip) {
            test.status = 'SKIP'
            return setTimeout(finish, 1, test);
        }

        const { check, done } = makeCheckAndDone(test);
        test.startTime = performance.now();

        try {
            const maybePromise = fn(check, done, isPrimary);
            if (maybePromise && typeof maybePromise.then === 'function') {
                // Promise returned
                return maybePromise.then(() => done()).catch(done);
            }
            if (maybePromise.done) { maybePromise.done(); }
            if (maybePromise === true) { done(); }

            throw new Error('Test function did not call done()');
        }
        catch (err) {
            done(err);
        }


        function makeCheckAndDone() {

            const done = makeDone();

            return { check, done };


            function check(label, value) {

                if (value === undefined) { value = label; label = 'Value'; }

                return {
                    mustBe(...args) { if (!args.includes(value)) { done(`${label} must be '${args}'`); } return this; },
                    mustNotBe(...args) { if (args.includes(value)) { done(`${label} must not be '${args}'`); } return this; },
                    mustInclude(v) { if (!value?.includes || !value.includes(v)) { done(`${label} must include '${v}'`); } return this; },
                    mustBeDefined() { if (value === undefined) { done(`${label} must be defined`); } return this; },
                    mustBeUndefined() { if (value !== undefined) { done(`${label} must be undefined`); } return this; },
                    mustBeNull() { if (value !== null) { done(`${label} must be null`); } return this; },
                    mustBeNotNull() { if (value === null) { done(`${label} must not be null`); } return this; },
                    mustBeTrue() { if (value !== true) { done(`${label} must be true`); } return this; },
                    mustBeFalse() { if (value !== false) { done(`${label} must be false`); } return this; },
                    mustBeObject() { if (typeof value !== 'object' || value === null || Array.isArray(value)) { done(`${label} must be an object`); } return this; },
                    mustBeArray() { if (!Array.isArray(value)) { done(`${label} must be an array`); } return this; },
                    mustBeString() { if (typeof value !== 'string') { done(`${label} must be a string`); } return this; },
                    mustBeNumber() { if (typeof value !== 'number' || isNaN(value)) { done(`${label} must be a number`); } return this; },
                    mustBeFunction() { if (typeof value !== 'function') { done(`${label} must be a function`); } return this; },
                    mustBeGreaterThan(v) { if (typeof value !== 'number' || value <= v) { done(`${label} must be greater than ${v}`); } return this; },
                    mustBeLessThan(v) { if (typeof value !== 'number' || value >= v) { done(`${label} must be less than ${v}`); } return this; },
                    mustBeGreaterOrEqual(v) { if (typeof value !== 'number' || value < v) { done(`${label} must be greater or equal to ${v}`); } return this; },
                    mustBeLessOrEqual(v) { if (typeof value !== 'number' || value > v) { done(`${label} must be less or equal to ${v}`); } return this; },
                    mustMatch(regex) { if (typeof value !== 'string' || !value.match(regex)) { done(`${label} must match ${regex}`); } return this; },
                    mustBeInstanceOf(type) { if (!(value instanceof type)) { done(`${label} must be an instance of ${type.name || type}`); } return this; },
                    toBe(...args) { return this.mustBe(...args); },
                    notToBe(...args) { return this.mustNotBe(...args); },
                    toInclude(v) { return this.mustInclude(v); },
                    toBeDefined() { return this.mustBeDefined(); },
                    toBeUndefined() { return this.mustBeUndefined(); },
                    toBeNull() { return this.mustBeNull(); },
                    toBeNotNull() { return this.mustBeNotNull(); },
                    toBeTrue() { return this.mustBeTrue(); },
                    toBeFalse() { return this.mustBeFalse(); },
                    toBeObject() { return this.mustBeObject(); },
                    toBeArray() { return this.mustBeArray(); },
                    toBeString() { return this.mustBeString(); },
                    toBeNumber() { return this.mustBeNumber(); },
                    toBeFunction() { return this.mustBeFunction(); },
                    toBeGreaterThan(v) { return this.mustBeGreaterThan(v); },
                    toBeLessThan(v) { return this.mustBeLessThan(v); },
                    toBeGreaterOrEqual(v) { return this.mustBeGreaterOrEqual(v); },
                    toBeLessOrEqual(v) { return this.mustBeLessOrEqual(v); },
                    toMatch(regex) { return this.mustMatch(regex); },
                    toBeInstanceOf(type) { return this.mustBeInstanceOf(type); },
                    truthy() { if (!value) { done(`${label} must be truthy`); } return this; },
                    falsy() { if (value) { done(`${label} must be falsy`); } return this; },
                    done
                };
            }
            function makeDone() {

                test.timer = setTimeout(function () { done('timeout') }, opts.timeout || options.timeout);

                return done;


                function done(err) {
                    // done called
                    if (!test.timer) return;

                    clearTimeout(test.timer);
                    delete test.timer;
                    test.time_ms = +(performance.now() - test.startTime).toFixed(2);
                    delete test.startTime;

                    test.status = err ? 'FAIL' : 'OK';

                    if (err) { ok = false; }

                    setTimeout(finish, 1, test, err);
                }
            }
        }
    }
    function finish(test, err) {

        // continue
        if (!test && numberOfTests) { return; }
        // add test
        if (test) {
            tests.push(test);

            // TEST print
            if (printToConsole && (primaryOnly && isPrimary || !primaryOnly)) {
                if (test.status !== 'OFF') {
                    const status = test.status === 'SKIP'
                        ? `${color.bgGray}  SKIP  ${color.reset}`
                        : test.status === 'OK'
                            ? `${color.bgGreen}   OK   ${color.reset}`
                            : `${color.bgRed} FAILED ${color.reset}`;

                    console.log(`${startLengthening(test.id, 3)}. ${primaryOnly ? '' : isPrimary ? 'p' : 'w'}TEST > ${endLengthening(test.name, 50)} ${startLengthening(test.time_ms, 8)}ms ${status} ${err ? '-> ' + err : ''}`);
                }
            }
        }
        // continue
        if (numberOfTests > tests.length) { return; }

        report(tests);
    }
    function report(results) {

        // Is Worker
        if (!isPrimary) { return workerEnd(); }

        for (let t of results) {

            summary.total++;
            if (t.status === 'OK') { summary.passed++; }
            if (t.status === 'FAIL') { summary.failed++; ok = false; }
            if (t.status === 'SKIP') { summary.skipped++; }
            if (t.status === 'OFF') { summary.turned_off++ }
            if (t.status !== 'OFF') { summary.results.push(t); }
        }

        // Only Primary Thread
        if (primaryOnly) { return end(); }
        // Timeout Exit
        if (endTimer === null && !isBrowser) {
            process.on('beforeExit', function () { end(); });
        }
        clearTimeout(endTimer);
        endTimer = setTimeout(end, options.timeout);

        return;


        function workerEnd() {
            postMessageToPrimary({ type: 'tests-request', tests }, function () {
                if (!isBrowser) { process.exit(ok ? 0 : 1); }
            });
        }
        function end() {

            // totalTime
            summary.time_ms = +(performance.now() - startTime).toFixed(2);

            // END print
            if (options.json) {
                console.log(JSON.stringify(summary, null, 2));
            }
            else if (printToConsole && isPrimary) {
                console.log(`END > ${runnerName}\t ${ok ? color.bgGreen + ' DONE ' + color.reset : color.bgRed + ' FAIL ' + color.reset}`);
            }

            // Integration
            if (typeof options.onComplete === 'function') { options.onComplete(summary); }

            if (controlServer) {
                controlServer.close(exit)
            }
            else { exit(); }


            function exit() {
                // Exit
                if (ok && typeof resolveRunnerPromise === 'function') { resolveRunnerPromise(summary); }

                else if (typeof rejectRunnerPromise === 'function') {
                    try { rejectRunnerPromise(new Error('Some tests failed')); } catch (_) { }
                }

                if (!ok && !options.noExit && !isBrowser) { setTimeout(() => process.exit(1), 100); }
            }
        }
    }
    function createControlServer(callback) {
        if (!isPrimary || typeof net === 'undefined') { return null; }

        const server = net.createServer(function (socket) {
            socket.on('data', function onMsg(msg) {
                msg = JSON.parse(msg.toString());

                if (msg.type === 'tests-request') {
                    report(msg.tests);
                }
            });
        });
        server.on('error', function (error) { console.error(error); });
        server.listen(options.controlServerSocketPath, callback);

        return server;
    }
    function postMessageToPrimary(msg, callback) {
        if (isPrimary) { return null; }

        const client = net.createConnection({ path: options.controlServerSocketPath }, function () {

            client.write(JSON.stringify(msg));
            client.end();
        });
        client.on('error', function (error) { console.error(error); });
        client.on('close', function () { if (typeof callback === 'function') { callback(); } });

        return client;
    }
    function makeColors(enable) {

        if (!enable) return new Proxy({}, { get: function () { return ''; } });

        return {
            reset: '\x1b[0m',
            bgGreen: '\x1b[7m\x1b[1m\x1b[32m',
            bgRed: '\x1b[7m\x1b[1m\x1b[31m',
            bgGray: '\x1b[7m\x1b[1m\x1b[90m',
        };
    }
    function startLengthening(str, toLength) {

        if (options.raw) { return str; }

        str = str + '';

        return ' '.repeat(toLength - str.length > 0 ? toLength - str.length : 0) + str;
    }
    function endLengthening(str, toLength) {

        if (options.raw) { return str; }

        str = str + '';

        return str + ' '.repeat(toLength - str.length > 0 ? toLength - str.length : 0);
    }
}
