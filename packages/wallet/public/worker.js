let soljson, alloc, version, solidityCompile, reset

const cache = {}

const copyToCString = (str, ptr) => {
  const length = soljson.lengthBytesUTF8(str)
  const buffer = alloc(length + 1)
  soljson.stringToUTF8(str, buffer, length + 1)
  soljson.setValue(ptr, buffer, '*')
}

const callbackHandler = (f) =>
  (context, kind, data, contents, error) => {
    console.log(context, kind, data, contents, error)
    const result = f(soljson.UTF8ToString(kind), soljson.UTF8ToString(data))
    if (result.contents) {
      copyToCString(result.contents, contents)
    }
    if (result.error) {
      copyToCString(result.error, error)
    }
  }

self.addEventListener('message', (e) => {
  const { data: { cmd, payload } } = e

  if (cmd === 'load') {
    self.importScripts(payload)
    soljson = self.Module
    console.log('complier loaded', soljson)
    version = soljson.cwrap('solidity_version', 'string', [])
    alloc = soljson.cwrap('solidity_alloc', 'number', ['number'])
    reset = soljson.cwrap('solidity_reset', null, [])
    solidityCompile = soljson.cwrap('solidity_compile', 'string', ['string', 'number'])
    self.postMessage({ cmd: 'init', payload: `Solidity compiler ${version()} loaded` })
    console.log(version())
  }

  if (cmd === 'cache') {
    console.log('caching', payload)
    fetch(payload)
      .then((resp) => resp.text())
      .then((contents) => Object.assign(cache, { [payload]: contents }))
  }

  if (cmd === 'compile') {
    const input = payload
    const fn = callbackHandler((kind, data) => {
      console.log(kind, data)
      if (kind === 'source' && cache[data]) {
        return { contents: cache[data] }
      }
      // auto cache
      fetch(data)
        .then((resp) => resp.text())
        .then((contents) => Object.assign(cache, { [data]: contents }))
      return { error: `not cached: ${data}` }
    })
    const now = Date.now()
    const compile = () => {
      const cb = soljson.addFunction(fn, 'viiiii')
      const output = JSON.parse(solidityCompile(JSON.stringify(input), cb))
      soljson.removeFunction(cb)
      reset()
      console.log(output)
      if (output.errors && output.errors.filter(({ errorCode }) => errorCode === '6275').length) {
        self.postMessage({ cmd: 'compiling', payload: `compiling ${Math.round((Date.now() - now) / 1000)}s` })
        return setTimeout(compile, 1000)
      }
      self.postMessage({ cmd: 'compiled', payload: output })
    }
    self.postMessage({ cmd: 'compiling', payload: 'compiling' })
    compile()
  }
})
