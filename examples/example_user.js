'use strict';

// Import the required modules.
const { createDataContext, parse, stringify } = require('data-context');

// Define your data model.
const initialData = {
    user: {
        name: "John Doe",
        age: 30
    },
    settings: {
        theme: "dark",
        notifications: true
    }
};

// Create a data context.
const context = createDataContext(initialData);

// Add event listeners.
context.user.on('name', (event) => {
    console.log('User name changed:', event.newValue);
});

// Add event listeners. 
context.on('user', (event) => {
    // Note: The user property has not been changed, so it has not emitted.
    console.log('User changed:', event.newValue);
});

context.on('-change', (event) => {
    // Serialize changes.
    const changes = context.stringifyChanges(null, 4);
    console.log('Data changed:', changes);
});

// Modify data.
context.user.name = "Jane Doe";
context.settings.theme = "light";

setTimeout(() => {
    // Serialize changes.
    const data = stringify(context, null, 4);
    console.log('Serialized data:', data);
}, 100);