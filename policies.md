# Example Profiles

The domains of URLs you want to allow should go under `[plugins.inputs.policies]`.  `'self'` (with quotes) is shorthand for the current page URL.

Generally you can debug from the browser error messages

Standard things to change are `defaultSrc`, `imgSrc`, `connectSrc` and `scriptSrc`.  If you have data URLs, add `data:` to your `imgSrc` policy.

> Can't find what you need?  Submit a pull request to add another example here.

## Nope

This disallows all rules.  Useful for manually setting everything based on errors from the browser console.

``` toml
[plugins.inputs.policies]
  defaultSrc = "'none'"
  childSrc = "'none'"
  connectSrc = "'none'"
  fontSrc = "'none'"
  frameSrc = "'none'"
  imgSrc = "'none'"
  manifestSrc = "'none'"
  mediaSrc = "'none'"
  objectSrc = "'none'"
  scriptSrc = "'none'"
  scriptSrcElem = "'none'"
  scriptSrcAttr = "'none'"
  styleSrc = "'none'"
  styleSrcElem = "'none'"
  styleSrcAttr = "'none'"
  workerSrc = "'none'"
```

## Allow self

This allows only connections that come from your domain.  Useful if everything is served from your URL.

``` toml
[plugins.inputs.policies]
  defaultSrc = "'self'"
```

## Gatsby

Gatsby adds `innerHTML` after load.  You may need to disable `scriptSrc` too, by adding `unsafe-inline`.

``` toml
[plugins.inputs]
  buildDir = "dist"
  disableGeneratedPolicies = ["styleSrc"]
```

## Google Analytics

Google Analytics needs the following URLs:

``` toml
[plugins.inputs.policies]
  scriptSrc = "https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com"
  imgSrc = "https://www.google-analytics.com"
  connectSrc = "https://www.google-analytics.com"
```

## Image data URLs

Some lazy-loaders use tiny base64 data URLs as placeholder images.  If you see errors from image paths that start with `data:`, whitelist them like this:

``` toml
[plugins.inputs.policies]
  imgSrc = "'self' data:"
```

## Stripe

``` toml
[plugins.inputs.policies]
  connectSrc = "https://*.stripe.com"
  frameSrc = "https://*.stripe.com"
  scriptSrc = "https://*.stripe.com"
```

## Wistia

``` toml
[plugins.inputs.policies]
  connectSrc = "https://*.wistia.com"
  frameSrc = "https://fast.wistia.net"
```

## Dato CMS

Dato CMS provides images from [www.datocms-assets.com](https://www.datocms-assets.com)

``` toml
[plugins.inputs.policies]
  imgSrc = "https://www.datocms-assets.com"
```

## Algolia

``` toml
[plugins.inputs.policies]
  connectSrc = "https://*.algolia.net"
  scriptSrc = "https://*.algolia.net"
```

## Report violations

``` toml
[plugins.inputs]
  reportTo = "csp-endpoint" # Set the csp-endpoint in Reporting-Endpoints too
  reportURI = "/some-report-uri"
  # reportOnly = true # Uncomment this if you want to only report, and not enforce your policies
```
