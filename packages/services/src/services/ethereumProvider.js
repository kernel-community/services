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

  const url = `https://rinkeby.infura.io/v3/${infuraId}`
  const request = async (payload) => {
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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
