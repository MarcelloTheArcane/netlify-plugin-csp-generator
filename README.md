# netlify-plugin-csp-generator

> Generate [`Content-Security-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) headers from inline script hashes

When running things like [Gatsby](https://www.gatsbyjs.com/) or [Gridsome](https://gridsome.org/), the initial state is stored inside a `<script>` tag.
Modern browser content security policies don't like inline scripts, so to get around it you need to add either a [cryptographic nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce) or a [cryptographic hash](https://en.wikipedia.org/wiki/Cryptographic_hash_function) of each script.
A nonce is out of the question, because you can't update it for each load.

This package generates a crypographic hash ([SHA-256](https://en.wikipedia.org/wiki/SHA-2)) of all inline scripts in each HTML file, and adds it to the `_headers` file along with other policies of your choice.

> **Note**  
> Netlify lets you add a `Content-Security-Policy` header in your [`netlify.toml`](https://docs.netlify.com/routing/headers/#syntax-for-the-netlify-configuration-file).  This will overwrite values inside `_headers`, so don't do that.

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
