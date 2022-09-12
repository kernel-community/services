/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import queryBuilder from './../services/query.js'
import rpcBuilder from './../services/rpc.js'

//TODO: move to common
import jwtService from './../../../auth/src/services/jwt.js'
import rpcClientBuilder from './../../../auth/src/services/rpcClient.js'

const VERSION = '2.0'
const BEARER_TYPE = 'Bearer'

const authServiceAddress = process.env.AUTH_ADDRESS

const ROLE_ALL = 1000
const ROLE_CORE = 100

const SERVICE_POLICY = {
  queryService: {
    recommend: ROLE_ALL
  }
}

const PROD = process.env.ENV === 'PROD'
const COOKIE_JWT = PROD ? 'prodJWT' : 'stagingJWT'

const register = async (server, rpcPath, { seed, authMemberId, rpcEndpoint, projectId }) => {

  const queryService = await queryBuilder.build({ seed, authMemberId, rpcEndpoint })
  const services = { queryService }
  const rpcService = await rpcBuilder.build(services)

  const now = () => Date.now()

  const getJWT = (request) => {
    // Try to get JWT from headers or cookie
    const header = request.raw.headers.authorization
    const cookie = request.cookies[COOKIE_JWT]
    if (!header && !cookie) {
      return
    }
    const jwt = header ?
      header.substring(BEARER_TYPE.length).trim() : cookie
    return jwt
  }

  const auth = async (request, reply) => {
    if (!authServiceAddress) {
      return reply.serviceUnavailable()
    }
    const jwt = getJWT(request)
    if (!jwt) {
      console.debug('unauthorized')
      return reply.unauthorized()
    }
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
    reply.header("Access-Control-Allow-Origin", request.headers.origin)
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Credentials", "true")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    reply.header("Access-Control-Allow-Headers", "authorization,content-type")
    return {}
  })

  server.post(`${rpcPath}`, { onRequest: auth }, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", request.headers.origin)
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Credentials", "true")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    reply.header("Access-Control-Allow-Headers", "authorization,content-type")
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
    const policy = SERVICE_POLICY[service][fn] || 0
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
