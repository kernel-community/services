/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const register = async (server) => {
  server.get('/healthz', async (req, rep) => {
    return { status: 'ok' }
  })
}

const health = { register }

export default health
