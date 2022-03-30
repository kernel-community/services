/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import authService from './auth.js'
import entityService from './entity.js'

const register = async (server, { seed, storageHost }, opts={}) => {
  const service = fastify(opts)
  const entityClient = entityService.build.bind(null, { host: storageHost })
  const client = await authService.build({ seed, entityClient })

  service.register(sensible)

  service.get('/healthz', async (req, rep) => {
    return { status: 'ok' }
  })

  service.get('/auth/public', async (req, rep) =>
    client.publicKey()
  )

  service.post('/auth/register', async (req, rep) => {
    try {
      return client.register(req.body)
    } catch (e) {
      // TODO: define errors
    }
  })

  service.post('/auth/token', async (req, rep) =>
    client.accessToken(req.body)
  )
}

const auth = { register }

export default auth 
