const fs = require('fs')
const { performance } = require('perf_hooks')
const globby = require('globby')

const { mergeWithDefaultPolicies, createFileProcessor, buildCSPArray, splitToGlobalAndLocal } = require('./functions.js')

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

    const processFile = createFileProcessor(buildDir, disableGeneratedPolicies)

    const processedFileHeaders = await Promise.all(
      paths.map(path => fs.promises.readFile(path, 'utf-8').then(processFile(path)))
    )

    const { globalHeaders, localHeaders } = processedFileHeaders
      .reduce(splitToGlobalAndLocal, { globalHeaders: [], localHeaders: [] })

    const file = globalHeaders.concat(...localHeaders)
      .map(({ webPath, cspObject }) => {
        const cspString = buildCSPArray(mergedPolicies, disablePolicies, cspObject).join(' ')
        return `${webPath}\n  Content-Security-Policy: ${cspString}`
      }).join('\n')

    fs.appendFileSync(`${buildDir}/_headers`, file)

    const completedTime = performance.now() - startTime
    console.info(`Saved at ${buildDir}/_headers - ${(completedTime / 1000).toFixed(2)} seconds`)
  },
}
