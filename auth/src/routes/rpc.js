/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import authBuilder from './../services/auth.js'
import rpcBuilder from './../services/rpc.js'

const VERSION = '2.0'

const register = async (server, rpcPath, { seed, rpcEndpoint }) => {

  const authService = await authBuilder.build({ seed, rpcEndpoint })

  const services = { authService }
  const rpcService = await rpcBuilder.build(services)

  server.options(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    return {}
  })

  server.post(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST")
    console.debug(request.body)
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
