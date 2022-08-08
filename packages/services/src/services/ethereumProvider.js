/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import fetch from 'node-fetch'

const build = async ({ infuraId }) => {

  const urls = {
    1: `https://mainnet.infura.io/v3/${infuraId}`,
    3: `https://ropsten.infura.io/v3/${infuraId}`,
    4: `https://rinkeby.infura.io/v3/${infuraId}`,
    5: `https://goerli.infura.io/v3/${infuraId}`,
    42: `https://kovan.infura.io/v3/${infuraId}`
  }

  const request = async (chainId, payload) => {
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
    const url = urls[chainId]
    if (!url) {
      return { error: { code: 404, message: `Unknown chain id: ${chainId}` } }
    }
    const response = await fetch(url, opts)
    if (response.ok) {
      const json = await response.json()
      return json
    }
    return { error: { code: response.status, message: response.statusText } }
  }

  return { request }
}

const service = { build }

export default service
