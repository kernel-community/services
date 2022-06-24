/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import providerBuilder from './../services/ethereumProvider.js'

const register = async (server, rpcPath, { infuraId }) => {
  const providerService = await providerBuilder.build({ infuraId })
 
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
    const json = await providerService.request(request.body)
    return json
  })

  return {listen: () => ''}
}

const route = { register }

export default route

