/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'
import { ethers } from 'ethers'
import jwtService from './jwt.js'

const header = jwtService.HEADER

const build = async ({ seed, entityClient }) => {

  const members = entityClient({ entity: 'member', uri: 'members' })
  const wallets = entityClient({ entity: 'wallet', uri: 'wallets' })

  const provider = jwtService.defaultProvider()
  const wallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), provider)

  const walletJWK = await (async () => {
    const payload = {
      kty: 'ES256K', crv: 'secp256k1', iss: wallet.address
    }
    return jwtService.createJwt(wallet, jwtService.JWK, payload)
  })()

  const publicKey = async () => walletJWK 
  const register = async (jwt) => {
    const { header, payload, signature } = jwtService.decode(jwt)
    if (!jwtService.verify(jwtService.CLIENT_JWT, payload, signature)) {
      throw new jwtService.SignatureError()
    }
    const { iss, nickname } = payload
    if (!iss || !nickname) {
      throw new Error('malformed jwt')
    }
    const exists = await wallets.exists(iss)
    if (exists) {
      throw new Error('already registered')
    }
    const { id: member_id, roles } = await members.create({ wallet: iss, roles: ['applicant'] })
    await wallets.create({ member_id, nickname }, { id: iss, steward: member_id })

    // create JWT AUTH TOKEN
    const authPayload = jwtService.authPayload({ iss, nickname, roles })
    return jwtService.createJwt(wallet, jwtService.AUTH_JWT, authPayload)
  }

  const accessToken = async (jwt) => {
    const { header, payload, signature } = jwtService.decode(jwt)
    if (!jwtService.verify(jwtService.CLIENT_JWT, payload, signature)) {
      throw new jwtService.SignatureError()
    }
    const { iss, nickname } = payload
    const { member_id } = await wallets.get(iss)
    if (!member_id) {
      throw new Error('does not exist')
    }
    const { roles } = await members.get(member_id)

    // create JWT AUTH TOKEN
    const authPayload = jwtService.authPayload({ iss, nickname, roles })
    return jwtService.createJwt(wallet, jwtService.AUTH_JWT, authPayload)
  }

  return { publicKey, register, accessToken, wallet }
}

const auth = {
  build
}

export default auth
