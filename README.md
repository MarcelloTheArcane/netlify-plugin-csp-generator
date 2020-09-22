# netlify-plugin-csp-generator

> Generate [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) headers from inline script and style hashes

When running things like [Gatsby](https://www.gatsbyjs.com/) or [Gridsome](https://gridsome.org/), the initial state is stored inside a `<script>` tag.
Modern browser content security policies don't like inline scripts or styles, so to get around it you need to add either a [cryptographic nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) or a [cryptographic hash](https://en.wikipedia.org/wiki/Cryptographic_hash_function) of each script.
A nonce is out of the question, because you can't update it for each load.

This package generates a crypographic hash ([SHA-256](https://en.wikipedia.org/wiki/SHA-2)) of all inline scripts and styles in each HTML file, and adds it to the `_headers` file along with other policies of your choice.

> **Note**  
> Netlify lets you add a `Content-Security-Policy` header in your [`netlify.toml`](https://docs.netlify.com/routing/headers/#syntax-for-the-netlify-configuration-file).  This will overwrite values inside `_headers`, so don't do that.

If you have an existing `_headers` file, this will append to the existing file.  Just make sure the file ends on a newline, and it should work fine.

## Usage

Install `netlify-plugin-csp-generator` with your favourite package manager:

``` bash
yarn add netlify-plugin-csp-generator

npm install netlify-plugin-csp-generator
```

In your `netlify.toml` file, add an additional plugin:

``` toml
[[plugins]]
package = "netlify-plugin-csp-generator"

  [plugins.inputs]
  buildDir = "dist"

  [plugins.inputs.policies]
    defaultSrc = "'self'"
```

### Properties

- `buildDir` is the path for the publish directory in Netlify:
  ![buildDir example](https://docs.netlify.com/images/configure-builds-edit-build-settings-ui.png)
- `excludes` is an array of paths you don't want to include.  It defaults to an empty array.

### Policies

You can use the following policies:

- [`childSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/child-src)
- [`defaultSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/default-src)
- [`connectSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/connect-src)
- [`fontSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src)
- [`frameSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-src)
- [`imgSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src)
- [`manifestSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/manifest-src)
- [`mediaSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/media-src)
- [`objectSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/object-src)
- [`prefetchSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/prefetch-src)
- [`scriptSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src)
- [`scriptSrcElem`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src-elem)
- [`scriptSrcAttr`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src-attr)
- [`styleSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src)
- [`styleSrcElem`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src-elem)
- [`styleSrcAttr`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src-attr)
- [`workerSrc`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/worker-src)

Add them under the `[plugins.inputs.policies]` object in your `netlify.toml` file, with your specified value in quotes.

### Inline styles

When using Vue and derivatives (like Gridsome), you may want to use `v-show` on things.  This adds an inline style of `display: none;`, which is [forbidden by CSP Level 3](https://content-security-policy.com/examples/allow-inline-style/).  To prevent this throwing an error, you need to add `'unsafe-hashes'` to your `styleSrc` policy.  The `sha-256` hash is generated automatically.

``` toml
[[plugins]]
package = "netlify-plugin-csp-generator"

  [plugins.inputs]
  buildDir = "dist"

  [plugins.inputs.policies]
    defaultSrc = "'self'"
    styleSrc = "'unsafe-hashes'"
```

## What is generated

If you have defined a policy in your `netlify.toml` file, this will be added to all files.

``` toml
  [plugins.inputs.policies]
    defaultSrc = "'self'"
    scriptSrc = "'self' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com"
```

``` txt
/each-file-path/
  Content-Security-Policy: default-src 'self'; script-src 'self' *.google-analytics.com;
```

If a file includes a `<script>` or `<style>` tag with content, this file path will have the hash added:

``` txt
/file-with-no-script/
  Content-Security-Policy: default-src 'self';
/file-with-script/
  Content-Security-Policy: default-src 'self'; script-src 'sha256-RFWPLDbv2BY+rCkDzsE+0fr8ylGr2R2faWMhq4lfEQc=';
```

If a file has any inline styles, these will be hashed:

``` html
<div style="display:none;"></div>
```

``` txt
/file-with-inline-style/
  Content-Security-Policy: style-src 'unsafe-hashes' 'sha256-0EZqoz+oBhx7gF4nvY2bSqoGyy4zLjNF+SDQXGp/ZrY='
```
