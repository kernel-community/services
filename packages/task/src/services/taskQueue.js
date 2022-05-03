/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { ethers } from 'ethers'

import google from './google.js'
import jwtService from './../../../auth/src/services/jwt.js'
import entityBuilder from './../../../auth/src/services/entity.js'
import rpcClientBuilder from './../../../auth/src/services/rpcClient.js'

const API_ROLE = 50
const API_NICKNAME = 'apiServer'

const now = () => Date.now()

const build = async ({ projectId, seed, serviceAccount, authMemberId, rpcEndpoint }) => {

  // TODO: move to separate service
  const provider = jwtService.defaultProvider()
  const wallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), provider)

  const newToken = async () => 
    jwtService.createJwt(wallet, jwtService.AUTH_JWT,
      jwtService.authPayload({ iss: authMemberId, nickname: API_NICKNAME, role: API_ROLE }))
  let jwtToken = await newToken()
  const jwtFn = async () => {
    const {payload: { exp } } = jwtService.decode(jwtToken)
    if (exp - now() < 1000 * 60 * 5) {
      jwtToken = await newToken()
    }
    return jwtToken
  }
  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn })
  const entityClient = entityBuilder.build.bind(null, { rpcClient })

  // entities
  // const members = await entityClient({ resource: 'member' })
  const projects = await entityClient({ resource: 'project' })

  // google services
  const googleServices = await google.build({ projectId, serviceAccount })

  const generateEmail = (to, subject, message) => {
    const email = `To: ${to}
    Subject: ${subject}
    MIME-Version: 1.0
    Content-Type: text/plain; charset="UTF-8"
    Content-Transfer-Encoding: base64
    ${message}`;
    return base64url(Buffer.from(email).toString('base64url'))
  }

  const repl = async ({ iss, role }, s) => {
    try {
      console.log(eval(s))
    } catch (error) {
      console.log(error)
    }
    return s
  }

  const sendEmail = async ({ iss, role }, { to, subject, message }) => {
    const raw = generateEmail(to, subject, message)
    const result = await googleServices.sendEmail(raw)
    return result
  }

  const echo = async ({ iss, role }, s) => {
    console.log(s)
    return s
  }

  const followProject = async ({ iss, role }, id) => {
    const updated = await projects.patch(id, { followerIds: [iss] })
    // TODO: should we have a tasks resource and record a return value?
    return updated
  }

  return { repl, sendEmail, echo, followProject }
}

const taskQueue = { build }

export default taskQueue
