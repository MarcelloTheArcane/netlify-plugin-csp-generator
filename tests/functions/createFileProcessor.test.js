const { createFileProcessor } = require('../../functions.js')

test('returns a function', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test(`globalCSP is true and path is wildcard if file path isn't index.html`, () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/404.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: true,
      webPath: "/*.html",
    },
  ])
})

test('disable scriptSrc stops script hashing', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = ['scriptSrc']
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body><script>console.log(`hello world`)</script></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test('disable styleSrc stops script hashing', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = ['scriptSrc', 'styleSrc']
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title><style>body {margin: 0;}</style></head><body></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test('undefined disablePolicies fails gracefully', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = undefined
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test('script gets hashed', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body><script>console.log(`hello world`)</script></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [`'sha256-P4dyF2lGwp1CRgBHyaKjiDQUFXBZx7ZqXyOirTfrI9s='`],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test('style gets hashed', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title><style>body {margin: 0;}</style></head><body></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [`'sha256-aP/BTEKGPt7LJcLFlxdu1wlsuFeSJYAO2DFjzJ2VPEw='`],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test('inline style gets hashed', () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body style="margin: 0;"></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [`'sha256-AkGc/9SiOd74zk72UnCdLs+k10sM4iy2uKmgoXkaHe0='`],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})

test(`blank script doesn't get hashed`, () => {
  const buildDir = 'dist'
  const disableGeneratedPolicies = []
  const processor = createFileProcessor(buildDir, disableGeneratedPolicies)

  const testFiles = [
    {
      path: 'dist/index.html',
      fileContent: '<!DOCTYPE html><html><head><title>Test</title></head><body><script></script></body></html>'
    }
  ]

  const result = testFiles.map(({ path, fileContent }) => processor(path)(fileContent))
  expect(result).toStrictEqual([
    {
      cspObject: {
        scriptSrc: [],
        styleSrc: [],
      },
      globalCSP: false,
      webPath: "/",
    },
  ])
})
