/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import 'dotenv/config'
import fastify from 'fastify'
import sensible from 'fastify-sensible'

import health from './routes/health.js'
import rpc from './routes/rpc.js'

//TODO: implement JWT middlewear

const PORT = process.env.PORT || 3000

const start = async () => {
  const opts = {
    logger: {
      level: 'debug',
      prettyPrint: true
    }
  }
  const server = fastify(opts)
  try {
    server.register(sensible)
    await Promise.all([
      health.register(server),
      rpc.register(server, '/rpc', {
        seed: process.env.SEED,
        rpcEndpoint: process.env.RPC_ENDPOINT
      })
    ])
    await server.listen(PORT)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
