# purlhub-api1x-consumer
Basic purlHub v1.0 REST API consumer.  A ES6+ promises based JavaScript client library.
Intended to simplify the access to hierarchical objects in the purlHub core ecosystem.

<a name="api"></a>

## api() ⇒ <code>object</code>
purlHub API Root instance constructor (new||call).

**Kind**: global function  
**Base**: <code>string</code> - The API root URI (i.e. https://api.purlhub.com).  
**User**: <code>string</code> - A login username.  
**Pass**: <code>string</code> - A login password.  
**Example**  
```js
const API = require('purlhub-api1x-consumer');
let api = new API('https://api.purlhub.com', 'user@example.com', '12345678');

// OR simply
const API = require('purlhub-api1x-consumer');
let api = API('https://api.purlhub.com', 'user@example.com', '12345678');
```
