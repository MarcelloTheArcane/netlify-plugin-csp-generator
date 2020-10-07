const { mergeWithDefaultPolicies } = require('../../functions.js')

test('mergeWithDefaultPolicies overwrites default with new policies', () => {
  const policies = {
    defaultSrc: "'self'",
    childSrc: "'self'",
    connectSrc: "'self'",
    fontSrc: "'self'",
    frameSrc: "'self'",
    imgSrc: "'self'",
    manifestSrc: "'self'",
    mediaSrc: "'self'",
    objectSrc: "'self'",
    prefetchSrc: "'self'",
    scriptSrc: "'self'",
    scriptSrcElem: "'self'",
    scriptSrcAttr: "'self'",
    styleSrc: "'self'",
    styleSrcElem: "'self'",
    styleSrcAttr: "'self'",
    workerSrc: "'self'",
    baseUri: "'self'",
    formAction: "'self'",
    frameAncestors: "'self'",
  }

  expect(mergeWithDefaultPolicies(policies)).toStrictEqual({
    defaultSrc: "'self'",
    childSrc: "'self'",
    connectSrc: "'self'",
    fontSrc: "'self'",
    frameSrc: "'self'",
    imgSrc: "'self'",
    manifestSrc: "'self'",
    mediaSrc: "'self'",
    objectSrc: "'self'",
    prefetchSrc: "'self'",
    scriptSrc: "'self'",
    scriptSrcElem: "'self'",
    scriptSrcAttr: "'self'",
    styleSrc: "'self'",
    styleSrcElem: "'self'",
    styleSrcAttr: "'self'",
    workerSrc: "'self'",
    baseUri: "'self'",
    formAction: "'self'",
    frameAncestors: "'self'",
  })
})
