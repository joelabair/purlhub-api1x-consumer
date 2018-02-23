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
<dt><a href="#Asset">Asset</a> : <code>object</code></dt>
<dd><p>A purlHub account library asset instance.</p>
</dd>
<dt><a href="#Node">Node</a> : <code>object</code></dt>
<dd><p>A purlHub account child node instance.</p>
</dd>
<dt><a href="#User">User</a> : <code>object</code></dt>
<dd><p>A purlHub account user instance.</p>
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

**Example**  
```js
let account = api.accounts.get('my-acnt')
	.catch(console.error)
	.then(console.log);
```
<a name="API.accounts..list"></a>

#### accounts~list() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Lists some accounts (ACL privileged method).

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to an array of purlHub [Account](#account) object instances.  
**Example**  
```js
let account = api.accounts.list()
	.catch(console.error)
	.then(console.log);
```
<a name="API.accounts..save"></a>

#### accounts~save(name, data) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Saves an account.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to a purlHub [Account](#account) instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A purlHub account name. |
| data | <code>object</code> | A purlHub [Account](#account) object. |

**Example**  
```js
let account = api.accounts.save('my-acnt', {alias: 'My display name', timeZone: 'America/Denver'})
	.catch(console.error)
	.then(console.log);
```
<a name="API.accounts..remove"></a>

#### accounts~remove(name) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Removes an account.

**Kind**: inner method of [<code>accounts</code>](#API.accounts)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Account](#account) (static object w/ out instance methods).  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A purlHub account name. |

**Example**  
```js
let account = api.accounts.remove('my-acnt')
	.catch(console.error)
	.then(console.log);
```
<a name="Account"></a>

## Account : <code>object</code>
A purlHub account instance.

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| alias | <code>string</code> | The display name. |
| enabled | <code>boolean</code> | The account state flag. |
| timeZone | <code>string</code> | The account default time zone identifier. |
| subscription | <code>string</code> | The account subscription class. |


* [Account](#Account) : <code>object</code>
    * [.library](#Account.library)
        * [~get(context, filename, [options])](#Account.library..get) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
        * [~list(context, [directory], [options])](#Account.library..list) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
        * [~save(context, filename, data, [options])](#Account.library..save) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
        * [~remove(context, filename, [options])](#Account.library..remove) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
    * [.nodes](#Account.nodes)
        * [~get(path)](#Account.nodes..get) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
        * [~list()](#Account.nodes..list) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
        * [~save(path, data)](#Account.nodes..save) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
        * [~remove(name)](#Account.nodes..remove) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
    * [.users](#Account.users)
        * [~get(name)](#Account.users..get) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
        * [~list()](#Account.users..list) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
        * [~save(data)](#Account.users..save) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
        * [~remove(name)](#Account.users..remove) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
    * [.save()](#Account.save) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
    * [.remove()](#Account.remove) ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>

<a name="Account.library"></a>

### Account.library
API Accounts Library (asset library) sub-structure.

**Kind**: static property of [<code>Account</code>](#Account)  

* [.library](#Account.library)
    * [~get(context, filename, [options])](#Account.library..get) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
    * [~list(context, [directory], [options])](#Account.library..list) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
    * [~save(context, filename, data, [options])](#Account.library..save) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
    * [~remove(context, filename, [options])](#Account.library..remove) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>

<a name="Account.library..get"></a>

#### library~get(context, filename, [options]) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Gets a library asset.

**Kind**: inner method of [<code>library</code>](#Account.library)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to a purlHub [Asset](#asset) instance.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | The asset's context (images|documents|videos|layouts|sections|templates). |
| filename | <code>string</code> | A asset filename including any path. |
| [options] | <code>object</code> | An optional object of request options. |

**Example**  
```js
let asset = account.library.get('templates','/email/message.txt')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.library..list"></a>

#### library~list(context, [directory], [options]) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Lists all assets.

**Kind**: inner method of [<code>library</code>](#Account.library)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to an array of purlHub [Asset](#asset) object instances.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | The asset's context (images|documents|videos|layouts|sections|templates). |
| [directory] | <code>string</code> | An optional directory prefix. |
| [options] | <code>object</code> | An optional object of request options. |

**Example**  
```js
let assets = account.library.list('templates')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.library..save"></a>

#### library~save(context, filename, data, [options]) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Saves a library asset.

**Kind**: inner method of [<code>library</code>](#Account.library)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to a purlHub [Asset](#asset) instance.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | The asset's context (images|documents|videos|layouts|sections|templates). |
| filename | <code>string</code> | A asset filename including any path. |
| data | <code>object</code> | A purlHub [Asset](#asset) instance. |
| [options] | <code>object</code> | An optional object of request options. |

**Example**  
```js
let asset = account.library.save('templates','/email/message.txt', {...})
	.catch(console.error)
	.then(console.log);
```
<a name="Account.library..remove"></a>

#### library~remove(context, filename, [options]) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Removes a asset.

**Kind**: inner method of [<code>library</code>](#Account.library)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to a purlHub [Asset](#asset) instance (static object w/ out instance methods).  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>string</code> | The asset's context (images|documents|videos|layouts|sections|templates). |
| filename | <code>string</code> | A asset filename including any path. |
| [options] | <code>object</code> | An optional object of request options. |

**Example**  
```js
let asset = account.library.remove('templates','/email/message.txt')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.nodes"></a>

### Account.nodes
API Accounts Nodes (child nodes) sub-structure.

**Kind**: static property of [<code>Account</code>](#Account)  

* [.nodes](#Account.nodes)
    * [~get(path)](#Account.nodes..get) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
    * [~list()](#Account.nodes..list) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
    * [~save(path, data)](#Account.nodes..save) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
    * [~remove(name)](#Account.nodes..remove) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>

<a name="Account.nodes..get"></a>

#### nodes~get(path) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Gets a node.

**Kind**: inner method of [<code>nodes</code>](#Account.nodes)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to a purlHub [Node](#node) instance.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | A node path. |

**Example**  
```js
let node = account.nodes.get('/default/Sales')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.nodes..list"></a>

#### nodes~list() ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Lists all nodes.

**Kind**: inner method of [<code>nodes</code>](#Account.nodes)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to an array of purlHub [Node](#node) object instances.  
**Example**  
```js
let node = account.nodes.list()
	.catch(console.error)
	.then(console.log);
```
<a name="Account.nodes..save"></a>

#### nodes~save(path, data) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Saves a node.

**Kind**: inner method of [<code>nodes</code>](#Account.nodes)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to a purlHub [Node](#node) instance.  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | A node path. |
| data | <code>object</code> | A purlHub [Node](#node) object. |

**Example**  
```js
let node = account.nodes.save('/default/Sales', {password: '12345678', timeZone: 'America/Denver'})
	.catch(console.error)
	.then(console.log);
```
<a name="Account.nodes..remove"></a>

#### nodes~remove(name) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Removes a node.

**Kind**: inner method of [<code>nodes</code>](#Account.nodes)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Node](#node) (static object w/ out instance methods).  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A node path. |

**Example**  
```js
let node = account.nodes.remove('/default/Sales')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.users"></a>

### Account.users
API Accounts Users sub-structure.

**Kind**: static property of [<code>Account</code>](#Account)  

* [.users](#Account.users)
    * [~get(name)](#Account.users..get) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
    * [~list()](#Account.users..list) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
    * [~save(data)](#Account.users..save) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
    * [~remove(name)](#Account.users..remove) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>

<a name="Account.users..get"></a>

#### users~get(name) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Gets a user.

**Kind**: inner method of [<code>users</code>](#Account.users)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to a purlHub [User](#user) instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A username / login. |

**Example**  
```js
let account = account.users.get('user@example.com')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.users..list"></a>

#### users~list() ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Lists all users.

**Kind**: inner method of [<code>users</code>](#Account.users)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to an array of purlHub [User](#user) object instances.  
**Example**  
```js
let account = account.users.list()
	.catch(console.error)
	.then(console.log);
```
<a name="Account.users..save"></a>

#### users~save(data) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Saves a user.

**Kind**: inner method of [<code>users</code>](#Account.users)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to a purlHub [User](#user) instance.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | A purlHub [User](#user) object. |

**Example**  
```js
let user = account.users.save({login: 'user@example.com', password: '12345678', timeZone: 'America/Denver'})
	.catch(console.error)
	.then(console.log);
```
<a name="Account.users..remove"></a>

#### users~remove(name) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Removes a user.

**Kind**: inner method of [<code>users</code>](#Account.users)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [User](#user) (static object w/ out instance methods).  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | A username / login. |

**Example**  
```js
let user = account.users.remove('user@example.com')
	.catch(console.error)
	.then(console.log);
```
<a name="Account.save"></a>

### Account.save() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Save this account instance.

**Kind**: static method of [<code>Account</code>](#Account)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the saved purlHub [Account](#account) (w/ instance methods).  
**Example**  
```js
account.save()
	.catch(console.error)
	.then(console.log);
```
<a name="Account.remove"></a>

### Account.remove() ⇒ <code>Promise.&lt;Account, HTTPError&gt;</code>
Remove this account instance.

**Kind**: static method of [<code>Account</code>](#Account)  
**Returns**: <code>Promise.&lt;Account, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Account](#account) (static object w/ out instance methods).  
**Example**  
```js
account.remove()
	.catch(console.error)
	.then(console.log);
```
<a name="Asset"></a>

## Asset : <code>object</code>
A purlHub account library asset instance.

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| filename | <code>string</code> | The filename including any path. |
| metadata | <code>object</code> | The associated metadata. |
| contentType | <code>string</code> | A binary content type. |
| head | <code>boolean</code> | The CV state flag. |
| deleted | <code>boolean</code> | The files deleted state flag. |
| length | <code>number</code> | The file's binary data content length. |
| version | <code>number</code> | The version identifier. |


* [Asset](#Asset) : <code>object</code>
    * [.save()](#Asset.save) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
    * [.remove()](#Asset.remove) ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>

<a name="Asset.save"></a>

### Asset.save() ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Save this asset instance.

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to the saved purlHub [Asset](#asset) (w/ instance methods).  
**Example**  
```js
asset.save()
	.catch(console.error)
	.then(console.log);
```
<a name="Asset.remove"></a>

### Asset.remove() ⇒ <code>Promise.&lt;Asset, HTTPError&gt;</code>
Remove this asset instance.

**Kind**: static method of [<code>Asset</code>](#Asset)  
**Returns**: <code>Promise.&lt;Asset, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Asset](#asset) (static object w/ out instance methods).  
**Example**  
```js
asset.remove()
	.catch(console.error)
	.then(console.log);
```
<a name="Node"></a>

## Node : <code>object</code>
A purlHub account child node instance.

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| nodeName | <code>string</code> | The node's label. |
| nodePath | <code>string</code> | The node's hierarchical path including its name. |
| description | <code>string</code> | A long description. |
| classification | <code>string</code> | An arbitrary node type classification. |
| status | <code>string</code> | The state (live|draft) indicating the default event tracking mode. |


* [Node](#Node) : <code>object</code>
    * [.objects](#Node.objects)
    * [.save()](#Node.save) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
    * [.remove()](#Node.remove) ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>

<a name="Node.objects"></a>

### Node.objects
API Accounts Nodes Objects sub-structure.

**Kind**: static property of [<code>Node</code>](#Node)  
<a name="Node.save"></a>

### Node.save() ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Save this node instance.

**Kind**: static method of [<code>Node</code>](#Node)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to the saved purlHub [Node](#node) (w/ instance methods).  
**Example**  
```js
node.save()
	.catch(console.error)
	.then(console.log);
```
<a name="Node.remove"></a>

### Node.remove() ⇒ <code>Promise.&lt;Node, HTTPError&gt;</code>
Remove this node instance.

**Kind**: static method of [<code>Node</code>](#Node)  
**Returns**: <code>Promise.&lt;Node, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [Node](#node) (static object w/ out instance methods).  
**Example**  
```js
node.remove()
	.catch(console.error)
	.then(console.log);
```
<a name="User"></a>

## User : <code>object</code>
A purlHub account user instance.

**Kind**: global namespace  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| login | <code>string</code> | The username / login. |
| password | <code>string</code> | The associated password. |
| screenName | <code>string</code> | A display name. |
| roles | <code>array</code> \| <code>string</code> | The users ACL roles (array or comma delimited string). |
| enabled | <code>boolean</code> | The users active state flag. |
| locked | <code>bollean</code> | The users security lockout state flag. |
| timeZone | <code>string</code> | The account default time zone identifier. |


* [User](#User) : <code>object</code>
    * [.save()](#User.save) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
    * [.remove()](#User.remove) ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>

<a name="User.save"></a>

### User.save() ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Save this user instance.

**Kind**: static method of [<code>User</code>](#User)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to the saved purlHub [User](#user) (w/ instance methods).  
**Example**  
```js
user.save()
	.catch(console.error)
	.then(console.log);
```
<a name="User.remove"></a>

### User.remove() ⇒ <code>Promise.&lt;User, HTTPError&gt;</code>
Remove this user instance.

**Kind**: static method of [<code>User</code>](#User)  
**Returns**: <code>Promise.&lt;User, HTTPError&gt;</code> - A promise that resolves to the removed purlHub [User](#user) (static object w/ out instance methods).  
**Example**  
```js
user.remove()
	.catch(console.error)
	.then(console.log);
```
