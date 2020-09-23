const fs = require('fs')
const { performance } = require('perf_hooks')
const globby = require('globby')
const sha256 = require('js-sha256').sha256
const { JSDOM } = require('jsdom')

module.exports = {
  onPostBuild: async ({ inputs }) => {
    const startTime = performance.now()

    const { buildDir, exclude, policies, disablePolicies, disableGeneratedPolicies } = inputs
    const mergedPolicies = mergeWithDefaultPolicies(policies)

    const htmlFiles = `${buildDir}/**/**.html`
    const excludeFiles = (exclude || []).map((filePath) => `!${filePath.replace(/^!/, '')}`)
    console.info(`Excluding ${excludeFiles.length} ${excludeFiles.length === 1 ? 'file' : 'files'}`)
    const lookup = [htmlFiles].concat(excludeFiles)
    const paths = await globby(lookup)
    console.info(`Found ${paths.length} HTML ${paths.length === 1 ? 'file' : 'files'}`)

    const file = paths.reduce((final, path) => {
      const file = fs.readFileSync(path, 'utf-8')
      const dom = new JSDOM(file)

      const shouldGenerate = (key) => !(disableGeneratedPolicies || []).includes(key)
      const scripts = shouldGenerate('scriptSrc') ? generateHashesFromElement(dom, 'script') : []
      const styles = shouldGenerate('styleSrc') ? generateHashesFromElement(dom, 'style') : []
      const inlineStyles = shouldGenerate('styleSrc') ? generateHashesFromStyle(dom, '[style]') : []
  
      const webPath = path.replace(new RegExp(`^${buildDir}(.*)index\\.html$`), '$1')
      const cspString = buildCSPArray(mergedPolicies, disablePolicies, {
        scriptSrc: scripts,
        styleSrc: [...styles, ...inlineStyles],
      }).join(' ')
  
      final += `${webPath}\n  Content-Security-Policy: ${cspString}\n`
      return final
    }, [])

    fs.appendFileSync(`${buildDir}/_headers`, file)

    const completedTime = performance.now() - startTime
    console.info(`Saved at ${buildDir}/_headers - ${(completedTime / 1000).toFixed(2)} seconds`)
  },
}

function mergeWithDefaultPolicies (policies) {
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

  return {...defaultPolicies, ...policies}
}

function generateHashesFromElement (dom, selector) {
  const hashes = new Set()
  for (const matchedElement of dom.window.document.querySelectorAll(selector)) {
    if (matchedElement.innerHTML.length) {
      const hash = sha256.arrayBuffer(matchedElement.innerHTML)
      const base64hash = Buffer.from(hash).toString('base64')
      hashes.add(`'sha256-${base64hash}'`)
    }
  }
  return Array.from(hashes)
}

function generateHashesFromStyle (dom, selector) {
  const hashes = new Set()
  for (const matchedElement of dom.window.document.querySelectorAll(selector)) {
    if (matchedElement.getAttribute('style').length) {
      const hash = sha256.arrayBuffer(matchedElement.getAttribute('style'))
      const base64hash = Buffer.from(hash).toString('base64')
      hashes.add(`'sha256-${base64hash}'`)
    }
  }
  return Array.from(hashes)
}

function buildCSPArray (allPolicies, disablePolicies, hashes) {
  const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

  return Object.keys(allPolicies).reduce((csp, key) => {
    if ((hashes[key] || allPolicies[key]) && !(disablePolicies || []).includes(key)) {
      csp.push(
        hashes[key]
          ? `${toKebabCase(key)} ${hashes[key].join(' ')} ${allPolicies[key]};`
          : `${toKebabCase(key)} ${allPolicies[key]};`
      )
    }
    return csp
  }, [])
}
