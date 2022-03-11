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

const start = async () => {
  const server = await service({
    projectId: process.env.PROJECT_ID,
    bucket: process.env.BUCKET
  }, {
    logger: {
      level: 'debug',
      prettyPrint: true
    }
    })
  try {
    await server.listen(3000)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
