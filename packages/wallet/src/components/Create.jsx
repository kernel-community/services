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

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const endpoint = process.env[`REACT_APP_AUTH_ENDPOINT_${env}`]

const WALLET_STORE_VERSION = '1'
const SUCCESS_TO = '/home'

const authClient = async (jwtFn) =>
  rpcClient.build({ rpcEndpoint: endpoint, jwtFn })
const serialize = (nickname, address, encryptedWallet) =>
  JSON.stringify({ version: WALLET_STORE_VERSION, nickname, address, encryptedWallet })

const storeWallet = (nickname, address, encryptedWallet) =>
  localStorage.setItem('wallet', serialize(nickname, address, encryptedWallet))

const createUrl = (data) => URL.createObjectURL(new Blob([data], { type: 'application/json' }))

const Create = () => {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState('')
  const [encryptedData, setEncryptedData] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [progress, setProgress] = useState(0)

  const createWallet = async (e) => {
    e.preventDefault()

    setErrorMessage(null)
    // TODO: support multiple wallets?
    // TODO: visual feedback
    if (!nickname.length || !password.length) {
      console.log('empty nickname or password')
      setErrorMessage('empty nickname or password')
      return false
    }
    try {
      let wallet = ethers.Wallet.createRandom()
      const encryptedWallet = await wallet.encrypt(password, (i) => setProgress(Math.round(i * 100)))

      const authJwt = jwtService.clientPayload({ iss: wallet.address, nickname })
      const jwt = await jwtService.createJwt(wallet, jwtService.CLIENT_JWT, authJwt)
      const client = await authClient(() => '')

      storeWallet(nickname, wallet.address, encryptedWallet)
      setMnemonic(wallet.mnemonic.phrase)
      setAddress(wallet.address)
      setEncryptedData(serialize(nickname, wallet.address, encryptedWallet))

      // trigger gc
      wallet = null

      // TODO: retry?
      await client.call({ method: 'authService.register', params: [jwt] })
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <div className='rounded-t mb-0 px-6 py-6'>
      <div className='btn-wrapper text-center' />
      <hr className='mt-6 border-b-1 border-gray-400' />
      <div className='text-center mb-3'>
        <h6 className='text-gray-600 text-sm font-bold'>
          Create a Wallet
        </h6>
      </div>
      <form onSubmit={createWallet}>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
            htmlFor='grid-password'
          >
            Nickname
          </label>
          <input
            type='text'
            className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
            placeholder='Nickname'
            style={{ transition: 'all .15s ease' }}
            onChange={(e) => setNickname(e.target.value)}
            value={nickname}
          />
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
            htmlFor='grid-password'
          >
            Password
          </label>
          <input
            type='password'
            className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
            placeholder='Password'
            style={{ transition: 'all .15s ease' }}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className='text-center mt-6'>
          <input
            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
            type='submit'
            style={{ transition: 'all .15s ease' }}
            value='OK'
          />
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
            htmlFor='grid-password'
          >
            Encryption Progress
          </label>
          <div className='w-full bg-gray-200 h-1'>
            <div className='bg-blue-600 h-1' style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
            htmlFor='grid-password'
          >
            Wallet Address
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {address}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
            htmlFor='grid-password'
          >
            Seed Phrase
          </label>
          <textarea
            type='text'
            className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
            placeholder='Seed phrase'
            readOnly
            style={{ transition: 'all .15s ease' }}
            onChange={(e) => setMnemonic(e.target.value)}
            value={mnemonic}
          />
        </div>
        <div className='relative w-full mb-3'>
          <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
            Encrypted Wallet
          </label>
          <a
            download={`${address}-wallet.json`}
            href={createUrl(encryptedData)}
          >
            <div
              className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full text-center'
            >
              Download
            </div>
          </a>
        </div>
        <div className='text-center mt-6'>
          <Link
            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
            style={{ transition: 'all .15s ease' }}
            to={SUCCESS_TO}
          >
            Go to Wallet
          </Link>
        </div>
        <div className='text-center mt-6'>
          {errorMessage &&
            <p className='border-0 px-3 py-3 placeholder-gray-400 text-red-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
              {errorMessage}
            </p>}
        </div>
      </form>
    </div>
  )
}

export default Create
