export interface inputsType {
  buildDir: string
  exclude: string[]
  policies: policies
  setAllPolicies: boolean
}

export interface policies {
  defaultSrc?: string
  childSrc?: string
  connectSrc?: string
  fontSrc?: string
  frameSrc?: string
  imgSrc?: string
  manifestSrc?: string
  mediaSrc?: string
  objectSrc?: string
  prefetchSrc?: string
  scriptSrc?: string
  scriptSrcElem?: string
  scriptSrcAttr?: string
  styleSrc?: string
  styleSrcElem?: string
  styleSrcAttr?: string
  workerSrc?: string
}

export interface policyArray {
  defaultSrc?: string[]
  childSrc?: string[]
  connectSrc?: string[]
  fontSrc?: string[]
  frameSrc?: string[]
  imgSrc?: string[]
  manifestSrc?: string[]
  mediaSrc?: string[]
  objectSrc?: string[]
  prefetchSrc?: string[]
  scriptSrc?: string[]
  scriptSrcElem?: string[]
  scriptSrcAttr?: string[]
  styleSrc?: string[]
  styleSrcElem?: string[]
  styleSrcAttr?: string[]
  workerSrc?: string[]
}

export interface cspBuildData {
  updated: number
  headersFile: cspBuildHeader[]
}

export interface cspBuildHeader {
  path: string
  policy: string
}