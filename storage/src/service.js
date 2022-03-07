/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import fastify from 'fastify'

const build = (opts={}) => {
  const app = fastify(opts)
  app.get('/', async (req, rep) => {
    return { hello: 'world' }
  })
  return app
}

export default build
