/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import 'dotenv/config'
import service from './service.js'

//TODO: implement JWT middlewear

const PORT = process.env.PORT || 3000

const start = async () => {
  const server = await service({
    seed: process.env.SEED,
    resourceHost: process.env.RESOURCE_HOST
  }, {
    logger: {
      level: 'debug',
      prettyPrint: true
    }
  })
  try {
    await server.listen(PORT)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
