/** Data Context functions for Browser and node.js. @preserve Copyright (c) 2020 Manuel Lõhmus.*/
"use strict";

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? //if node
        module.exports = factory(exports) : //node
        (global = typeof globalThis !== 'undefined' ? globalThis : global || self,
            global.DC = factory(global.DC = {}));
}(this, (function (DC) {

    if (DC && DC.name === "DC") return DC;
    else DC.name = "DC";

    var isNode = typeof exports !== 'undefined';
    DC.IsDebuger = false;
    DC.IsAutoProperty = false;

    //#region function for IE

    if (!isNode) {

        /** String */
        String.prototype.startsWith || Object.defineProperty(String.prototype, 'startsWith', {
            value: function (search, position) {
                var pos = position > 0 ? position | 0 : 0;
                return typeof search === "string" && this.substring(pos, pos + search.length) === search;
            }
        });
        String.prototype.endsWith || Object.defineProperty(String.prototype, 'endsWith', {
            value: function (search, length) {
                length = (length === undefined || length > this.length) ? this.length : length;
                return typeof search === "string" && this.substring(length - search.length, length) === search;
            }
        });
        String.prototype.trimStart || Object.defineProperty(String.prototype, 'trimStart', {
            value: function (str) {
                if (this.startsWith(str)) {
                    return this.substring(str.length);
                }
                return this.replace(/^[\s\uFEFF\xA0]+/g, '');
            }
        });
        String.prototype.trimEnd || Object.defineProperty(String.prototype, 'trimEnd', {
            value: function (str) {
                if (this.endsWith(str)) {
                    return this.substring(0, this.length - str.length);
                }
                return this.replace(/[\s\uFEFF\xA0]+$/g, '');
            }
        });
        String.prototype.includes || Object.defineProperty(String.prototype, 'includes', {
            value: function (search) {
                return this.indexOf(search) > -1;
            }
        });
        /** Math */
        Math.cbrt || Object.defineProperty(Math, 'cbrt', {
            value: function cbrt(x) {
                // ensure negative numbers remain negative:
                return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);
            }
        });
    }

    //#endregion

    //#region Item

    DC.Item = (function () {
        /**
         * Creates a new Item.
         * @param {any} obj Optional. Init. data.
         * @param {boolean} setIsModified
        * @returns {Item} .
         */
        function Item(obj, setIsModified) {

            var item = {};
            item["-type"] = "DC.Item";
            var _bindId = 0;
            var _binds = {};
            Object.defineProperty(item, "-binds", { get: function () { return _binds; } });
            var values = {};
            Object.defineProperty(item, "-values", { get: function () { return values; } });
            Object.defineProperty(item, "isItem", { get: function () { return true; } });


            var parent = null;
            Object.defineProperty(item, "parent", { get: function () { return parent; }, set: function (value) { parent = value; } });
            var parentPropertyName = null;
            Object.defineProperty(item, "parentPropertyName", { get: function () { return parentPropertyName; }, set: function (value) { parentPropertyName = value; } });
            var propertyNames = [];
            /** Defined properties in 'Item' */
            Object.defineProperty(item, "propertyNames", { get: function () { return propertyNames; } });
            Object.defineProperty(item, "isEmpty", { get: function () { return !item.propertyNames.length; } });
            Object.defineProperty(item, "isModified", { value: true, writable: true, configurable: true });
            Object.defineProperty(item, "isOverwriting", { value: false, writable: true, configurable: true });

            /**
             * Invoke bind property update. 
             * @param {string} propertyName Optional. If it is undefined, then invoke all properties.
             * @param {any} newValue Optional.
             * @param {any} oldValue Optional.
             * @param {ArrayOfString} propertyPath Optional.
             * @param {Object} binds Optional.
             * @returns {Number} Returns invoke count.
             */
            item.bindInvoke = function (propertyName, newValue, oldValue, propertyPath, binds) {

                var count = 0;
                var source = binds ? binds : _binds;
                source = propertyName ? source[propertyName] : source;

                if (source)
                    for (var key in source) {

                        if (typeof source[key] === "function") {

                            if (source[key] && (!source[key].element
                                || source[key].element && source[key].element.isConnected !== undefined && source[key].element.isConnected
                                || source[key].element && (source[key].element.parentElement || source[key].element.parentNode))) {

                                source[key]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });

                                count++;
                            }
                            else {
                                if (source[key].element && typeof source[key].element.removeBinding === "function") {
                                    source[key].element.removeBinding();
                                }
                                delete source[key];
                            }
                        }
                        else {

                            var c = item.bindInvoke(propertyName, newValue, oldValue, propertyPath, source[key]);

                            if (c === 0)
                                delete source[key];
                            else
                                count += c;
                        }
                    }


                if (propertyName && _binds && _binds[""])
                    for (var k in _binds[""])
                        if (typeof _binds[""][k] === "function")
                            _binds[""][k]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });

                if (propertyName && _binds && _binds["."])
                    for (var l in _binds["."])
                        if (typeof _binds["."][l] === "function") {

                            if (propertyPath && (propertyPath[0] === "value"
                                || newValue && (newValue.action === "add" || newValue.action === "remove" || newValue.action === "modified"))
                                && (newValue !== oldValue || newValue && oldValue && newValue.toString() !== oldValue.toString())) {

                                _binds["."][l]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });
                            }
                        }

                if (propertyName && item.parent && typeof item.parent.bindInvoke === "function") {
                    if (!propertyPath) propertyPath = Array();
                    propertyPath.push(item.parentPropertyName);
                    item.parent.bindInvoke("parent", newValue, oldValue, propertyPath);
                }

                return count;
            };
            /**
             * Add bind function in property.
             * @param {string} propertyName Property name.
             * @param {function} callback Callback function 'function(val, element[, parentPropertyValue]){...'.
             * @param {HTMLElement} element Optional. Parameter 'element' is html element. If element.parentElement is undefined or null, auto delete callback function.
             * @returns {function} Returns remove bind function.
             */
            item.addBind = function (propertyName, callback, element) {

                if (typeof propertyName === "string" && typeof callback === "function") {

                    if (propertyName && propertyName !== "." && !item[propertyName])
                        item.defineProperty(propertyName, null);

                    if (!element)
                        element = { parentElement: {} };

                    var binding = function (parentPropertyValue) { if (item[propertyName] || parentPropertyValue) callback(item[propertyName], element, parentPropertyValue); };
                    var bindingId = _bindId++;

                    if (!_binds[propertyName])
                        _binds[propertyName] = {};
                    else
                        Object.keys(_binds[propertyName]).forEach(function (key) {

                            if (_binds[propertyName][key] && !_binds[propertyName][key].element
                                || _binds[propertyName][key] && _binds[propertyName][key].element && _binds[propertyName][key].element.isConnected !== undefined && !_binds[propertyName][key].element.isConnected
                                || _binds[propertyName][key] && _binds[propertyName][key].element && !(_binds[propertyName][key].element.parentElement || _binds[propertyName][key].element.parentNode)
                            ) {
                                //debugger;
                                if (_binds[propertyName][key] && _binds[propertyName][key].element
                                    && typeof _binds[propertyName][key].element.removeBinding === "function") {
                                    _binds[propertyName][key].element.removeBinding();
                                }
                                delete _binds[propertyName][key];
                            }
                        });

                    _binds[propertyName][bindingId] = binding;
                    _binds[propertyName][bindingId].element = element;

                    var removeBinding = function () { delete _binds[propertyName][bindingId]; };
                    element.removeBinding = removeBinding;
                    binding();

                    var count = Object.keys(_binds[propertyName]).length;
                    if (count > 500) {
                        if (typeof DC.GetPathByItem === "function") {
                            console.warn("binds count: > 500 => datacontext" + DC.GetPathByItem(item[propertyName]) + "=" + item[propertyName]);
                        } else {
                            console.warn("binds count: > 500 => " + propertyName + "=" + item[propertyName]);
                        }
                    }

                    return removeBinding;
                }
            };

            /**
             * Define property.
             * @param {string} propertyName Property name.
             * @param {Object} val Optional. Property value.
             * @param {function(val)} setterFn Optional. function (val) { ... return val; }
             * @param {function(val)} getterFn Optional. function (val) { ... return val; }
             * @returns {Object} Returns value.
             */
            item.defineProperty = function (propertyName, val, setterFn, getterFn) {

                if (val && val.hasOwnProperty("value")) { val = val.value; }

                if (propertyName && propertyName !== "parent") {

                    if (propertyNames.indexOf(propertyName) > -1)
                        item.deleteProperty(propertyName);
                    if (item[propertyName])
                        delete item[propertyName];

                    propertyNames.push(propertyName);
                    Object.defineProperty(item, propertyName, {
                        configurable: true,
                        get: function () {

                            if (typeof getterFn === "function")
                                return getterFn(values[propertyName]);
                            else
                                return values[propertyName];
                        },
                        set: function (value) {

                            var oldValue = IsItem(values[propertyName])
                                && (propertyName === "value" || values[propertyName].propertyNames.length === 0)
                                ? values[propertyName].value
                                : values[propertyName];

                            if (typeof setterFn === "function" && propertyName === "value") {

                                value = setterFn(value);
                            }

                            if (value !== oldValue
                                && ((!value || !value.value) && (!oldValue || !oldValue.value)
                                    || (value && value.value || oldValue && oldValue.value)
                                    && value + "" !== oldValue + "")) {

                                if (IsItem(values[propertyName]) && !IsItem(value) && !IsCollection(value)) {
                                    values[propertyName].init(value);
                                }

                                else if (propertyName !== "value" && !values.hasOwnProperty(propertyName)
                                    && !IsItem(value) && !IsCollection(value)) {

                                    if (typeof value === "object") {

                                        if (typeof setterFn === "function")
                                            value = setterFn(value);

                                        values[propertyName] = Array.isArray(value) ? DC.Collection() : DC.Item();

                                        if (item.isOverwriting) values[propertyName].overwrite(value);
                                        else values[propertyName].init(value);
                                    }
                                    else {
                                        var val = DC.Item();
                                        val.defineProperty("value", value, setterFn);
                                        value = val;
                                        values[propertyName] = value;
                                    }
                                }
                                else if (propertyName !== "value" && !IsItem(value) && !IsCollection(value)) {
                                    values[propertyName] = DC.Item();
                                    values[propertyName].defineProperty("value", oldValue, setterFn);
                                    setTimeout(function () {
                                        values[propertyName].value = value;
                                    });
                                }
                                else {
                                    values[propertyName] = value;
                                }

                                if (values[propertyName] && values[propertyName].hasOwnProperty("parent")) { values[propertyName].parent = item; }
                                if (values[propertyName] && values[propertyName].hasOwnProperty("parentPropertyName")) { values[propertyName].parentPropertyName = propertyName; }

                                if (item[propertyName] && item[propertyName].hasOwnProperty("isModified"))
                                    item[propertyName].isModified = true;
                                else if (propertyName === "value")
                                    item.isModified = true;

                                if (propertyName === "value" && item.parent && item.parentPropertyName) {
                                    setTimeout(function () { item.parent.bindInvoke(item.parentPropertyName, values[propertyName], oldValue, Array(propertyName, item.parentPropertyName)); }, 50);
                                }
                            }
                        }
                    });


                    if (val !== undefined) {
                        item[propertyName] = val;
                    }

                    if (item[propertyName] && item[propertyName].hasOwnProperty("parent")) { item[propertyName].parent = item; }
                    if (item[propertyName] && item[propertyName].hasOwnProperty("parentPropertyName")) { item[propertyName].parentPropertyName = propertyName; }

                    return item[propertyName];
                }
            };
            /**
             * Set value in property.
             * @param {string} propertyName Property name.
             * @param {object} val Property value.
             * @param {boolean} isAutoProperty Property auto gen.
             * @returns {object} Returns value.
             */
            item.setValue = function (propertyName, val, isAutoProperty) {

                if (propertyName) {

                    if ((isAutoProperty || DC.IsAutoProperty || propertyName === "value")
                        && propertyNames.indexOf(propertyName) < 0 && item[propertyName] === undefined) {
                        val = item.defineProperty(propertyName, val);
                        if (!isNode && !isAutoProperty && propertyName !== "value")
                            console.info("AutoProperty!", "propertyName:'" + propertyName + "'", "value:'" + val + "'");
                    }
                    else if (item[propertyName] && typeof item[propertyName].init === "function")
                        item[propertyName].init(val);

                    else if (propertyName === "value" && val === null) {
                        item.defineProperty("value", val);
                    }

                    else {
                        item[propertyName] = val;
                    }
                }

                return item[propertyName];
            };
            /**
             * Delete property.
             * @param {string} propertyName Property name.
             */
            item.deleteProperty = function (propertyName) {

                if (values[propertyName] && values[propertyName].parent === item) { values[propertyName].parent = null; }
                delete values[propertyName];
                delete item[propertyName];
                if (propertyNames.indexOf(propertyName) > -1)
                    propertyNames.splice(propertyNames.indexOf(propertyName), 1);
            };

            item.clear = function () {

                var newObj = DC.CreateByType(item["-type"]);
                while (item.propertyNames.length)
                    item.deleteProperty(item.propertyNames[0]);
                item.isModified = true;
                if (newObj && newObj.propertyNames && newObj.propertyNames.length) { item.init(newObj); }
                item.bindInvoke(undefined, item);
            };
            /**
             * Load Item data.item["-type"]
             * @param {object} obj Data object.
             * @param {boolean} setIsModified .
             */
            item.overwrite = function (obj, setIsModified) {

                var overwriting = item.isOverwriting;
                item.isOverwriting = true;
                item.init(obj, setIsModified);
                if (setIsModified) item.isModified = true;
                else if (typeof setIsModified === "boolean") item.isModified = false;
                item.isOverwriting = overwriting;
            };
            item.init = function (obj, setIsModified) {

                if (Array.isArray(obj) || IsCollection(obj)) {

                    item.setValue("value", DC.Collection(), true);
                    item.isOverwriting ? item.value.overwrite(obj, setIsModified) : item.value.init(obj, setIsModified);
                }
                else if (typeof obj === "object" && obj !== null) {

                    if (obj["-isEmpty"]) {
                        item.clear();
                        if (setIsModified) item.isModified = true;
                        else if (typeof setIsModified === "boolean") item.isModified = false;
                        return;
                    }

                    var keys = IsItem(obj) ? obj.propertyNames : Object.keys(obj);
                    //var names = keys.slice(0);
                    var names = keys.filter(function (key) { return key[0] !== "-" });

                    if (!DC.IsAutoProperty/* && !item.isOverwriting*/)
                        if (keys.length > 1 && keys.indexOf("value") > -1) // illogical 'value'
                            keys = keys.filter(function (k) { return k !== "value"; });

                    keys.forEach(function (key) {

                        names = names.filter(function (name) { return name !== key; });

                        if (key[0] === "-") {
                            if (key !== '-type' || item['-type'] === "DC.Item")
                                item[key] = obj[key];
                        }

                        else if (typeof obj[key] === "string" && obj[key].trim() === "-deleted") {
                            item.deleteProperty(key);
                            item.isModified = true;
                            if (typeof setIsModified === "boolean") item.isModified = false;
                            return;
                        }

                        else if (IsItem(item[key]) || IsCollection(item[key])) {
                            item.isOverwriting ? item[key].overwrite(obj[key], setIsModified) : item[key].init(obj[key], setIsModified);
                            if (setIsModified) item[key].isModified = true;
                            else if (typeof setIsModified === "boolean") item[key].isModified = false;
                        }

                        else {
                            var value = obj[key];
                            if (Array.isArray(obj[key]) || IsCollection(obj[key])) {
                                value = DC.CreateByType(obj[key]["-type"], obj[key])
                                if (!value) value = DC.Collection();
                                item.isOverwriting ? value.overwrite(obj[key], setIsModified) : value.init(obj[key], setIsModified);
                            }
                            else if (typeof obj[key] === "object" && obj[key] !== null) {
                                value = DC.CreateByType(obj[key]["-type"], obj[key])
                                if (!value) value = DC.Item();
                                item.isOverwriting ? value.overwrite(obj[key], setIsModified) : value.init(obj[key], setIsModified);
                            }
                            item.setValue(key, value, true);
                            if (item[key] && item[key].hasOwnProperty("isModified"))
                                if (setIsModified) item[key].isModified = true;
                                else if (typeof setIsModified === "boolean") item[key].isModified = false;
                        }
                    });

                    if (!DC.IsAutoProperty && !item.isOverwriting)
                        names.forEach(function (name) { item.deleteProperty(name); });

                    if (setIsModified) item.isModified = true;
                    else if (typeof setIsModified === "boolean") item.isModified = false;
                }
                else if (obj === undefined) {

                    if (item["value"]) {
                        item.clear();
                        if (setIsModified) item.isModified = true;
                        else if (typeof setIsModified === "boolean") item.isModified = false;
                    }
                }
                else {

                    if (!DC.IsAutoProperty && !item.isOverwriting) {
                        var arr = item.propertyNames.slice(0);
                        arr.forEach(function (key) {
                            if (key !== "value")
                                item.deleteProperty(key);
                        });
                    }

                    if (typeof obj === "string" && obj.trim() === "-deleted") {
                        if (item.parent) {
                            item.parent.isModified = true;
                            if (typeof setIsModified === "boolean") item.parent.isModified = false;
                            item.parent.deleteProperty(item.parentPropertyName);
                        }
                        return;
                    }

                    item.setValue("value", obj, true);

                    if (setIsModified) item.isModified = true;
                    else if (typeof setIsModified === "boolean") item.isModified = false;
                }
            };
            /**
             * Get json string.
             * @param {function} predict 'predict' is selected function - Boolean function(key, value){...
             * @returns {string} Returns JSON string.
             */
            item.toJSON = function (predict) {

                function pushPair(key, predict) {

                    if (item[key] === undefined) return;

                    var json = getJSON(item[key], predict);

                    if (json) {
                        sArr.push("\"");
                        sArr.push(key);
                        sArr.push("\"");
                        sArr.push(":");

                        sArr.push(json);

                        sArr.push(",");
                    }
                }
                function getJSON(val, predict) {

                    if (IsCollection(val) || IsItem(val))
                        return val.toJSON(predict);

                    else if (val === undefined)
                        return "null";

                    else
                        return JSON.stringify(val);
                }

                predict = typeof predict === "function" ? predict : function () { return true; };

                var json = "";

                if (propertyNames.length === 1 && propertyNames[0] === "value" && !IsCollection(item.parent))
                    json = getJSON(item["value"], predict);
                else {

                    var sArr = ["{"];

                    if (typeof item["-type"] === "string") {

                        sArr.push("\"-type\":\"");
                        sArr.push(item["-type"]);
                        sArr.push("\"");
                        sArr.push(",");
                    }

                    if (IsCollection(item.parent)) {

                        sArr.push("\"-id\":\"");
                        sArr.push(item.parentPropertyName);
                        sArr.push("\"");
                        sArr.push(",");
                    }

                    if (item.isEmpty) {

                        sArr.push("\"-isEmpty\":\"");
                        sArr.push("true");
                        sArr.push("\"");
                        sArr.push(",");
                    }


                    propertyNames.forEach(function (key) { pushPair(key, predict); });

                    if (sArr[sArr.length - 1] === ",") { sArr.pop(); }

                    sArr.push("}");

                    json = sArr.join("");
                }

                var thisObj = {
                    key: item.parentPropertyName,
                    value: item,
                    json: json,
                    predict: predict
                };

                if (predict.call(thisObj, thisObj.key, thisObj.value)) {
                    return thisObj.json;
                }

                return "";
            };
            item.toPrettyJSON = function (predict) {
                var json = item.toJSON(predict);
                if (!json) return json;
                return JSON.stringify(JSON.parse(json), null, 2);
            };
            /**
             * Returns property names.
             * @returns {string} .
             */
            item.toString = function () {

                if (item.propertyNames.length === 1 && item.propertyNames[0] === "value")
                    return item.value + "";

                return DC.IsDebuger ? "typeOf " + item["-type"] + " properties[" + propertyNames + "]" : "";
            };

            item.toObject = function () { return JSON.parse(item.toJSON()); };

            if (obj !== undefined) { item.init(obj, setIsModified); }

            return item;
        }

        return Item;
    })();

    var IsItem = function (obj) { return obj && obj.isItem ? true : false; };
    DC.IsItem = IsItem;

    //#endregion

    //#region Collection

    DC.Collection = (function () {
        /**
         * Creates a new Collection.
         * @param {any[]} obj Optional. Init. data.
         * @param {string} itemType Optional. Item type.
         * @param {boolean} setIsModified Optional.
         * @returns {Collection} .
         */
        function Collection(obj, itemType, setIsModified) {

            var collection = {};
            collection["-type"] = "DC.Collection";
            var _bindId = 0;
            var _binds = {};
            Object.defineProperty(collection, "-binds", { get: function () { return _binds; } });
            var idCount = 0;
            var values = {};
            Object.defineProperty(collection, "-values", { get: function () { return values; } });
            collection.itemType = itemType;
            Object.defineProperty(collection, "isCollection", { get: function () { return true; } });

            var propertyNames = [];
            /** Defined properties in 'collection' */
            Object.defineProperty(collection, "propertyNames", { get: function () { return propertyNames; } });
            Object.defineProperty(collection, "length", { get: function () { return propertyNames.length; } });

            var parent = null;
            /** Parent object */
            Object.defineProperty(collection, "parent", { get: function () { return parent; }, set: function (value) { parent = value; } });
            var parentPropertyName = null;
            Object.defineProperty(collection, "parentPropertyName", { get: function () { return parentPropertyName; }, set: function (value) { parentPropertyName = value; } });

            var removedIDs = [];
            Object.defineProperty(collection, "removedIDs", { get: function () { return removedIDs; } });
            Object.defineProperty(collection, "isEmpty", { get: function () { return !collection.length && !collection.removedIDs.length; } });
            var isModified = true;
            Object.defineProperty(collection, "isModified", {
                get: function () {
                    if (isModified)
                        return isModified;
                    return collection.filter(function (item) { return item.isModified; }).length > 0;
                },
                set: function (val) { isModified = val; },
                configurable: true
            });
            Object.defineProperty(collection, "isOverwriting", { value: false, writable: true, configurable: true });
            Object.defineProperty(collection, "firstItem", { get: function () { return values[propertyNames[0]]; } });
            Object.defineProperty(collection, "lastItem", { get: function () { return values[propertyNames[propertyNames.length - 1]]; } });


            function push(obj, id) {

                if (idCount < id) { idCount = id; }
                var propertyName = "id_" + idCount++;
                if (obj && obj.hasOwnProperty("parent")) { obj.parent = collection; }
                if (obj && obj.hasOwnProperty("parentPropertyName")) { obj.parentPropertyName = propertyName; }

                obj["-id"] = propertyName;
                values[propertyName] = obj;
                propertyNames.push(propertyName);

                Object.defineProperty(collection, propertyName, {
                    configurable: true,
                    get: function () { return values[propertyName]; },
                    set: function (value) {
                        if (value !== values[propertyName]) {
                            var oldValue = values[propertyName];

                            if (values[propertyName] && typeof values[propertyName].setValue === "function"
                                && !IsItem(value) && !IsCollection(value))
                                values[propertyName] = DC.Item(value);
                            else
                                values[propertyName] = value;

                            if (values[propertyName] && values[propertyName].hasOwnProperty("parent")) { values[propertyName].parent = collection; }
                            if (values[propertyName] && values[propertyName].hasOwnProperty("parentPropertyName")) { values[propertyName].parentPropertyName = propertyName; }


                            if (!collection.isOverwriting) {
                                collection.bindInvoke(propertyName, values[propertyName], oldValue, Array(propertyName));
                            }
                        }
                    }
                });

                var index = propertyNames.length - 1;
                Object.defineProperty(collection, index, {
                    configurable: true,
                    get: function () {
                        return propertyNames[index] && values[propertyNames[index]]
                            ? values[propertyNames[index]]
                            : undefined;
                    },
                    set: function (value) {

                        if (propertyNames[index] && value !== values[propertyNames[index]]) {

                            var oldValue = values[propertyNames[index]];

                            if (values[propertyNames[index]] && typeof values[propertyNames[index]].setValue === "function"
                                && !IsItem(value) && !IsCollection(value)) {
                                values[propertyNames[index]] = DC.Item(value);
                            }
                            else {
                                values[propertyNames[index]] = value;
                                values[propertyNames[index]]["-id"] = propertyNames[index];
                            }

                            if (values[propertyNames[index]] && values[propertyNames[index]].hasOwnProperty("parent")) { values[propertyNames[index]].parent = collection; }
                            if (values[propertyNames[index]] && values[propertyNames[index]].hasOwnProperty("parentPropertyName")) { values[propertyNames[index]].parentPropertyName = propertyNames[index]; }

                            if (!collection.isOverwriting) { collection.bindInvoke(index, values[propertyNames[index]], oldValue, [index]); }
                        }
                    }
                });

                return propertyNames.length;
            }
            collection["-values"].push = push;
            function splice(start, deleteCount) {
                var result = [];
                var removed = propertyNames.splice(start, deleteCount);
                removed.forEach(function (propertyName) {
                    removedIDs.push(propertyName);
                    values[propertyName].parent = null;
                    result.push(values[propertyName]);
                    delete values[propertyName];
                    delete collection[propertyName];
                    if (collection.hasOwnProperty(propertyNames.length))
                        delete collection[propertyNames.length];
                });
                return result;
            }
            collection["-values"].splice = splice;

            /**
             * Invoke bind Collection update.
             * @param {Object} val Optional. 'val' is object { action: 'addBind|add|remove|modified', items: [], source: [] }
             * @returns {Number} Returns invoke count.
             */
            collection.bindInvokeCollection = function (val) {

                var count = 0;
                for (var key in _binds) {

                    if (key === "parent" || key === "values") continue;

                    if (!_binds[key].element || _binds[key].element && _binds[key].element.parentElement) {

                        if (typeof _binds[key] === "function") {

                            _binds[key](val);
                            count++;
                        }
                    }
                    else
                        delete _binds[key];
                }

                if (val && _binds && _binds[""])
                    for (var k in _binds[""])
                        if (typeof _binds[""][k] === "function")
                            _binds[""][k]({ newValue: val, oldValue: null, propertyPath: Array(collection.parentPropertyName) });

                if (val && _binds && _binds["."])
                    for (var l in _binds["."])
                        if (typeof _binds["."][l] === "function") {

                            if (val && (val.action === "add" || val.action === "remove" || val.action === "modified")) {

                                _binds["."][l]({ newValue: val, oldValue: null, propertyPath: Array(collection.parentPropertyName) });
                            }
                        }

                if (val && collection.parent && typeof collection.parent.bindInvoke === "function") {
                    collection.parent.bindInvoke("parent", val, null, Array(collection.parentPropertyName));
                }

                return count;
            };
            /**
             * Add bind function in collection.
             * @param {function} callback function(val){... // 'val' is object { action: 'addBind|add|remove|modified', items: [], source: [] }.
             * @param {HTMLElement} element Optional. 'element' is html element. If element.parentElement is undefined or null, auto delete callback function.
             * @returns {function} Returns remove bind function.
             */
            collection.addBindCollection = function (callback, element) {

                if (typeof callback === "function") {

                    var bindingId = _bindId++;

                    if (!element)
                        element = { parentElement: {} };

                    _binds[bindingId] = function (val) { callback(val, element); };
                    _binds[bindingId].element = element;

                    var removeBinding = function () { delete _binds[bindingId]; };
                    element.removeBinding = removeBinding;

                    _binds[bindingId]({
                        action: "addBind",
                        items: collection.toArray(true),
                        parent: collection.parent,
                        source: collection,
                        toString: function () { return "action:'addBind', actionItems.length:" + collection.length + " source:" + collection.toString(); }
                    });

                    var count = Object.keys(_binds).length;
                    if (count > 500) {
                        if (typeof DC.GetPathByItem === "function") {
                            console.warn("binds count: > 500 => datacontext" + DC.GetPathByItem(collection) + "=" + collection.toString());
                        } else {
                            console.warn("binds count: > 500 => " + collection.toString());
                        }
                    }

                    return removeBinding;
                }
            };

            /**
             * Invoke bind Collection Item update.
             * @param {String} propertyName  property name .
             * @param {any} newValue Optional.
             * @param {any} oldValue Optional.
             * @param {ArrayOfString} propertyPath Optional.
             * @param {Object} binds Optional.
             * @returns {Number} Returns invoke count.
             */
            collection.bindInvoke = function (propertyName, newValue, oldValue, propertyPath, binds) {

                var count = 0;
                var source = values[propertyName] ? values[propertyName].binds : null;
                if (!source) {
                    source = binds ? binds : (function () {

                        var resut = [];
                        collection.toArray(true).forEach(function (val) {

                            if (val) {
                                if (!propertyName && val.binds)
                                    resut.push(val.binds);
                                else if (val["-binds"] && val["-binds"][propertyName])
                                    resut.push(val["-binds"][propertyName]);
                            }
                        });
                        return resut;
                    })();
                }

                if (source)
                    for (var key in source) {

                        if (typeof source[key] === "function") {

                            if (!source[key].element || source[key].element && source[key].element.parentElement) {

                                source[key]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });
                                count++;
                            }
                            else
                                delete source[key];
                        }
                        else if (source[key]) {

                            var c = collection.bindInvoke(propertyName, newValue, oldValue, propertyPath, source[key]);

                            if (c === 0)
                                delete source[key];
                            else
                                count += c;
                        }
                        else
                            delete source[key];
                    }


                if (_binds && _binds[""])
                    for (var k in _binds[""])
                        if (typeof _binds[""][k] === "function")
                            _binds[""][k]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });

                if (_binds && _binds["."])
                    for (var l in _binds["."])
                        if (typeof _binds["."][l] === "function") {

                            if (propertyPath && (propertyPath[0] === "value"
                                || newValue && (newValue.action === "add" || newValue.action === "remove" || newValue.action === "modified"))
                                && (newValue !== oldValue || newValue.toString() !== oldValue.toString())) {

                                _binds["."][l]({ newValue: newValue, oldValue: oldValue, propertyPath: propertyPath });
                            }
                        }

                if (collection.parent && typeof collection.parent.bindInvoke === "function") {
                    if (!propertyPath) propertyPath = Array();
                    propertyPath.push(collection.parentPropertyName);
                    collection.parent.bindInvoke("parent", newValue, oldValue, propertyPath);
                }

                return count;
            };
            /**
             * Add bind item function in collection.
             * @param {String} propertyName property name.
             * @param {function} callback function(val, element, parentPropertyValue){...
             * @param {HTMLElement} element Optional.'element' is html element.If element.parentElement is undefined or null, auto delete callback function.
             * @returns {function} Returns remove bind function.
             */
            collection.addBind = function (propertyName, callback, element) {

                if (typeof propertyName === "string" && typeof callback === "function") {

                    if (!element)
                        element = { parentElement: {} };

                    var binding = function (parentPropertyValue) { callback(collection[propertyName], element, parentPropertyValue); };
                    var bindingId = _bindId++;

                    if (!_binds[propertyName])
                        _binds[propertyName] = {};
                    else
                        Object.keys(_binds[propertyName]).forEach(function (key) {

                            if (_binds[propertyName][key] && !_binds[propertyName][key].element
                                || _binds[propertyName][key] && _binds[propertyName][key].element && _binds[propertyName][key].element.isConnected !== undefined && !_binds[propertyName][key].element.isConnected
                                || _binds[propertyName][key] && _binds[propertyName][key].element && !(_binds[propertyName][key].element.parentElement || _binds[propertyName][key].element.parentNode)
                            ) {
                                //debugger;
                                if (_binds[propertyName][key] && _binds[propertyName][key].element
                                    && typeof _binds[propertyName][key].element.removeBinding === "function") {
                                    _binds[propertyName][key].element.removeBinding();
                                }
                                delete _binds[propertyName][key];
                            }
                        });

                    _binds[propertyName][bindingId] = binding;
                    _binds[propertyName][bindingId].element = element;

                    var removeBinding = function () { delete _binds[propertyName][bindingId]; };
                    element.removeBinding = removeBinding;
                    binding();

                    var count = Object.keys(_binds[propertyName]).length;
                    if (count > 500) {
                        if (typeof DC.GetPathByItem === "function") {
                            console.warn("binds count: > 500 => datacontext" + DC.GetPathByItem(collection[propertyName]) + "=" + collection[propertyName]);
                        } else {
                            console.warn("binds count: > 500 => " + propertyName + "=" + collection[propertyName]);
                        }
                    }

                    return removeBinding;
                }
            };

            function parseItem(obj, setIsModified) {

                var item;

                if ((IsItem(obj) || IsCollection(obj)) && !collection.itemType) {
                    item = obj;
                }
                else if (typeof eval(collection.itemType) === "function") {

                    item = eval(collection.itemType)();

                    if (typeof item.overwrite === "function" && typeof item.init === "function")
                        collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                    else
                        item = eval(collection.itemType)(obj);

                }
                else if (!isNode && typeExist(obj["-type"])) {

                    item = eval(obj["-type"])();

                    if (typeof item.overwrite === "function" && typeof item.init === "function")
                        collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                    else
                        item = eval(obj["-type"])(obj);
                }
                else if (IsCollection(obj) || IsItem(obj)) {
                    item = obj;
                    collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                }
                else if (typeof obj === "object" && obj !== null) {

                    if (Array.isArray(obj)) {
                        item = DC.Collection();
                        collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                    }
                    else {
                        item = DC.Item();
                        collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                    }
                }
                else {
                    item = DC.Item();
                    collection.isOverwriting ? item.overwrite(obj, setIsModified) : item.init(obj, setIsModified);
                }

                if (item.hasOwnProperty("isModified")) {
                    if (setIsModified) item.isModified = true;
                    else if (typeof setIsModified === "boolean") item.isModified = false;
                }

                return item;
            }
            /**
             * Add 'obj' in collection.
             * @param {Object} obj .
             * @param {boolean} setIsModified .
             */
            collection.add = function (obj, setIsModified) {

                var id = obj && obj["-id"] ? parseInt((obj["-id"] + "").substr(3)) : 0;
                var item = parseItem(obj, setIsModified);
                push(item, id);

                var actionItem = {
                    action: "add",
                    items: [item],
                    parent: collection.parent,
                    source: collection,
                    toString: function () { return "action:'add', actionItems.length:1 source:" + collection.toString(); }
                };

                collection.bindInvokeCollection(actionItem);
            };
            /**
             * Add 'array' values in collection.
             * @param {Array} array .
             */
            collection.addRange = function (array, setIsModified) {

                if (arguments.length > 1)
                    array = Array.prototype.slice.call(arguments);

                if (Array.isArray(array) || IsCollection(array)) {

                    var items = [];

                    for (var i = 0; i < array.length; i++) {

                        var id = obj && obj["-id"] ? parseInt(obj["-id"].substr(3)) : 0;
                        var item = parseItem(array[i], setIsModified);
                        items.push(item);
                        push(item, id);
                    }

                    var actionItem = {
                        action: "add",
                        items: items,
                        parent: collection.parent,
                        source: collection,
                        toString: function () { return "action:'add', actionItems.length:" + items.length + " source:" + collection.toString(); }
                    };

                    collection.bindInvokeCollection(actionItem);
                }
                else {
                    collection.add(array);
                }
            };
            /** Removes all elements from the Collection. */
            collection.clear = function () {
                if (collection.length) //setTimeout(function () { collection.removeAll(function () { return true; }); }, 1);
                    collection.removeAll(function () { return true; });
                removedIDs = [];
                idCount = 0;
            };
            /**
             * Remove item in collection.
             * @param {function} predict 'predict' is function - Boolean function(item){... 
             * @returns {Array} Returns removed item.
             */
            collection.remove = function (predict) {

                if (predict)
                    for (var i = 0; i < collection.length; i++) {

                        if (collection[i] !== undefined && predict(collection[i])) {

                            var removed = splice(i, 1);

                            collection.isModified = true;

                            var actionItem = {
                                action: "remove",
                                items: removed,
                                parent: collection.parent,
                                source: collection,
                                toString: function () { return "action:'remove', actionItems.length:" + removed.length + " source:" + collection.toString(); }
                            };

                            collection.bindInvokeCollection(actionItem);

                            return removed;
                        }
                    }
            };
            /**
             * Remove items in collection.
             * @param {function} predict 'predict' is function - Boolean function(item){...
             * @returns {Array} Returns removed items.
             */
            collection.removeAll = function (predict) {

                var removed = [];

                if (predict) {

                    for (var i = collection.length - 1; i > -1; i--) {

                        if (predict(collection[i])) {

                            removed = removed.concat(splice(i, 1));
                        }
                    }

                    collection.isModified = true;

                    var actionItem = {
                        action: "remove",
                        items: removed,
                        parent: collection.parent,
                        source: collection,
                        toString: function () { return "action:'remove', actionItems.length:" + removed.length + " source:" + collection.toString(); }
                    };

                    collection.bindInvokeCollection(actionItem);
                }

                return removed;
            };
            /**
             * Source item will remove and it will be placed just after destination
             * @param {number} fromIndex Source item index.
             * @param {number} toIndex Destination index.
             * @param {boolean} notInvoke Invoke bind Collection update.
             */
            collection.moveItemTo = function (fromIndex, toIndex, notInvoke) {

                if (fromIndex >= -1 && toIndex > -1) {

                    var tempItem = collection[fromIndex];
                    collection[fromIndex] = collection[toIndex];
                    collection[toIndex] = tempItem;

                    collection.isModified = true; // For test
                    collection[fromIndex].isModified = true;
                    collection[toIndex].isModified = true;

                    if (!notInvoke) {
                        var actionItem = {
                            action: "modified",
                            items: [collection[fromIndex], collection[toIndex]],
                            parent: collection.parent,
                            source: collection,
                            toString: function () { return "action:'modified', actionItems.length:" + items.length + " source:" + collection.toString(); }
                        };

                        collection.bindInvokeCollection(actionItem);
                    }
                }
            };
            /**
             * Returns the index of the first occurrence of a value in an array.
             * @param {any} searchElement The value to locate in the array.
             * @param {number} fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
             * @returns {number} Returns the index.
             */
            collection.indexOf = function (searchElement, fromIndex) {

                if (!searchElement) return -1;

                return propertyNames.indexOf(searchElement.parentPropertyName, fromIndex);
            };
            /**
             * Load collection.
             * @param {object} obj data.
             * @param {boolean} setIsModified .
             */
            collection.overwrite = function (obj, setIsModified) {

                var overwriting = collection.isOverwriting;
                collection.isOverwriting = true;
                collection.init(obj, setIsModified);
                if (setIsModified) collection.isModified = true;
                else if (typeof setIsModified === "boolean") collection.isModified = false;
                collection.isOverwriting = overwriting;
            };
            collection.init = function (obj, setIsModified) {

                function parseID(str) { return str ? parseInt(str.substr(3)) : -1; }
                function setObj(obj) {

                    if (obj["-deleted"]) {
                        if (collection[obj["-deleted"]])
                            collection.remove(function (v) { return v.parentPropertyName === obj["-deleted"]; });
                        if (removedIDs.indexOf(obj["-deleted"]) < 0)
                            removedIDs.push(obj["-deleted"]);
                        var id = parseID(obj["-deleted"]);
                        id++;
                        if (idCount < id) { idCount = id; }
                    }
                    else if (collection[obj["-id"]]) {
                        if (typeof collection.overwrite === "function" && typeof collection.init === "function")
                            collection.isOverwriting ? collection[obj["-id"]].overwrite(obj, setIsModified) : collection[obj["-id"]].init(obj, setIsModified);
                        else {
                            if (setIsModified && obj && obj.hasOwnProperty("isModified")) obj.isModified = true;
                            collection[obj["-id"]] = obj;
                        }
                    }
                    else {
                        collection.add(obj, setIsModified);
                    }
                }

                if (!collection.isOverwriting) {
                    collection.clear();
                }

                if (Array.isArray(obj) || IsCollection(obj)) {

                    if (obj.length > 0) {

                        if (!collection.isOverwriting && obj.hasOwnProperty("isEmpty") && obj.isEmpty || typeof obj.filter === "function"
                            && obj.filter(function (v) { return v === "-isEmpty"; }).length) {
                            collection.clear();
                            return;
                        }

                        if (IsCollection(obj)) { obj = obj.toArray(true); }

                        obj.sort(function (a, b) {
                            a = a["-id"] ? a["-id"] : a["-deleted"];
                            b = b["-id"] ? b["-id"] : b["-deleted"];
                            a = parseID(a);
                            b = parseID(b);
                            if (a > -1 && b > -1) {
                                if (a < b) { return -1; }
                                if (a > b) { return 1; }
                            }
                            else {
                                if (a > b) { return -1; }
                                if (a < b) { return 1; }
                            }
                            return 0;
                        });

                        obj.forEach(function (v) { setObj(v); });
                    }
                }
                else if (obj !== undefined && obj !== null) {
                    setObj(obj);
                }
                else if (obj === null) {
                    collection.clear();
                }

                if (setIsModified) collection.isModified = true;
                else if (typeof setIsModified === "boolean") collection.isModified = false;
            };
            /**
             * Get json string.
             * @param {function} predict 'predict' is selected function - Boolean function(key, value){...
             * @returns {string} Returns JSON string.
             */
            collection.toJSON = function (predict) {

                function getJSON(val, predict) {

                    if (IsCollection(val) || IsItem(val)) {
                        var json = val.toJSON(predict);
                        if (json === "null") return "";
                        return json;
                    }
                    if (val === undefined)
                        return "";

                    return JSON.stringify(val);
                }

                predict = typeof predict === "function" ? predict : function () { return true; };
                var sArr = ["["];

                if (collection.isEmpty) {
                    sArr.push("\"-isEmpty\"");
                }
                else {
                    removedIDs.forEach(function (id) {

                        sArr.push("{\"-deleted\":\"" + id + "\"}");
                        sArr.push(",");
                    });

                    collection.forEach(function (value, index) {

                        if (value === undefined) return;

                        var thisObj = {
                            key: value.parentPropertyName,
                            value: value,
                            json: getJSON(value, predict),
                            predict: predict
                        };

                        if (thisObj.json) {
                            sArr.push(thisObj.json);
                            sArr.push(",");
                        }
                    });
                }

                if (sArr[sArr.length - 1] === ",") { sArr.pop(); }
                sArr.push("]");

                var thisObj = {
                    key: collection.parentPropertyName,
                    value: collection,
                    json: sArr.join(""),
                    predict: predict
                };

                if (predict.call(thisObj, thisObj.key, thisObj.value)) {
                    return thisObj.json;
                }

                return "";
            };
            collection.toPrettyJSON = function (predict) {
                var json = collection.toJSON(predict);
                if (json) {
                    try { json = JSON.stringify(JSON.parse(json), null, 2); }
                    catch (e) { console.error(e); }
                }
                return json;
            };
            /**
             * Returns property names.
             * @returns {string} .
             */
            collection.toString = function () {

                return DC.IsDebuger ? "typeOf '" + collection["-type"] + "<" + collection.itemType + ">' length = " + collection.length : "";
            };
            /**
             * Performs the specified action for each element in an array.
             * @param {function} callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
             */
            collection.forEach = function (callbackfn) {

                if (typeof callbackfn === "function") {

                    propertyNames.forEach(function (propertyName, index) {
                        callbackfn(collection[index], index, collection);
                    });
                }
            };
            /**
            * Returns the elements of an array that meet the condition specified in a callback function.
            * @param {function} callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
            * @returns {array} Returns the elements of an array that meet the condition specified in a callback function.
            */
            collection.filter = function (callbackfn) {

                var result = [];

                if (typeof callbackfn === "function") {

                    propertyNames.forEach(function (propertyName, index) {

                        if (callbackfn(collection[index], index, collection))
                            result.push(collection[index]);
                    });
                }

                return result;
            };
            /**
             * 
             * @param {(val:any,index:number,collection:Collection)any} callbackfn
             * @returns {any}
             */
            collection.find = function (callbackfn) {

                if (typeof callbackfn === "function") {

                    for (var i = 0; i < propertyNames.length; i++) {

                        if (callbackfn(collection[i], i, collection))
                            return collection[i];
                    }
                }
            };
            /**
             * Sorts collection.
             * @param {function} callbackfn Function used to determine the order of the elements. It is expected to return
             * a negative value if first argument is less than second argument, zero if they're equal and a positive
             * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
             * @param {boolean} notInvoke Invoke bind Collection update.
             */
            collection.sort = function (callbackfn, notInvoke) {

                function swap(leftIndex, rightIndex) {
                    if (leftIndex !== rightIndex)
                        collection.moveItemTo(leftIndex, rightIndex, true);
                }
                function partition(left, right) {
                    var pivot = collection[Math.floor((right + left) / 2)], //middle element
                        i = left, //left pointer
                        j = right; //right pointer
                    while (i <= j) {
                        //while (items[i] < pivot) {
                        while (callbackfn(collection[i], pivot) < 0) {
                            i++;
                        }
                        //while (collection[j] > pivot) {
                        while (callbackfn(collection[j], pivot) > 0) {
                            j--;
                        }
                        //if (i <= j) {
                        if (i <= j) {
                            swap(i, j); //sawpping two elements
                            i++;
                            j--;
                        }
                    }
                    return i;
                }
                function quickSort(left, right) {
                    var index;
                    if (collection.length > 1) {
                        index = partition(left, right); //index returned from partition
                        if (left < index - 1) { //more elements on the left side of the pivot
                            quickSort(left, index - 1);
                        }
                        if (index < right) { //more elements on the right side of the pivot
                            quickSort(index, right);
                        }
                    }
                }
                quickSort(0, collection.length - 1);

                if (!notInvoke) {
                    var items = [];
                    collection.forEach(function (item) {
                        items.push(item);
                    });
                    var actionItem = {
                        action: "modified",
                        items: items,
                        parent: collection.parent,
                        source: collection,
                        toString: function () { return "action:'modified', actionItems.length:" + items.length + " source:" + collection.toString(); }
                    };

                    collection.bindInvokeCollection(actionItem);
                }
            };
            /**
             * Returns array.
             * @returns {array} .
             */
            collection.toArray = function (includedRemovedIDs) {

                return (includedRemovedIDs ? removedIDs.concat(propertyNames) : propertyNames)
                    .map(function (key) {
                        return removedIDs.indexOf(key) > -1
                            ? { "-deleted": key } :
                            !values[key]
                                ? undefined
                                : values[key];
                    });
            };
            collection.toObject = function () { return JSON.parse(collection.toJSON()); };

            if (obj) { collection.init(obj, setIsModified); }

            return collection;
        }

        return Collection;

    })();

    var IsCollection = function (obj) { return obj && obj.isCollection ? true : false; };
    DC.IsCollection = IsCollection;

    //#endregion


    DC.IsModifiedPredict = function (key, value, predict, not_modify_property_Modified) {

        if (!predict || typeof predict === "function" && predict(key, value)) {

            if (DC.IsItem(value)) {
                if (value.isModified) {
                    this.json = value.toJSON(predict);
                    if (!not_modify_property_Modified)
                        value.isModified = false;
                }
                else if (value && value.propertyNames
                    && value.propertyNames.length === 1
                    && value.propertyNames[0] === "value") {

                    this.json = '';
                }
                else if (this.json !== '' && this.json !== undefined) {

                    var obj = JSON.parse(this.json);
                    delete obj["-type"];
                    delete obj["-id"];
                    delete obj["-isEmpty"];
                    delete obj["value"];

                    if (typeof obj !== "object" || !Object.keys(obj).length)
                        this.json = '';
                }
            }
            else if (DC.IsCollection(value)) {
                if (value.isModified) {
                    if (this.json === '')
                        this.json = value.toJSON(predict);
                    if (!not_modify_property_Modified)
                        value.isModified = false;
                }
                else if (this.json !== '') {

                    var arr = JSON.parse(this.json);
                    if (Array.isArray(arr)) {
                        arr = arr.filter(function (val) {
                            return val !== "-isEmpty"
                                && Object.keys(val).indexOf("-deleted") < 0;
                        });
                    }

                    if (!Array.isArray(arr) || !arr.length)
                        this.json = '';
                }
            }
            else {
                return false;
            }

            return this.json.length;
        }
        return false;
    };

    function typeExist(strType) {

        if (isNode) return false;
        if (typeof strType !== "string") return false;
        var str = '', path = strType.split('.');
        while (path.length) {
            str += str === '' ? path.shift() : '.' + path.shift();
            var o = eval(str);
            if (!o || !(typeof o === "function" || path.length))
                return false;
        }
        return true;
    }
    DC.CreateByType = function (strType, obj) {
        if (typeExist(strType)) {
            return eval(strType)(obj);
        }
        return null;
    };

    return DC;

})));