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

const authServiceAddress = process.env.AUTH_ADDRESS

const ROLE_ALL = 1000
const ROLE_CORE = 100
const SERVICE_POLICY = {
  storageService: {
    resources: ROLE_CORE,
    list: ROLE_CORE,
    create: ROLE_CORE,
    get: ROLE_CORE,
    patch: ROLE_CORE,
    update: ROLE_CORE,
    remove: ROLE_CORE,
    exists: ROLE_CORE,
    setup: ROLE_CORE
  },
  resourceService: {
    resources: ROLE_CORE,
    list: ROLE_CORE,
    create: ROLE_CORE,
    get: ROLE_CORE,
    patch: ROLE_CORE,
    update: ROLE_CORE,
    remove: ROLE_CORE,
    exists: ROLE_CORE,
    setup: ROLE_CORE
  },
  entityService: {
    resources: ROLE_ALL,
    list: ROLE_ALL,
    create: ROLE_ALL,
    get: ROLE_ALL,
    patch: ROLE_ALL,
    update: ROLE_ALL,
    remove: ROLE_ALL,
    exists: ROLE_ALL,
    setup: ROLE_ALL
  }
}

const register = async (server, rpcPath, { projectId, bucket, rpcEndpoint }) => {

  const storageService = await storageBuilder.build({ projectId, bucket })
  const resourceService = await resourceBuilder.build(storageService)
  const entityService = await entityBuilder.build(storageService, resourceService)

  const services = { storageService, resourceService, entityService }
  const rpcService = await rpcBuilder.build(services)

  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn: () => ''})
  const getAuthAddress = async () => {
    const data = await rpcClient.call({ method: 'authService.publicKey', params: [] })
    const { payload, signature } = jwtService.decode(data)
    if (!jwtService.verify(jwtService.JWK, payload, payload.iss, signature)) {
      throw { name: 'SignatureError', message: `signature error: ${payload}` }
    }
    return payload.iss
  }

  const now = () => Date.now()
  const auth = async (request, reply) => {
    if (!authServiceAddress) {
      return reply.serviceUnavailable()
    }
    const header = request.raw.headers.authorization
    if (!header) {
      return reply.unauthorized()
    }
    const jwt = header.substring(BEARER_TYPE.length).trim()
    try {
      const { payload, signature } = jwtService.decode(jwt)
      const { iss, nickname, iat, exp, aud } = payload
      if (!iss || !nickname || !iat || !exp || !aud) {
        console.debug(`malformed jwt error: ${payload}`)
        return reply.unauthorized()
      }
      if (iat >= exp || now() >= exp) {
        console.debug(`expiration error: ${payload}`)
        return reply.unauthorized()
      }
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
    if (!jsonrpc || !id || !method) {
      return reply.badRequest()
    }
    if (!method.length || method.indexOf('.') < 0) {
      return reply.badRequest()
    }
    const [service, fn] = method.split('.') 
    // rpc level auth
    const policy = SERVICE_POLICY[service][fn]
    console.debug('service policy', policy)
    if (user.role > policy) {
      return reply.unauthorized()
    }
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

  return {listen: () => ''}
}

const rpc = { register }

export default rpc
