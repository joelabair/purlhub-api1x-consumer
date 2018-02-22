# purlhub-api1x-consumer
Basic purlHub v1.0 REST API consumer.  A ES6+ promises based JavaScript client library.
Intended to simplify the access to hierarchical objects in the purlHub core ecosystem.

## Objects

<dl>
<dt><a href="#API">API</a> ⇒ <code>class</code></dt>
<dd><p>purlHub API Root instance constructor (new||call).</p>
</dd>
<dt><a href="#Account">Account</a> : <code>object</code></dt>
<dd><p>A purlHub account instance.</p>
</dd>
</dl>

<a name="API"></a>

## API ⇒ <code>class</code>
purlHub API Root instance constructor (new||call).

**Kind**: global namespace  
**Returns**: <code>class</code> - A class bound to the URI and credential set.  

| Param | Type | Description |
| --- | --- | --- |
| base | <code>string</code> | The API root URI (i.e. https://api.purlhub.com). |
| user | <code>string</code> | A login username. |
| pass | <code>string</code> | The associated password. |

**Example**  
```js
const API = require('purlhub-api1x-consumer');
let api = new API('https://api.purlhub.com', 'user@example.com', '12345678');

// OR simply
const API = require('purlhub-api1x-consumer');
let api = API('https://api.purlhub.com', 'user@example.com', '12345678');
```

* [API](#API) ⇒ <code>class</code>
    * [.accounts()](#API.accounts)
        * [~get(name)](#API.accounts..get) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
        * [~list()](#API.accounts..list) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
        * [~save(name, data)](#API.accounts..save) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
        * [~remove(name)](#API.accounts..remove) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>

<a name="API.accounts"></a>

### API.accounts()
API Accounts sub-structure

**Kind**: static method of [<code>API</code>](#API)  

* [.accounts()](#API.accounts)
    * [~get(name)](#API.accounts..get) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
    * [~list()](#API.accounts..list) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
    * [~save(name, data)](#API.accounts..save) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
    * [~remove(name)](#API.accounts..remove) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>

<a name="API.accounts..get"></a>

#### accounts~get(name) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Gets an account.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to a purlHub [Account](#account) instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A purlHub account name. |

<a name="API.accounts..list"></a>

#### accounts~list() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Lists some accounts.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to an array of purlHub [Account](#account) object instances.  
<a name="API.accounts..save"></a>

#### accounts~save(name, data) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Saves an account.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to a purlHub [Account](#account) instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A purlHub account name. |
| data | <code>object</code> | A purlHub [Account](#account) object. |

<a name="API.accounts..remove"></a>

#### accounts~remove(name) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Removes an account.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Account](#account) (static object w/ out instance methods).  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A purlHub account name. |

<a name="Account"></a>

## Account : <code>object</code>
A purlHub account instance.

**Kind**: global namespace  

* [Account](#Account) : <code>object</code>
    * [.save()](#Account.save) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
    * [.remove()](#Account.remove) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>

<a name="Account.save"></a>

### Account.save() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Save this account instance.

**Kind**: static method of [<code>Account</code>](#Account)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the saved purlHub [Account](#account) (w/ instance methods).  
<a name="Account.remove"></a>

### Account.remove() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Remove this account instance.

**Kind**: static method of [<code>Account</code>](#Account)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Account](#account) (static object w/ out instance methods).  
