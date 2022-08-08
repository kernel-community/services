/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import 'dotenv/config'
import cookie from '@fastify/cookie'
import fastify from 'fastify'
import sensible from '@fastify/sensible'

//import rpcStorage from './../../storage/src/routes/rpc.js'
//import rpcAuth from './../../auth/src/routes/rpc.js'
import { rpc as rpcStorage } from '@kernel/storage'
import rpcAuth from '@kernel/auth'
import rpcTask from '@kernel/task'
import rpcQuery from '@kernel/query'

import health from './routes/health.js'
import provider from './routes/provider.js'

import secretBuilder from './services/secret.js'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'

const STORAGE_RPC_PATH = process.env.STORAGE_RPC_PATH || '/storage/rpc'
const AUTH_RPC_PATH = process.env.AUTH_RPC_PATH || '/auth/rpc'
const AUTH_SEED_SECRET_ID = process.env.AUTH_SEED_SECRET_ID || 'authSeed'

const TASK_RPC_PATH = process.env.TASK_RPC_PATH || '/task/rpc'
const TASKS_PATH = process.env.TASKS_PATH || '/tasks'

const QUERY_RPC_PATH = process.env.QUERY_RPC_PATH || '/query/rpc'

const ETH_PROVIDER_RPC_PATH = process.env.ETH_PROVIDER_RPC_PATH || '/provider/rpc/eth'

const AUTH_SEED_SECRET_CRC32C = process.env.AUTH_SEED_SECRET_CRC32C 
const AUTH_MEMBER_ID = process.env.AUTH_MEMBER_ID
const PROJECT_ID = process.env.PROJECT_ID
const BUCKET = process.env.BUCKET
const TASK_SERVICE_SECRET_ID = process.env.TASK_SERVICE_SECRET_ID
const TASK_SERVICE_SECRET_CRC32C = process.env.TASK_SERVICE_SECRET_CRC32C
const INFURA_SECRET_ID = process.env.INFURA_SECRET_ID
const INFURA_SECRET_CRC32C = process.env.INFURA_SECRET_CRC32C
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT

const local = () => process.env.ENV === 'DEV'

const start = async () => {
  const opts = {
    logger: {
      level: 'info'
    }
  }
  const server = fastify(opts)
  try {
    server.register(sensible)
    server.register(cookie)
    // Cloud Tasks sends this content type
    // https://github.com/googleapis/nodejs-tasks/blob/main/samples/server.js#L26
    server.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, async (request, body) => {
      return JSON.parse(Buffer.from(body, 'base64'))
    })
    const secretService = await secretBuilder.build({ projectId: PROJECT_ID })
    const authSecret = await secretService.access({
      secretId: AUTH_SEED_SECRET_ID, crc32c: AUTH_SEED_SECRET_CRC32C
    })
    const seed = authSecret.payload.data.toString()
    const taskSecret = await secretService.access({
      secretId: TASK_SERVICE_SECRET_ID, crc32c: TASK_SERVICE_SECRET_CRC32C
    })
    const serviceAccount = JSON.parse(taskSecret.payload.data.toString())
    const infuraSecret = await secretService.access({
      secretId: INFURA_SECRET_ID, crc32c: INFURA_SECRET_CRC32C
    })
    const infuraId = JSON.parse(infuraSecret.payload.data.toString()).id

    const listenFns = await Promise.all([
      health.register(server),
      provider.register(server, ETH_PROVIDER_RPC_PATH, { infuraId }),
      rpcStorage.register(server, STORAGE_RPC_PATH, {
        projectId: PROJECT_ID,
        bucket: BUCKET,
        rpcEndpoint: `http://${HOST}:${PORT}${AUTH_RPC_PATH}`
      }),
      rpcAuth.register(server, AUTH_RPC_PATH, {
        seed,
        authMemberId: AUTH_MEMBER_ID,
        rpcEndpoint: `http://${HOST}:${PORT}${STORAGE_RPC_PATH}`
      }),
      rpcTask.register(server, TASK_RPC_PATH, TASKS_PATH, {
        projectId: PROJECT_ID,
        seed,
        serviceAccount,
        infuraId,
        faucetAmount: FAUCET_AMOUNT,
        authMemberId: AUTH_MEMBER_ID,
        rpcEndpoint: `http://${HOST}:${PORT}${STORAGE_RPC_PATH}`
      }),
      rpcQuery.register(server, QUERY_RPC_PATH, {
        projectId: PROJECT_ID,
        seed,
        serviceAccount,
        authMemberId: AUTH_MEMBER_ID,
        rpcEndpoint: `http://${HOST}:${PORT}${STORAGE_RPC_PATH}`
      })
    ])
    await server.listen({ port: PORT, host: '0.0.0.0' })
    listenFns.forEach(({ listen }) => listen())
  } catch (err) {
    console.log(err)
    server.log.error(err)
    process.exit(1)
  }
}

start()
