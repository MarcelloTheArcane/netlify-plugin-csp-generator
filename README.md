# netlify-plugin-csp-generator

[![NPM](https://img.shields.io/npm/v/netlify-plugin-csp-generator.svg)](https://www.npmjs.com/package/netlify-plugin-csp-generator)
[![codecov](https://codecov.io/gh/MarcelloTheArcane/netlify-plugin-csp-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/MarcelloTheArcane/netlify-plugin-csp-generator)
[![CodeQL](https://github.com/MarcelloTheArcane/netlify-plugin-csp-generator/workflows/CodeQL/badge.svg)](https://github.com/MarcelloTheArcane/netlify-plugin-csp-generator/actions?query=workflow%3ACodeQL)

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
- `exclude` is an array of paths you don't want to include.  It defaults to an empty array.
- `disablePolicies` is an array of policies to never include.  Files that need these rules will probably be taken from `defaultSrc` instead by your browser.
- `disableGeneratedPolicies` is an array of policies never to generate. Use this to turn off default policies but still allow the key in `netlify.toml`.
- `reportOnly` generates headers with `Content-Security-Policy-Report-Only` instead, which is useful for testing. 
- `reportURI`/`reportTo` sends violations to a given endpoint.  See [Reporting violations](#reporting-violations) for more information.
- `generateForAllFiles` lets you generate headers for non-HTML files.  See [Non-index.html files](#non-indexhtml-files) for more information.

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
- [`baseUri`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/base-uri)
- [`formAction`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/form-action)
- [`frameAncestors`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)

Add them under the `[plugins.inputs.policies]` object in your `netlify.toml` file, with your specified value in quotes.

You can use CSP headers not in this list too - simply use the name in camel case and it will be added.

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

### Non-index.html files

Generally, routes are generated with an `index.html` file, like `/some/file/path/index.html`.  However, sometimes you need to handle HTML files that aren't called 'index', for example `404.html` in Nuxt.

These are generated as wildcard links and are placed above the non-wildcard paths in your `_headers` file (for specificity):

``` txt
/*.html
  Content-Security-Policy: default-src 'self'; script-src 'sha256-Qb2XxXiF09k6xbk2vTgHvWRed+mgYYGzFqZ6dShQVA0=';
/specific-path/
  Content-Security-Policy: default-src 'self';
```

Any matching wildcard URL has the hashes joined together - for example, if you have a `404.html` and a `500.html` with scripts/styles, all the hashes will be merged together under `/*.html`.

> In general, it is better to generate `/path/index.html` rather than `/path.html`.

Using the `generateForAllFiles` setting, you can generate route keys that use `/*` instead of `/*.html`.  Be careful, this will send Content-Security-Policy headers for every file type (i.e. `.js`, `.css`, etc) which is [redundant as per the spec](https://www.w3.org/TR/2015/CR-CSP2-20150721/#which-policy-applies).

## Reporting violations

The Content-Security-Policy specification allows for reporting violations to a URL - you can read more about it on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only).

This is useful for testing and checking directives.

To set the header to report only, set `reportOnly = true` in your `netlify.toml` alongside your policies.

```toml
  [plugins.inputs]
  reportOnly = true
  reportURI = "/report-csp-violations-to-this-uri"
```

> **Important**
> 1. Setting `reportOnly` to true will NOT enforce your policy
> 2. You need to add `reportURI` too

### Using the report-to directive

The `reportURI` is deprecated in CSP Level 3 in favour of `report-to`.  To use the report-to directive, set the `reportTo` value to the group name as defined in the [`Reporting-Endpoints` header](https://w3c.github.io/reporting/) that you also need to set.

```toml
  [plugins.inputs]
  reportOnly = true
  reportTo = "csp-violations-group"
```

> 1. You can include `reportURI` and `reportTo` without setting `reportOnly = true`, and the policy WILL be enforced and errors will *also* be reported
> 2. You can set both the `reportTo` and `reportURI` directives - this is recommended to ensure maximum compatibility

## Help it's all broken!

Oh, you.  Chances are your browser console is screaming at you, and the network tab is showing a lot of `(blocked:csp)` errors.

See our list of [example policies](./policies.md) to get started.

> Don't `unsafe-inline` everything, because that will make CSP redundant.  If in doubt, ask Google, Stackoverflow, or create a Github issue (in that order).

## Donations

If you found this plugin useful, or are just feeling nice, feel free to [donate](https://buymeacoffee.com/maxdotreynolds)!

[![Buy me a coffee](https://raw.githubusercontent.com/MarcelloTheArcane/netlify-plugin-csp-generator/master/BuyMeACoffee.png)](https://buymeacoffee.com/maxdotreynolds)
