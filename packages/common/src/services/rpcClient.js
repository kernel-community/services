/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const VERSION = '2.0'

// Not supported on Safari on iOS except newest version
// const uuid = () => crypto.randomUUID()
const uuid = () => Date.now()

const build = async ({ rpcEndpoint, jwtFn }) => {
  const jsonRpc = ({ version = VERSION, id = uuid(), method, params }) => {
    return { jsonrpc: version, id, method, params }
  }

  const method = (service, name) => `${service}.${name}`

  const request = async (url, data) => {
    const jwt = await jwtFn.call()
    const headers = { 'Content-Type': 'application/json' }
    if (jwt) {
      Object.assign(headers, { Authorization: `Bearer ${jwt}` })
    }
    const opts = {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(data)
    }
    console.log(opts)
    return fetch(url, opts)
      .then((e) => e.ok
        ? e.json()
        : { error: { code: e.status, message: e.statusText } })
  }

  const call = async ({ method, params }) => {
    const data = jsonRpc({ method, params })
    const { result, error } = await request(rpcEndpoint, data)
    if (error) {
      throw new Error(`${error.message}`)
    }
    return result
  }

  return { method, call }
}

const rpc = { build }

export default rpc
