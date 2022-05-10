/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { ethers } from 'ethers'

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
  //const members = await entityClient({ resource: 'member' })
  const projects = await entityClient({ resource: 'project' })
  const profiles = await entityClient({ resource: 'profile' })

  //TODO: order by geo or other fields
  const recommend = async ({ iss, role }, opts = {}) => {
    const [allProfiles, allProjects] = Promise.all([profiles.getAll(), projects.getAll()])
    return {
      profiles: allProfiles.filter((e) => e.consent),
      projects: allProjects
    }
  }

  return { recommend }
}

const service = { build }

export default service
