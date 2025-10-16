<p>
  <img src="logo/logo-432x260.png" alt="data-context logo" width="440" style="background-color:#333;border-radius:4em;border-color: #999;border-width: 0.5em;border-style: dashed;">
</p>

# data-context  

Watch data changes in the browser and node.js

## 📚 Table of contents

 - [✨ Features](#-features)
 - [📋 Description](#-description)
 - [📦 Installation](#-installation)
 - [🧪 Testing](#-testing)
 - [🚀 Usage](#-usage)
 - [📖 API Reference](#-api-reference)
 - [📜 License](#-license)

 <p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## ✨ Features

 - Create a context from the data.
 - Listen for change events.
 - Update the context.
 - Parse JSON data to the context.
 - Stringify changes to JSON.
 - Used extended JSON data format. Metadata and comments are supported.

 <p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## 📋 Description

The 'data-context' module provides a way to create a data context that can watch for changes in the data.

It is a simple and easy-to-use library that can be used in the browser or in node.js.
You can create a context from the data, then listen for change events and stringify changes.
Included event-emitter functions. Automatically detects changes in the data and emits events.
Designed for module 'data-context-binding' for binding data to the DOM and for module 'fs-broker' for working with files.
Using a single-page application (SPA) with the ['data-context-binding'](https://www.npmjs.com/package/data-context-binding) module gives very good results.
This module is part of the ['conextra'](https://www.npmjs.com/package/conextra) framework,
which is a simple and easy-to-use single-page application (SPA) framework.
You have to try it! A different solution than MVC (model–view–controller).

> Please note, this version is not backward compatible with version 1.x<br>
> Please note that JSON string is not 100% compatible.<br>
> It has been extended to allow for incremental updates of JSON files.<br>
> Added the ability to include metadata and comments.<br>
> Parsing of JSON files is enabled.

The code in 'data-context' provides a robust mechanism for creating data contexts that can track changes, 
emit events, and support serialization/deserialization. 
It leverages JavaScript proxies to intercept and manage property operations, 
making it a powerful tool for managing state in complex applications.

The data context library implemented in 'data-context' can be used in various scenarios where tracking changes to data, 
emitting events, and managing state are essential. 
Here are some potential use cases:

**1. State Management in Single Page Applications (SPAs)**
 - **Description**: Manage the state of an application by creating data contexts for different parts of the state.
 - **Example**: Use the library to track changes in user data, application settings, or UI state, and automatically update the UI when changes occur.

**2. Data Binding**
 - **Description**: Bind data to the DOM and automatically update the DOM when the data changes.
 - **Example**: Use the library in conjunction with a data-binding library like data-context-binding to create dynamic and responsive web applications.

**3. Form Handling**
 - **Description**: Track changes to form inputs and validate data in real-time.
 - **Example**: Create a data context for form data, listen for changes to input fields, and validate the data or provide instant feedback to the user.

**4. Real-time Collaboration**
 - **Description**: Enable real-time collaboration features by synchronizing data changes across multiple clients.
 - **Example**: Use the library to track changes to a shared document or project, and emit events to notify other clients of the changes.

**5. Undo/Redo Functionality**
 - **Description**: Implement undo and redo functionality by tracking changes to data and allowing users to revert to previous states.
 - **Example**: Use the library to maintain a history of changes and provide undo/redo capabilities in applications like text editors or drawing tools.

**6. Data Synchronization**
 - **Description**: Synchronize data between different parts of an application or between client and server.
 - **Example**: Use the library to track changes to local data and synchronize those changes with a remote server or other clients.

**7. Configuration Management**
 - **Description**: Manage application configuration settings and track changes to those settings.
 - **Example**: Create a data context for configuration settings, listen for changes, and update the application behavior accordingly.

**8. Logging and Auditing**
 - **Description**: Log changes to data for auditing purposes.
 - **Example**: Use the library to track changes to sensitive data and log those changes for security audits or compliance purposes.

**9. Testing and Debugging**
 - **Description**: Facilitate testing and debugging by tracking changes to data and emitting events.
 - **Example**: Use the library to create test cases that verify the correct behavior of data changes and event emissions.

**10. Incremental JSON Updates**
 - **Description**: Handle incremental updates to JSON data, including metadata and comments.
 - **Example**: Use the library to parse, modify, and serialize JSON data with support for incremental updates and metadata.

<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## 📦 Installation

[Available on npm](https://www.npmjs.com/package/data-context)

### nodejs:
```bash
npm install data-context
```

### browser:
or use CDN  (for an HTML page hosted on the server):
```html
<script src="./node_modules/data-context/borwser.js" type="text/javascript"></script>
```
or use CDN (for a standalone HTML page):
```html
<script src="https://cdn.jsdelivr.net/npm/data-context" type="text/javascript"></script>
```
or use 'tiny-https-server':
```html
<script async src="node_modules/data-context@2"></script>
```

<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## 🧪 Testing

You can test `data-context` on your system using this command:

`node ./node_modules/data-context/index.test`

or in the `data-context` project directory:

`npm test`

or open in your browser: 

`./node_modules/data-context/index.test.html`

<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## 🚀 Usage

### nodejs example:
```javascript
'use strict';

//Import the required modules.
const { createDataContext, parse } = require('data-context');
//import { createDataContext, parse } from "data-context";

//Create a JSON string.
var strJSON = `{
    "count": 0
}`;

//Interval id.
var intervalId = null;

//Create data context.
const context = parse(
    //Parse the JSON string.
    strJSON,
    //Reviver function. Create data context.
    createDataContext
);

//Listen to the count property.
context.on('count', (event) => {

    console.log('event:', event);

    if (event.newValue > 10) {

        console.log('I am dead.');
        clearInterval(intervalId);

        //I am dead. Remove listener.
        return false;
    }

    //I am live. Continue listening.
    return true;
});

context.on('-change', (event) => {

    //Stringify the changes.
    var str = context.stringifyChanges(
        //Reviver function. Default is null.
        null,
        //Indentation. Default is 0.
        4,
        //Include only modified data. Default is true.
        true,
        //Set data to unmodified after stringification. Default is true.
        true
    );
    console.log('changes:', str);

    //I am live. Continue listening.
    return true;
});

//Start the interval.
intervalId = setInterval(() => {

    //Increment the count property.
    context.count++;
}, 1000);
```

### browser example:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>data-context</title>
    <!-- STEP 1. Import the module. Import for an HTML page hosted on the server. -->
    <script type="text/javascript" src="./index.js"></script>
    <!-- STEP 1. Import the module. Import for a standalone HTML page. -->
    <!--<script src="https://cdn.jsdelivr.net/npm/data-context"></script>-->
    <script>

        'use strict';

        // STEP 3. Import the module.
        importModules(['data-context'], function (DC) {

            var { createDataContext, parse } = DC;

            //Create a JSON string.
            var strJSON = `{
                "count": 0
            }`;

            //Interval id.
            var intervalId = null;

            //Create data context.
            const context = parse(
                //Parse the JSON string.
                strJSON,
                //Reviver function. Create data context.
                createDataContext
            );

            //Listen to the count property.
            context.on('count', (event) => {

                console.log('event:', event);

                if (event.newValue > 10) {

                    console.log('I am dead.');
                    clearInterval(intervalId);

                    //I am dead. Remove listener.
                    return false;
                }

                //I am live. Continue listening.
                return true;
            });

            context.on('-change', (event) => {

                //Stringify the changes.
                var str = context.stringifyChanges(
                    //Reviver function. Default is null.
                    null,
                    //Indentation. Default is 0.
                    4,
                    //Include only modified data. Default is true.
                    true,
                    //Set data to unmodified after stringification. Default is true.
                    true
                );
                console.log('changes:', str);

                //I am live. Continue listening.
                return true;
            });

            //Start the interval.
            intervalId = setInterval(() => {

                //Increment the count property.
                context.count++;
            }, 1000);
        });

        // STEP 2. Add module import function.
        /**
         * Module import function.
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
    </script>
</head>
<body>
    <h3>Example 'data-context'</h3>
    <p>Press F12. Console results.</p>
</body>
</html>
```

## 📖 API Reference

- [createDataContext(data, propertyName, parent)](#createdatacontextdata-propertyname-parent)
- [DataContext](#datacontext)
- [EventListener(event)](#eventlistenerevent)
- [EventObject](#eventobject)
- [PropertyName](#propertyname)
- [Reviver](#reviver)

<p align="right"><a href="#data-context">Back to top ↑</a></p>

### *createDataContext(data, propertyName, parent)*

Create a data context from the data.

**Type:** `function` 

**Parameters:**
- `data` {any} - The data object.
- `propertyName` {string} - The property name where the data is located. Default is null.
- `parent` {[DataContext](#datacontext)} - The parent data context. Default is null.

**Returns:**
- {[DataContext](#datacontext)} - The data context. 

**Static Properties:**
- `ignoreMetadata` {boolean} - Global flag to ignore metadata and comments. Default is false.
- `createDataContext` {(data: any, propertyName?: string, parent?: [DataContext](#datacontext)) => [DataContext](#datacontext)} - Create a data context from the data.
- `parse` {(str: string, reviver?: [Reviver](#reviver)) => [DataContext](#datacontext)} - Parse JSON string to the data context.
- `stringify` {(data: any, replacer?: Replacer, space?: number) => string} - Stringify the data to JSON string.

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

### *DataContext*

The data context Proxy object. 

**Type:** [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

**Properties:**
- `_isDataContext` {boolean} - The flag that indicates that the object is a data context. Default is true.
- `_isModified` {boolean} - The flag that indicates that the object is modified. Default is false.
- `_modified` {Array<[PropertyName](#propertyname)>} - The array of modified properties.
- `_propertyName` {string} - The property name where the data is located. Default is null.
- `_parent` {[DataContext](#datacontext)} - The parent data context. Default is null.
- `_events` {Map<string, [EventListener](#eventlistenerevent)>} - The map of event listeners.
- `isChanged` {boolean} - The flag that indicates that the object is changed.
  
**Methods:**
- `resetChanges` {() => void} - Set the current and child objects to status - unmodified. Must be used to start tracking changes again.
- `once` {(propertyName: [PropertyName](#propertyname), listener: [EventListener](#eventlistenerevent)) => void} - Add an event listener that will be called only once.
- `on` {(propertyName: [PropertyName](#propertyname), listener: [EventListener](#eventlistenerevent)) => void} - Add an event listener.
- `emit` {(eventName: string, event: [EventObject](#eventobject)) => void} - Emit an event.
- `emitToParent` {(eventName: string, event: [EventObject](#eventobject)) => void} - Emit an event to the parent.
- `toString` {() => string} - Returns the string representation of the data context.
- `overwritingData` {(text: string, reviver?: [Reviver](#reviver) ) => void} - Overwrite the data.
- `stringifyChanges` {(reviver?: [Reviver](#reviver), space?: number|string, onlyModified?: boolean, setUnmodified?: boolean) => string} - Stringify the changes.

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

### *EventListener(event)*

The event listener function.

**Type:** `function`

**Parameters:**
- `event` {EventObject} - The event object.

**Returns:**
- {boolean} - The flag that indicates that the listener is alive.

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

### *EventObject*

The event object.

**Type:** `object`

**Properties:**
- `eventName` {string} - The event name. 'new' | 'set' | 'delete' | 'reposition' | '-change'
    - 'new' It happens when a new property is added to the data context.
    - 'set' It happens when an existing property is updated.
    - 'delete' It happens when a property is removed from the data context.
    - 'reposition' It happens when the position of an item in an array changes.
    - 'change' It happens when any change occurs in the data context.
- `target` {DataContext} - The target data context.
- `propertyPath` {Array<PropertyName>} - The property path in array format.
- `parent` {DataContext} - The parent data context.
- `oldValue` {any} - The old value.
- `newValue` {any} - The new value.

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

### *PropertyName*

The property name.

**Type:** `string`

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

### *Reviver*

The reviver function.

**Type:** [`reviver`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver) 
or [`createDataContext`](#createdatacontextdata-propertyname-parent) or `null`

<p align="right"><a href="#-api-reference">Back to API Reference ↑</a></p>
<p align="right"><a href="#data-context">Back to top ↑</a></p>

---

## 📜 License

This project is licensed under the MIT License.<br>
Copyright &copy; Manuel Lõhmus

<p align="right"><a href="#data-context">Back to top ↑</a></p>

---