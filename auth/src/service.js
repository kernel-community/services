/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import fastify from 'fastify'
import authService from './auth.js'

const build = async ({ seed = {} }, opts={}) => {
  const service = fastify(opts)
  const client = await authService.build()

  service.get('/healthz', async (req, rep) => {
    return { status: 'ok' }
  })

  service.get('/auth/public', async (req, rep) =>
    client.publicKey()
  )

  service.post('/auth/register', async (req, rep) =>
    client.register(req.body)
  )

  service.post('/auth/token', async (req, rep) =>
    client.accessToken(req.body)
  )

  return service
}

export default build
