const fs = require('fs')
const globby = require('globby')
const sha256 = require('js-sha256').sha256
const { JSDOM } = require('jsdom')

module.exports = {
  onPostBuild: async ({ inputs }) => {
    const { buildDir, exclude, policies, setAllPolicies } = inputs

    const defaultPolicies = {
      defaultSrc: '',
      childSrc: '',
      connectSrc: '',
      fontSrc: '',
      frameSrc: '',
      imgSrc: '',
      manifestSrc: '',
      mediaSrc: '',
      objectSrc: '',
      prefetchSrc: '',
      scriptSrc: '',
      scriptSrcElem: '',
      scriptSrcAttr: '',
      styleSrc: '',
      styleSrcElem: '',
      styleSrcAttr: '',
      workerSrc: '',
    }
    const mergedPolicies = {...defaultPolicies, ...policies}

    const htmlFiles = `${buildDir}/**/**.html`
    const excludeFiles = (exclude || []).map((filePath) => `!${filePath.replace(/^!/, '')}`)
    const lookup = [htmlFiles].concat(excludeFiles)
    const paths = await globby(lookup)

    console.info(`Found ${paths.length} HTML ${paths.length === 1 ? 'file' : 'files'}...`)

    const result = paths.reduce(
      generateCSPHeadersFile(buildDir, mergedPolicies, setAllPolicies),
      {
        updated: 0,
        headersFile: [],
      },
    )

    mergeHeadersFile(`${buildDir}/_headers`, result.headersFile)
    console.info(`Generated headers for ${result.updated} ${result.updated === 1 ? 'path' : 'paths'}.  Saved at ${buildDir}/_headers.`)
  },
}

function generateCSPHeadersFile(buildDir, mergedPolicies, setAllPolicies) {
  return (final, path) => {
    const file = fs.readFileSync(path, 'utf-8')
    const dom = new JSDOM(file)

    const scripts = generateHashesForTag(dom, 'script')

    if (scripts.size) {
      const webPath = path.replace(new RegExp(`^${buildDir}`), '').replace(/index\.html$/, '')
      const cspString = buildCSPArray(
        mergedPolicies,
        setAllPolicies,
        {
          scriptSrc: Array.from(scripts),
        }
      ).join(' ')

      final.headersFile.push({
        path: webPath,
        policy: cspString,
      })
      final.updated++
    }

    return final
  }
}

function generateHashesForTag(dom, type) {
  const hashes = new Set()
  for (const matchedElement of dom.window.document.getElementsByTagName(type)) {
    if (matchedElement.innerHTML.length) {
      const hash = sha256.arrayBuffer(matchedElement.innerHTML)
      const base64hash = Buffer.from(hash).toString('base64')
      hashes.add(`'sha256-${base64hash}'`)
    }
  }
  return hashes
}

function buildCSPArray (allPolicies, setAllPolicies, hashes) {
  const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

  return Object.keys(allPolicies).reduce((csp, key) => {
    if (hashes[key] || allPolicies[key] || setAllPolicies) {
      csp.push(
        hashes[key]
          ? `${toKebabCase(key)} ${hashes[key].join(' ')} ${allPolicies[key]};`
          : `${toKebabCase(key)} ${allPolicies[key]};`
      )
    }
    return csp
  }, [])
}

function mergeHeadersFile (path, data) {
  const file = data.reduce((final, row) => {
    final += `${row.path}\n  Content-Security-Policy: ${row.policy}\n`
    return final
  }, '')

  console.info('Writing headers file.')
  return fs.appendFileSync(path, file)
}
