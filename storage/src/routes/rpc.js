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
//TODO: move to common
import jwtService from './../../../auth/src/services/jwt.js'
import rpcClientBuilder from './../../../auth/src/services/rpcClient.js'

const VERSION = '2.0'
const BEARER_TYPE = 'Bearer'

const register = async (server, rpcPath, { projectId, bucket, rpcEndpoint }) => {

  const storageService = await storageBuilder.build({ projectId, bucket })
  const resourceService = await resourceBuilder.build(storageService)
  const entityService = await entityBuilder.build(storageService, resourceService)

  const services = { storageService, resourceService, entityService }
  const rpcService = await rpcBuilder.build(services)

  //TODO: cleanup
  let authServiceAddress
  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn: () => ''})
  const getAuthAddress = async () => {
    const data = await rpcClient.call({ method: 'authService.publicKey', params: [] })
    const { payload, signature } = jwtService.decode(data)
    if (!jwtService.verify(jwtService.JWK, payload, payload.iss, signature)) {
      throw new Error(`signature error: ${payload}`)
    }
    console.debug('auth service address', payload.iss)
    authServiceAddress = payload.iss
  }
  setTimeout(getAuthAddress, 1000)

  const auth = async (request, reply) => {
    const header = request.raw.headers.authorization
    if (!header) {
      return reply.unauthorized()
    }
    const jwt = header.substring(BEARER_TYPE.length).trim()
    try {
      //TODO: check expiration
      const { payload, signature } = jwtService.decode(jwt)
      if (!jwtService.verify(jwtService.AUTH_JWT, payload, authServiceAddress, signature)) {
        console.debug(`signature error: ${payload}`)
        return reply.unauthorized()
      }
      request.user = payload
    } catch (e) {
      console.debug('authorization error', e)
      return reply.unauthorized()
    }
  }

  server.options(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    return {}
  })

  server.post(`${rpcPath}`, { onRequest: auth }, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Methods", "POST")
    console.debug('rpc call: ', request.body, request.user)
    const user = request.user
    const { jsonrpc, id, method, params } = request.body
    const [service, fn] = method.split('.') 
    try {
      const result = await rpcService.call(service, fn, [user].concat(params))
      console.debug('rpc result', result)
      return { jsonrpc, id, result }
    } catch (e) {
      console.debug('error', e)
      const error = { code: e.code, message: e.message }
      return { jsonrpc, id, error }
    }
  })
}

const rpc = { register }

export default rpc
