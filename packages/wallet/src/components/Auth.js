/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { jwtService, rpcClient } from '@kernel/common'

const AUTH_MESSAGE_TYPE = 'kernel.auth'

const endpoint = process.env.REACT_APP_AUTH_ENDPOINT

const authClient = async (jwtFn) =>
  rpcClient.build({ rpcEndpoint: endpoint, jwtFn })

const WALLET_STORE_VERSION = '1'

const getItem = (k) => JSON.parse(localStorage.getItem(k))
const loadWallet = () => {
  const wallet = getItem('wallet')
  if (wallet.version !== WALLET_STORE_VERSION) {
    throw new Error('unsupported wallet')
  }
  return wallet
}

const message = (event, payload) => { return {type: AUTH_MESSAGE_TYPE, event, payload} }
const reply = (source, target, event, payload) => source.postMessage(message(event, payload), target)

const Auth = () => {
  const {nickname: storedNickname, address: storedAddress, encryptedWallet } = loadWallet()

  const [nickname, setNickname] = useState(storedNickname)
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState(storedAddress)
  const [progress, setProgress] = useState(0)

  const [source, setSource] = useState(null)
  const [website, setWebsite] = useState('')


  const handleMessage = (messageEvent) => {
    console.log(messageEvent)
    const { data: {type, event, payload}, source, origin } = messageEvent
    if (!type || type !== AUTH_MESSAGE_TYPE) {
      return
    }
    setSource(source)
    setWebsite(origin)
    switch (event) {
      case 'ping':
        reply(source, origin, 'pong', {})
        break;
      case 'pong':
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
  }, [])

  const createToken = async (e) => {
    e.preventDefault()
    //const encryptedWallet = getItem('wallet')

    // TODO: visual feedback
    if (!nickname.length || !password.length || !encryptedWallet.length) {
      console.log('empty nickname, wallet or password')
      return false
    }
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password, (i) => setProgress(Math.round(i * 100)))

      const authJwt = jwtService.clientPayload({ iss: wallet.address, nickname })
      const jwt = await jwtService.createJwt(wallet, jwtService.CLIENT_JWT, authJwt)
      const client = await authClient(() => '')

      const authToken = await client.call({ method: 'authService.accessToken', params: [jwt] })
      if (source) {
        reply(source, website, 'jwt', authToken)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="rounded-t mb-0 px-6 py-6">
      <div className="btn-wrapper text-center">
      </div>
      <hr className="mt-6 border-b-1 border-gray-400" />
      <div className="text-center mb-3">
        <h6 className="text-gray-600 text-sm font-bold">
          Authorize Website 
        </h6>
        <p>{ website }</p>
      </div>
      <form onSubmit={createToken}>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password" >
            Nickname 
          </label>
          <p className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full">
            { nickname }
          </p>
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password" >
            Address 
          </label>
          <p className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full">
            { address }
          </p>
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password" >
            Password
          </label>
          <input
            type="password"
            className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
            placeholder="Password"
            style={{ transition: "all .15s ease" }}
            onChange={(e) => setPassword(e.target.value)}
            value={password} />
        </div>
        <div className="text-center mt-6">
          <input
            className="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
            type="submit"
            style={{ transition: "all .15s ease" }}
            value="OK" />
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password">
            Decrypting Wallet Progress 
          </label>
          <div className="w-full bg-gray-200 h-1">
            <div className="bg-blue-600 h-1" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </form>
  </div>
  )
}

export default Auth 

