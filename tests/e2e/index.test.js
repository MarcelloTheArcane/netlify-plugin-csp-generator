const fs = require('fs')
const { onPostBuild } = require('../../index.js')

global.console = {
  info: () => {},
}

const folders = [
  ['no-generated-csp', `/\n  Content-Security-Policy: default-src 'self';`],
  ['script-elements', `/\n  Content-Security-Policy: default-src 'self'; script-src 'sha256-QgHoDO3umGbaH6pPry9eZ2aNL1KxNUYO9YINxJhKCFc=' 'sha256-kbu6AoxGeNvnosFj2cT7o23oVjN3kw10MbQJ0oC4opI=';`],
  ['nonindex-files', `/*\n  Content-Security-Policy: default-src 'self';`],
  ['nested-folder-paths', `/\n  Content-Security-Policy: default-src 'self';\n/nested/\n  Content-Security-Policy: default-src 'self';`],
  ['nested-folders-with-nonindex', `/nested/*\n  Content-Security-Policy: default-src 'self';\n/\n  Content-Security-Policy: default-src 'self';`],
  ['scripts-and-styles', `/\n  Content-Security-Policy: default-src 'self'; script-src 'sha256-HgP/C/HfzlJIctOVi/okNAgn76d6kykP7D0jrm1nVu0='; style-src 'sha256-ZBTj5RHLnrF+IxdRZM2RuLfjTJQXNSi7fLQHr09onfY=' 'sha256-0brZ5JHU3lwo7f/rLUc9Nu1kRemuKlxjcMBYIpWAFe0=';`],
]

test.each(folders)('%s', async (folder, expected) => {
  const inputs = {
    buildDir: `./tests/e2e/${folder}`,
    exclude: [],
    policies: {
      defaultSrc: `'self'`,
    },
    disablePolicies: [],
    disableGeneratedPolicies: false,
  }

  const headersFilePath = `${inputs.buildDir}/_headers`

  if (fs.existsSync(headersFilePath)) {
    fs.unlinkSync(headersFilePath)
  }

  await onPostBuild({ inputs })

  const file = fs.readFileSync(headersFilePath, 'utf-8')

  expect(file).toBe(expected)
})
