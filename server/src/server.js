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

//import rpcStorage from './../../storage/src/routes/rpc.js'
//import rpcAuth from './../../auth/src/routes/rpc.js'
import { rpc as rpcStorage } from '@kernel/storage'
import rpcAuth from '@kernel/auth'

import health from './routes/health.js'

import secretBuilder from './services/secret.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'
const STORAGE_RPC_PATH = process.env.STORAGE_RPC_PATH || '/storage/rpc'
const AUTH_RPC_PATH = process.env.AUTH_RPC_PATH || '/auth/rpc'
const AUTH_SEED_SECRET_ID = process.env.AUTH_SEED_SECRET_ID || 'authSeed'

const AUTH_SEED_SECRET_CRC32C = process.env.AUTH_SEED_SECRET_CRC32C 
const AUTH_MEMBER_ID = process.env.AUTH_MEMBER_ID
const PROJECT_ID = process.env.PROJECT_ID
const BUCKET = process.env.BUCKET

const production = () => process.env.NODE_ENV === 'production'

const start = async () => {
  const opts = {
    logger: {
      level: 'info'
    }
  }
  const server = fastify(opts)
  try {
    server.register(sensible)
    let seed = process.env.SEED || ''
    if (production()) {
      const secretService = await secretBuilder.build({ projectId: PROJECT_ID })
      const secret = await secretService.access({
        secretId: AUTH_SEED_SECRET_ID, crc32c: AUTH_SEED_SECRET_CRC32C
      })
      seed = secret.payload.data.toString()
    }

    const listenFns = await Promise.all([
      health.register(server),
      rpcStorage.register(server, STORAGE_RPC_PATH, {
        projectId: PROJECT_ID,
        bucket: BUCKET,
        rpcEndpoint: `http://${HOST}:${PORT}${AUTH_RPC_PATH}`
      }),
      rpcAuth.register(server, AUTH_RPC_PATH, {
        seed,
        authMemberId: AUTH_MEMBER_ID,
        rpcEndpoint: `http://${HOST}:${PORT}${STORAGE_RPC_PATH}`
      })
    ])
    await server.listen(PORT, '0.0.0.0')
    listenFns.forEach(({ listen }) => listen())
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
