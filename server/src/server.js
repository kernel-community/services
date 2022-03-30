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
import rpcStorage from './../../storage/src/routes/rpc.js'
import rpcAuth from './../../auth/src/routes/rpc.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'
const STORAGE_RPC_PATH = process.env.STORAGE_RPC_PATH || '/storage/rpc'
const AUTH_RPC_PATH = process.env.AUTH_RPC_PATH || '/auth/rpc'

const start = async () => {
  const opts = {
    logger: {
      level: 'info'
    }
  }
  const server = fastify(opts)
  try {
    server.register(sensible)
    await Promise.all([
      health.register(server),
      rpcStorage.register(server, STORAGE_RPC_PATH, {
        projectId: process.env.PROJECT_ID,
        bucket: process.env.BUCKET,
        rpcEndpoint: `http://${HOST}:${PORT}${AUTH_RPC_PATH}`
      }),
      rpcAuth.register(server, AUTH_RPC_PATH, {
        seed: process.env.SEED,
        rpcEndpoint: `http://${HOST}:${PORT}${STORAGE_RPC_PATH}`
      })
    ])
    await server.listen(PORT, '0.0.0.0')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
