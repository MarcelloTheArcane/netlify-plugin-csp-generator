const { buildCSPArray } = require('../../functions.js')

test('policy is converted to kebab case', () => {
  const allPolicies = {
    'defaultSrc': "'self'",
  }
  const disablePolicies = []
  const hashes = {}

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)
  expect(result[0].slice(0, 11)).toBe('default-src')
})

test('policies are generated as an array', () => {
  const allPolicies = {
    'defaultSrc': "'self'",
  }
  const disablePolicies = []
  const hashes = {}

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)

  expect(Array.isArray(result)).toBe(true)
})

test('policy strings are correctly formatted', () => {
  const allPolicies = {
    'defaultSrc': "'self'",
  }
  const disablePolicies = []
  const hashes = {}

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)

  expect(result[0]).toBe(`default-src 'self';`)
})

test(`values in disablePolicies don't get generated`, () => {
  const allPolicies = {
    'defaultSrc': "'self'",
    'scriptSrc': '',
  }
  const disablePolicies = ['scriptSrc']
  const hashes = {}

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)
  expect(result.length).toBe(1)
  expect(result[0].slice(0, 11)).toBe('default-src')
})

test('if disablePolicies is not present, handle gracefully', () => {
  const allPolicies = {
    'defaultSrc': "'self'",
  }
  const disablePolicies = undefined
  const hashes = {}

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)

  expect(result.length).toBe(1)
})

test('hashes are added before default policies', () => {
  const allPolicies = {
    'defaultSrc': "'self'",
  }
  const disablePolicies = []
  const hashes = {
    defaultSrc: [`'test-hash-1'`, `'test-hash-2'`],
  }

  const result = buildCSPArray(allPolicies, disablePolicies, hashes)

  expect(result[0]).toBe(`default-src 'test-hash-1' 'test-hash-2' 'self';`)
})
