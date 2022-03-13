/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import rpcBuilder from './../services/rpc.js'
import storageBuilder from './../services/storage.js'
import resourceBuilder from './../services/resource.js'
import entityBuilder from './../services/entity.js'

const VERSION = '2.0'

const register = async (server, { projectId, bucket }) => {

  const storageService = await storageBuilder.build({ projectId, bucket })
  const resourceService = await resourceBuilder.build(storageService)
  const entityService = await entityBuilder.build(storageService)

  const services = { storageService, resourceService, entityService }
  const rpcService = await rpcBuilder.build(services)

  server.post('/rpc', async (request, reply) => {
    const { jsonrpc, id, method, params } = request.body
    const [service, fn] = method.split('.') 
    try {
      const result = await rpcService.call(service, fn, params)
      return { jsonrpc, id, result }
    } catch (e) {
      const error = { code: e.code, message: e.message }
      return { jsonrpc, id, error }
    }
  })
}

const rpc = { register }

export default rpc
