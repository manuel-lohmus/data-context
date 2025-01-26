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