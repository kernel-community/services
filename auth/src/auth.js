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

const header = { alg: 'ES256K', typ: 'JWT' }
const domain = {
  name: 'Kernel',
  version: '1'
}
const typesJWT = {
  JWT: [
    { name: 'iss', type: 'string' },
    { name: 'aud', type: 'string' },
    { name: 'iat', type: 'string' },
    { name: 'exp', type: 'string' },
    { name: 'nickname', type: 'string' }
  ]
}
const typesJWK = {
  JWT: [
    { name: 'kty', type: 'string' },
    { name: 'crv', type: 'string' },
    { name: 'address', type: 'string' }
  ]
}

const randomSeed = (length = 32) => crypto.randomBytes(length)
const wallet = (seed) =>
  ethers.Wallet.fromMnemonic(ethers.utils.entropyToMnemonic(seed))
const toBuffer = (hexData) => Buffer.from(ethers.utils.arrayify(hexData))
const toBase64Url = (buf) => buf.toString('base64url')
const jwtify = (obj) => toBase64Url(Buffer.from(JSON.stringify(obj)))
const encode = ({ header, payload, signature }) =>
  `${jwtify({ header })}.${jwtify({ payload })}.${jwtify({ signature })}`
const decode = (jwt) => jwt.split('.')
    .map((e) => Buffer.from(e, 'base64url').toString())
    .map((e) => JSON.parse(e))
    .reduce((acc, e) => {
      acc[Object.keys(e)[0]] = Object.values(e)[0];
      return acc;
    }, {})

const SignatureError = () => {} 

const build = async ({ encryptedWallet, password } = {}) => {

  const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password)

  const walletJWK = await (async () => {
    const payload = {
      kty: 'ES256K', crv: 'secp256k1', address: wallet.address
    }
    const signature = await wallet._signedTypedData(domain, typesJWK, payload)
      .then((e) => toBase64Url(toBuffer(e)))
    return encode({ header, payload, signature })
  })()

  const verify = (payload, signature) =>
    ethers.utils.verifyTypedData(domain, typesJWT, payload, signature) == payload.iss
  const publicKey = async () => walletJWK 
  const register = async (jwt) => {


  }
  const accessToken = async (jwt) => {
    const { header, payload, signature } = decode(jwt)
    if (!verify(payload, signature)) {
      throw new SignatureError() 
    }


  }

  return { verify, register }

}

const auth = {
  build
}

export default auth
