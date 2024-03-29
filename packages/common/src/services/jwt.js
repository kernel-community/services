/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { Base64 } from 'js-base64'
import { ethers } from 'ethers'

const SESSION_TTL = {
  short: 20 * 60 * 1000, // 20min
  medium: 2 * 60 * 60 * 1000, // 2h
  long: 24 * 60 * 60 * 1000 // 1day
}
const AUD = 'kernel.community'
const HEADER = { alg: 'ES256K', typ: 'JWT' }
const DOMAIN = {
  name: 'Kernel',
  version: '1'
}
const CLIENT_JWT = {
  JWT: [
    { name: 'iss', type: 'address' },
    { name: 'aud', type: 'string' },
    { name: 'iat', type: 'uint256' },
    { name: 'exp', type: 'uint256' },
    { name: 'nickname', type: 'string' }
  ]
}
const AUTH_JWT = {
  JWT: [
    { name: 'iss', type: 'string' },
    { name: 'aud', type: 'string' },
    { name: 'iat', type: 'uint256' },
    { name: 'exp', type: 'uint256' },
    { name: 'nickname', type: 'string' },
    { name: 'roles', type: 'string[]' }
  ]
}
const JWK = {
  JWT: [
    { name: 'kty', type: 'string' },
    { name: 'crv', type: 'string' },
    { name: 'iss', type: 'address' }
  ]
}

const SignatureError = () => {}

const now = () => Date.now()
const tokenExp = (ttl = SESSION_TTL.short) => now() + ttl

const toBuffer = (hexData) => new Uint8Array(ethers.utils.arrayify(hexData))
const toBase64Url = (buf) => Base64.fromUint8Array(buf, true)
const fromBase64Url = (s) => Base64.toUint8Array(s)

const jwtify = (obj) => Base64.encodeURI(JSON.stringify(obj))
const encode = ({ header = HEADER, payload, signature }) =>
  `${jwtify({ header })}.${jwtify({ payload })}.${toBase64Url(toBuffer(signature))}`
const decode = (jwt) => {
  const parts = jwt.split('.')
    .map((e) => Base64.decode(e))
  const obj = parts
    .slice(0, 2)
    .map((e) => JSON.parse(e.toString()))
    .reduce((acc, e) => {
      acc[Object.keys(e)[0]] = Object.values(e)[0]
      return acc
    }, {})
  return Object.assign(obj, { signature: parts[2] })
}

const defaultProvider = () => new ethers.providers.CloudflareProvider()
const walletFromSeed = (seed, provider) =>
  ethers.Wallet.fromMnemonic(ethers.utils.entropyToMnemonic(seed))

const verify = (type, payload, address, signature) =>
  ethers.utils.verifyTypedData(DOMAIN, type, payload, signature) === address

const sign = (wallet, domain, type, payload) => wallet._signTypedData(domain, type, payload)

const createJwt = (wallet, type, payload) =>
  wallet._signTypedData(DOMAIN, type, payload)
    .then((signature) => encode({ payload, signature }))

const authPayload = ({
  iss, aud = AUD, iat = now(),
  exp = tokenExp(), nickname, roles
}) => {
  return { iss, aud, iat, exp, nickname, roles }
}

const clientPayload = ({
  iss, aud = AUD, iat = now(),
  exp = tokenExp(), nickname
}) => {
  return { iss, aud, iat, exp, nickname }
}

const jwt = {
  HEADER,
  DOMAIN,
  CLIENT_JWT,
  AUTH_JWT,
  JWK,
  SESSION_TTL,
  SignatureError,
  defaultProvider,
  walletFromSeed,
  toBuffer,
  toBase64Url,
  fromBase64Url,
  jwtify,
  encode,
  decode,
  verify,
  sign,
  createJwt,
  authPayload,
  clientPayload,
  tokenExp
}

export default jwt
