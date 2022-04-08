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

const ROLE_ALL = 1000
const ROLE_CORE = 100
const SERVICE_POLICY = {
  authService: {
    setup: ROLE_CORE,
    publicKey: ROLE_ALL,
    register: ROLE_ALL,
    accessToken: ROLE_ALL
  }
}
const register = async (server, rpcPath, { seed, authMemberId, rpcEndpoint }) => {

  const authService = await authBuilder.build({ seed, authMemberId, rpcEndpoint })

  const services = { authService }
  const rpcService = await rpcBuilder.build(services)

  //TODO: limit origin domains
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
    const { jsonrpc, id, method, params } = request.body
    if (!jsonrpc || !id || !method)  {
      return reply.badRequest()
    }
    if (!method.length || method.indexOf('.') < 0) {
      return reply.badRequest()
    }
    console.debug('rpc ', request.body, request.user)
    const [service, fn] = method.split('.') 
    try {
      const result = await rpcService.call(service, fn, params)
      return { jsonrpc, id, result }
    } catch (e) {
      const error = { code: e.code, message: e.message }
      return { jsonrpc, id, error }
    }
  })

  return {listen: () => ''}
}

const rpc = { register }

export default rpc
