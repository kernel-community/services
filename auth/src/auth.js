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

const build = async ({ seed = jwtService.randomSeed(), infuraKey, encryptedWallet, password } = {}) => {

  //const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password)
  const provider = jwtService.defaultProvider()
  const wallet = await jwtService.walletFromSeed(seed, provider)

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

  }

  const accessToken = async (jwt) => {
    const { header, payload, signature } = jwtService.decode(jwt)
    if (!jwtService.verify(jwtService.CLIENT_JWT, payload, signature)) {
      throw new jwtService.SignatureError()
    }
    //TODO: fetch member
    const walletEntity = { member_id: '123' }
    const { roles } = { roles: ['fellow'] }

    // create JWT AUTH TOKEN
    const { iss, nickname } = payload
    const authPayload = jwtService.authPayload({ iss, nickname, roles })
    return jwtService.createJwt(wallet, jwtService.AUTH_JWT, authPayload)
  }

  return { publicKey, register, accessToken, wallet }
}

const auth = {
  build
}

export default auth
