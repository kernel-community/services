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

import entityBuilder from './entity.js'
import rpcClientBuilder from './rpcClient.js'

const KERNEL_AUD = 'kernel.community'

const header = jwtService.HEADER
const now = () => Date.now()

const build = async ({ seed, rpcEndpoint }) => {

  const provider = jwtService.defaultProvider()
  const wallet =
    await jwtService.walletFromSeed(jwtService.fromBase64Url(seed), provider)

  //TODO: cache
  const jwtFn = () => jwtService.createJwt(wallet, jwtService.AUTH_JWT,
    jwtService.authPayload({ iss: wallet.address, nickname: 'apiServer', roles: ['api'] }))

  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn })
  const entityClient = entityBuilder.build.bind(null, { rpcClient })

  const members = await entityClient({ resource: 'member', uri: 'members' })
  const wallets = await entityClient({ resource: 'wallet', uri: 'wallets' })

  const walletJWK = await (async () => {
    const payload = {
      kty: 'ES256K', crv: 'secp256k1', iss: wallet.address
    }
    return jwtService.createJwt(wallet, jwtService.JWK, payload)
  })()

  // ensure api server is registered
  const authMember = async () => {
    const iss = wallet.address
    const nickname = 'auth server'
    const exists = await wallets.exists(iss)
    if (exists) { return }

    const { id: member_id, data: { roles } } = await members.create({ wallet: iss, roles: ['api'] })
    const registered = await wallets.create({ member_id, nickname }, { id: iss, owner: member_id })
  }
  setTimeout(authMember, 2000)

  const publicKey = async () => walletJWK

  // TODO: extract
  const decodeJwt = (jwt) => {
    console.debug(jwt)
    const { header, payload, signature } = jwtService.decode(jwt)
    console.debug(header, payload, signature)
    if (!jwtService.verify(jwtService.CLIENT_JWT, payload, payload.iss, signature)) {
      console.debug('jwt signature error')
      throw new jwtService.SignatureError()
    }
    const { iss, nickname, iat, exp, aud } = payload
    if (!iss || !nickname || !iat || !exp || !aud) {
      throw new Error('malformed jwt')
    }
    if (!aud.startsWith(KERNEL_AUD) || aud.length != KERNEL_AUD.length) {
      throw new Error('jwt scope')
    }
    if (iat >= exp || now() >= exp) {
      throw new Error('jwt time')
    }
    return { header, payload, signature }
  }

  const register = async (jwt) => {
    const { header, payload: { iss, nickname }, signature } = decodeJwt(jwt)

    const exists = await wallets.exists(iss)
    if (exists) {
      throw new Error('already registered')
    }
    //TODO: change member owner to API
    const { id: member_id, data: { roles } } = await members.create({ wallet: iss, roles: ['applicant'] })
    const registered = await wallets.create({ member_id, nickname }, { id: iss, owner: member_id })

    const authPayload = jwtService.authPayload({ iss, nickname, roles })
    return jwtService.createJwt(wallet, jwtService.AUTH_JWT, authPayload)
  }

  const accessToken = async (jwt) => {
    const { header, payload: { iss, nickname }, signature } = decodeJwt(jwt)

    const { data: { member_id } } = await wallets.get(iss)
    if (!member_id) {
      throw new Error('does not exist')
    }
    const { data: { roles } } = await members.get(member_id)

    const authPayload = jwtService.authPayload({ iss: member_id, nickname, roles })
    console.debug(authPayload)
    return jwtService.createJwt(wallet, jwtService.AUTH_JWT, authPayload)
  }

  return { publicKey, register, accessToken, jwtFn, wallet }
}

const auth = {
  build
}

export default auth
