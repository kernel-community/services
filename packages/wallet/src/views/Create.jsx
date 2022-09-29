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

import Page from 'components/Page'
import Fingerprints from 'components/Fingerprints'

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const endpoint = process.env[`REACT_APP_AUTH_ENDPOINT_${env}`]

const WALLET_STORE_VERSION = '1'
const SUCCESS_TO = '/portal'

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
    if (!nickname.length) {
      setErrorMessage('Please choose a nickname.')
      return false
    }
    if (!password.length) {
      setErrorMessage('Please choose a password.')
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
      await client.call({ method: 'authService.accessToken', params: [jwt, true] })
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    }
  }

  return (
    <Page>
      <Fingerprints />
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
            Kernel Wallet
          </div>
          <hr />
        </div>
      </div>
      <div className='w-2/3 mx-auto'>
        <div className='m-8 sm:mx-24 xl:mx-48'>
          <form className='' onSubmit={createWallet}>
            <div className='relative w-full m-8'>
              <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
                1. Nickname
              </label>
              <input
                type='text'
                className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
                placeholder='Nickname'
                style={{ transition: 'all .15s ease' }}
                onChange={(e) => setNickname(e.target.value)}
                value={nickname}
              />
              <p className='mt-4'>TIP: Choose a memorable Nickname for your Wallet.</p>
            </div>
            <div className='relative w-full m-8'>
              <label
                className='block uppercase text-gray-700 text-xs font-bold mb-2'
                htmlFor='grid-password'
              >
                2. Password
              </label>
              <input
                type='password'
                className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
                placeholder='Password'
                style={{ transition: 'all .15s ease' }}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <p className='mt-4'>TIP: Use a Password Manager to generate and store a strong password.</p>
            </div>
            <div className='relative w-full text-center m-8'>
              {errorMessage &&
                <p className='border-0 px-3 py-3 placeholder-gray-400 text-red-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
                  {errorMessage}
                </p>}
            </div>
            <div className='realtive w-full text-center m-8'>
              <input
                className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                type='submit'
                style={{ transition: 'all .15s ease' }}
                value='Generate Keys'
              />
              <p className='mt-4' />
            </div>
            <div className={progress > 0 ? '' : 'hidden'}>
              <div className='relative w-full m-8'>
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
            </div>
            <div className={progress >= 100 ? '' : 'hidden'}>
              <div className='relative w-full m-8'>
                <label
                  className='block uppercase text-gray-700 text-xs font-bold mb-2'
                  htmlFor='grid-password'
                >
                  3. Wallet Address
                </label>
                <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
                  {address}
                </p>
                <p className='mt-4'>TIP: This is your public key and you can share it with anyone you would like.</p>
              </div>
              <div className='relative w-full m-8'>
                <label
                  className='block uppercase text-gray-700 text-xs font-bold mb-2'
                  htmlFor='grid-password'
                >
                  4. Seed Phrase
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
                <p className='mt-4'>TIP: This is your private key and you should write it down somewhere save.</p>
              </div>
              <div className='relative w-full m-8'>
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
                <p className='mt-4'>TIP: Download your encrypted Wallet and store it in your Dropbox.</p>
              </div>
              <div className='relative w-full m-8'>
                <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
                  Encrypted Wallet
                </label>
                <a
                  href={`mailto:?subject=Kernel Wallet&body=${encryptedData}`}
                >
                  <div
                    className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full text-center'
                  >
                    Email
                  </div>
                </a>
                <p className='mt-4'>TIP: Email your encrypted Wallet to yourself.</p>
              </div>
              <div className='text-center m-8'>
                <Link
                  className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
                  style={{ transition: 'all .15s ease' }}
                  to={SUCCESS_TO}
                >
                  Login to your new Wallet
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default Create
