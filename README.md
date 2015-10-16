
# ipfs-import

Tooling around loading javascript over ipfs.

This package consists of two parts

## command line

```
npm install -g ipfs-import
```

To use it just run 

```
ipfs-import aolog
```

This will output something like this:

```
npm installing aolog in /tmp/tmp-5322EnLBU5Z0t5Ag
aolog@3.4.0 tmp-5322EnLBU5Z0t5Ag/node_modules/aolog
├── async@1.4.2
├── pako@0.2.8
├── blomma@1.1.0 (fnv@0.1.3)
└── lodash@3.10.1
installed undefined in /tmp/tmp-5322EnLBU5Z0t5Ag/node_modules/aolog
building module as aolog
adding to ipfs
result: /ipfs/QmVJZ15GZZGcz6PAWiUBbj2Pn9LM3w7YRueB1Q74osNn5m
updating ipfs-names.json
```

The ipfs-names.json is used in resolving package names to hashes in:

## library

To check out how this is used, have a look in ```examples/components/ipfs-add-file/ipfs-add-file.html```

```html
<script src="/ipfs/QmcES8pPdcmzL4tbLiiqimnsb26YxsmkYWQcKKndDzjuQ7"></script>
```

This is the hash of the module loader. The loader wraps [SystemJS](https://github.com/systemjs/systemjs) and allows you to easily reference the imported modules from your scripts.

In ```examples/comonents/ipfs-add-file/script.js```:

```js
IpfsImport(function (ipfsApi, dragDrop) {

	 // use your modules here!

})
```

Take note that this uses some javascript reflection magic to map the argument names to the hashes through the ipfs-names.json, so the function arguments must be named like the camelCased module names.

# Example

To run the example, go to the example subdirectory and run 

```
node serve.js
```

Then point your custom-element-enabled browser at ```localhost:8082``` for the demo.
