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
import rest from './routes/rest.js'
import rpc from './routes/rpc.js'

//TODO: implement JWT middlewear

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
        projectId: process.env.PROJECT_ID,
        bucket: process.env.BUCKET
      })
    ])
    await server.listen(3000)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
