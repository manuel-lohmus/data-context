var DC = require('./index.js');

var item = DC.Item({ name: 'Testing...' });
console.log(item.toJSON());
item.name = 'Tested!';
var collection = DC.Collection([item]);
console.log(collection.toJSON());

debugger;