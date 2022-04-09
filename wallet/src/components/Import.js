/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { jwtService, rpcClient } from '@kernel/common'

const endpoint = process.env.REACT_APP_AUTH_ENDPOINT

const WALLET_STORE_VERSION = '1'
const SUCCESS_TO = '/assets'

const authClient = async (jwtFn) =>
  rpcClient.build({ rpcEndpoint: endpoint, jwtFn })
const storeWallet = (nickname, address, encryptedWallet) =>
  localStorage.setItem('wallet',
    JSON.stringify({ version: WALLET_STORE_VERSION, nickname, address, encryptedWallet }))

const Import = () => {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState('')
  const [encryptedData, setEncryptedData] = useState('')
  const [progress, setProgress] = useState(0)

  const importWallet = async (e) => {
    e.preventDefault()
    // TODO: support multiple wallets?
    // TODO: visual feedback
    if (!mnemonic.length || !nickname.length || !password.length) {
      console.log('empty seed, nickname, or password')
      return false
    }
    try {
      let wallet = ethers.Wallet.fromMnemonic(mnemonic)
      const encryptedWallet = await wallet.encrypt(password, (i) => setProgress(Math.round(i * 100)))

      const authJwt = jwtService.clientPayload({ iss: wallet.address, nickname })
      const jwt = await jwtService.createJwt(wallet, jwtService.CLIENT_JWT, authJwt)
      const client = await authClient(() => '')

      storeWallet(nickname, wallet.address, encryptedWallet)
      setMnemonic(wallet.mnemonic.phrase)
      setAddress(wallet.address)

      // trigger gc
      wallet = null

      //TODO: retry?
      const authToken = await client.call({ method: 'authService.register', params: [jwt] })
    } catch (error) {
      console.error(error)
    }
  }

  const readFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.addEventListener('load', event => setEncryptedData(event.target.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
      <div className="btn-wrapper text-center">
      </div>
      <hr className="mt-6 border-b-1 border-gray-400" />
      <div className="text-center mb-3">
        <h6 className="text-gray-600 text-sm font-bold">
          Import a Wallet
        </h6>
      </div>
      <form onSubmit={importWallet}>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
          >
            Encrypted Wallet
          </label>
          <input
            type="file"
            accept=".json"
            onChange={ (e) => readFile(e) }
            />
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Nickname 
          </label>
          <input
            type="text"
            className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
            placeholder="Nickname"
            style={{ transition: "all .15s ease" }}
            onChange={(e) => setNickname(e.target.value)}
            value={ nickname }
          />
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password"
          >
            Password
          </label>
          <input
            type="password"
            className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
            placeholder="Password"
            style={{ transition: "all .15s ease" }}
            onChange={(e) => setPassword(e.target.value)}
            value={ password }
          />
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
            Encryption Progress 
          </label>
          <div className="w-full bg-gray-200 h-1">
            <div className="bg-blue-600 h-1" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-password">
            Wallet Address 
          </label>
          <p className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full">
            { address }
          </p>
        </div>
        <div className="text-center mt-6">
          <Link
            className="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
            style={{ transition: "all .15s ease" }}
            to={ SUCCESS_TO } >
            Go to Wallet 
          </Link>
        </div>
      </form>
      <div className="text-gray-500 text-center mb-3 font-bold">
      </div>
    </div>)
}

export default Import
