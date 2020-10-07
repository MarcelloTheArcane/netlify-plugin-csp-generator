const { splitToGlobalAndLocal } = require('../../functions.js')

test('returns local and global headers', () => {
  const testFileHeaders = [
    {
      webPath: '/',
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
    }
  ]

  const result = testFileHeaders
    .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

  expect(result.hasOwnProperty('globalHeaders')).toBe(true)
  expect(result.hasOwnProperty('localHeaders')).toBe(true)
})

test('returns local header if globalCSP is false', () => {
  const testFileHeaders = [
    {
      webPath: '/',
      cspObject: {
        scriptSrc: ['script-hash-test'],
        styleSrc: ['style-hash-test'],
      },
      globalCSP: false,
    }
  ]

  const { localHeaders } = testFileHeaders
    .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

  expect(localHeaders).toStrictEqual([
    {
      cspObject: {
        scriptSrc: ['script-hash-test'],
        styleSrc: ['style-hash-test'],
      },
      globalCSP: false,
      webPath: '/',
    },
  ])
})

test('returns global header if globalCSP is true', () => {
  const testFileHeaders = [
    {
      webPath: '/*',
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: true,
    },
  ]

  const { globalHeaders } = testFileHeaders
    .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

  expect(globalHeaders).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: true,
      webPath: '/*',
    },
  ])
})

test('multiple global headers with same path are merged',  () => {
  const testFileHeaders = [
    {
      webPath: '/*',
      cspObject: {
        scriptSrc: ['script-src-hash'],
        styleSrc: [],
      },
      globalCSP: true,
    },
    {
      webPath: '/*',
      cspObject: {
        scriptSrc: ['script-src-hash-2'],
        styleSrc: [],
      },
      globalCSP: true,
    },
  ]

  const { globalHeaders } = testFileHeaders
    .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

  expect(globalHeaders).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [
          'script-src-hash',
          'script-src-hash-2',
        ],
        styleSrc: [],
      },
      globalCSP: true,
      webPath: '/*',
    },
  ])
})
