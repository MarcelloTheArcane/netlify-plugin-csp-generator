const fs = require('fs')
const { onPostBuild } = require('../../index.js')

const folders = [
  ['no-generated-csp', {}, `/\n  Content-Security-Policy: default-src 'self';`],
  ['script-elements', {}, `/\n  Content-Security-Policy: default-src 'self'; script-src 'sha256-QgHoDO3umGbaH6pPry9eZ2aNL1KxNUYO9YINxJhKCFc=' 'sha256-kbu6AoxGeNvnosFj2cT7o23oVjN3kw10MbQJ0oC4opI=';`],
  ['nonindex-files', {}, `/*.html\n  Content-Security-Policy: default-src 'self';`],
  ['nested-folder-paths', {}, `/\n  Content-Security-Policy: default-src 'self';\n/nested/\n  Content-Security-Policy: default-src 'self';`],
  ['nested-folders-with-nonindex', {}, `/nested/*.html\n  Content-Security-Policy: default-src 'self';\n/\n  Content-Security-Policy: default-src 'self';`],
  ['scripts-and-styles', {}, `/\n  Content-Security-Policy: default-src 'self'; script-src 'sha256-HgP/C/HfzlJIctOVi/okNAgn76d6kykP7D0jrm1nVu0='; style-src 'sha256-ZBTj5RHLnrF+IxdRZM2RuLfjTJQXNSi7fLQHr09onfY=' 'sha256-0brZ5JHU3lwo7f/rLUc9Nu1kRemuKlxjcMBYIpWAFe0=';`],
  ['report-only', { reportOnly: true, reportURI: '/report-error' }, `/\n  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'sha256-QgHoDO3umGbaH6pPry9eZ2aNL1KxNUYO9YINxJhKCFc=' 'sha256-kbu6AoxGeNvnosFj2cT7o23oVjN3kw10MbQJ0oC4opI='; report-uri /report-error;`],
  ['report-uri', { reportURI: '/report-error' }, `/\n  Content-Security-Policy: default-src 'self'; report-uri /report-error;`],
  ['report-to', { reportTo: 'csp-endpoint' }, `/\n  Content-Security-Policy: default-src 'self'; report-to csp-endpoint;`],
  ['report-uri-and-report-to', { reportURI: '/report-error', reportTo: 'csp-endpoint' }, `/\n  Content-Security-Policy: default-src 'self'; report-uri /report-error; report-to csp-endpoint;`],
  ['exclude-paths', { exclude: ['./tests/e2e/exclude-paths/exclude/this-folder/index.html', '!./tests/e2e/exclude-paths/exclude/and-also-this/index.html']}, `/\n  Content-Security-Policy: default-src 'self';\n/exclude/\n  Content-Security-Policy: default-src 'self';`],
  ['exclude-wildcards', { exclude: ['**.css', '**.js', '**/exclude/**']}, `/\n  Content-Security-Policy: default-src 'self';`],
  ['all-or-html-only', { generateForAllFiles: true }, `/\n  Content-Security-Policy: default-src 'self';\n/nested/\n  Content-Security-Policy: default-src 'self';`],
]

if (folders.length < fs.readdirSync('./tests/e2e/', { withFileTypes: true }).filter(dirent => dirent.isDirectory()).length) {
  console.warn('\u001b[37m\u001b[43m\u001b[1m WARN \u001b[22m\u001b[49m\u001b[39m Some folders are missing from test run')
}

global.console = {
  info: () => {},
}

test.each(folders)('%s', async (folder, customInputs, expected) => {
  const inputs = {
    buildDir: `./tests/e2e/${folder}`,
    exclude: [],
    policies: {
      defaultSrc: `'self'`,
    },
    disablePolicies: [],
    disableGeneratedPolicies: false,
    ...customInputs,
  }

  const headersFilePath = `${inputs.buildDir}/_headers`

  if (fs.existsSync(headersFilePath)) {
    fs.unlinkSync(headersFilePath)
  }

  await onPostBuild({ inputs })

  const file = fs.readFileSync(headersFilePath, 'utf-8')

  expect(file).toBe(expected)
})
