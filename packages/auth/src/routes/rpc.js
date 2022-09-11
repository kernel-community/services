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

const LOCAL = process.env.ENV === 'DEV'
const DOMAIN = LOCAL ? '.app.localhost' : 'kernel.community'

const PROD = process.env.ENV === 'PROD'
const COOKIE_JWT = PROD ? 'prodJWT' : 'stagingJWT'
const COOKIE_USER = PROD ? 'prodUser' : 'stagingUser'

const register = async (server, rpcPath, { seed, authMemberId, rpcEndpoint }) => {

  const authService = await authBuilder.build({ seed, authMemberId, rpcEndpoint })

  const services = { authService }
  const rpcService = await rpcBuilder.build(services)

  // TODO: allow list for origin
  server.options(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", request.headers.origin)
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Credentials", "true")
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS")
    reply.header("Access-Control-Allow-Headers", "authorization,content-type")
    return {}
  })

  server.post(`${rpcPath}`, async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", request.headers.origin)
    reply.header("Access-Control-Allow-Headers", "*")
    reply.header("Access-Control-Allow-Credentials", "true")
    reply.header("Access-Control-Allow-Methods", "POST")
    reply.header("Access-Control-Allow-Headers", "authorization,content-type")
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
      const { authPayload, jwt, persist } = await rpcService.call(service, fn, params)
      if (persist) {
        // TODO: set expires properly
        //const maxAge = authPayload.exp - Date.now()
        const opts = {
          domain: DOMAIN,
          maxAge: 60 * 60 * 20,
          sameSite: 'none',
          secure: true,
          httpOnly: true,
          path: '/'
        }
        reply.setCookie(COOKIE_JWT, jwt, opts)
        reply.setCookie(COOKIE_USER, JSON.stringify(authPayload), {
          domain: DOMAIN,
          maxAge: 60 * 60 * 20,
          sameSite: 'none',
          secure: true,
          path: '/'
        })
      }
      return { jsonrpc, id, result: jwt }
    } catch (e) {
      const error = { code: e.code, message: e.message }
      return { jsonrpc, id, error }
    }
  })

  return {listen: () => ''}
}

const rpc = { register }

export default rpc
