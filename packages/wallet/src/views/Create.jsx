/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useState, useReducer } from 'react'
import { Link } from 'react-router-dom'

import { jwtService, rpcClient } from '@kernel/common'

import Page from 'components/Page'
import Fingerprints from 'components/Fingerprints'

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const endpoint = process.env[`REACT_APP_AUTH_ENDPOINT_${env}`]

const WALLET_STORE_VERSION = '1'
const SUCCESS_TO = '/portal'

const INITIAL_STATE = {
  step: 0
}

const actions = {}

Object.keys(INITIAL_STATE)
  .forEach((key) => {
    actions[key] = (state, value) => Object.assign({}, state, { [key]: value })
  })

const reducer = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

const authClient = async (jwtFn) =>
  rpcClient.build({ rpcEndpoint: endpoint, jwtFn })
const serialize = (nickname, address, encryptedWallet) =>
  JSON.stringify({ version: WALLET_STORE_VERSION, nickname, address, encryptedWallet })

const storeWallet = (nickname, address, encryptedWallet) =>
  localStorage.setItem('wallet', serialize(nickname, address, encryptedWallet))

const createUrl = (data) => URL.createObjectURL(new Blob([data], { type: 'application/json' }))

const hidden = (state, i) => state.step !== i ? 'hidden' : ''

const Create = () => {
  // TODO: move to reduce
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [address, setAddress] = useState('')
  const [encryptedData, setEncryptedData] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [progress, setProgress] = useState(0)

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const forward = () => dispatch({ type: 'step', payload: state.step + 1 })
  const backward = () => dispatch({ type: 'step', payload: state.step - 1 })
  const isHidden = hidden.bind(null, state)

  global.state = state
  global.forward = forward
  global.backward = backward

  const createWallet = async (e) => {
    e.preventDefault()

    setErrorMessage(null)
    // TODO: support multiple wallets?
    if (!nickname.length) {
      setErrorMessage('Please choose a nickname.')
      return false
    }
    if (!password.length) {
      setErrorMessage('Please choose a password.')
      return false
    }
    try {
      forward()
      let wallet = ethers.Wallet.createRandom()
      const encryptedWallet = await wallet.encrypt(password, (i) => setProgress(Math.round(i * 0.95 * 100)))

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

      setProgress(100)

      // react hasn't dispatched the previous update, so increment by 2
      dispatch({ type: 'step', payload: state.step + 2 })
      return true
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
            <div className={isHidden(0)}>
              <div className='relative w-full m-8'>
                <label className='block uppercase text-gray-700 text-xm font-bold mb-2'>
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
                  className='block uppercase text-gray-700 text-xm font-bold mb-2'
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
                  className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-2/3'
                  type='submit'
                  style={{ transition: 'all .15s ease' }}
                  value='Generate Keys'
                />
                <p className='mt-4' />
              </div>
            </div>
            <div className={isHidden(1)}>
              <div className='relative w-full m-8'>
                <label
                  className='block uppercase text-gray-700 text-xm font-bold mb-2'
                  htmlFor='grid-password'
                >
                  Encryption Progress
                </label>
                <div className='w-full bg-gray-200 h-1'>
                  <div className='bg-blue-600 h-1' style={{ width: `${progress}%` }} />
                </div>
                <p className='mt-4'><b>INFO:</b> This is storing your new Wallet on this device in a secure manner without installing any additional software or extension.</p>
              </div>
            </div>
            <div className={isHidden(2)}>
              <div className='relative w-full m-8'>
                <label
                  className='block uppercase text-gray-700 text-xm font-bold mb-2'
                  htmlFor='grid-password'
                >
                  3. Wallet Address
                </label>
                <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
                  {address}
                </p>
                <p className='mt-4'><b>TIP:</b> This is your address and you can share it with anyone you would like.</p>
              </div>
              <div className='relative w-full m-8 hidden'>
                <label
                  className='block uppercase text-gray-700 text-xm font-bold mb-2'
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
                <p className='mt-4'><b>TIP:</b> This is private information and you should never share it with anyone.</p>
              </div>
              <div className='relative w-full m-8'>
                <label className='block uppercase text-gray-700 text-xm font-bold mb-2'>
                  4. Backup The Keys To Your New Wallet
                </label>
                <a
                  download={`${address}-wallet.json`}
                  href={createUrl(encryptedData)}
                  onClick={(e) => forward()}
                >
                  <div
                    className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full text-center'
                  >
                    Backup
                  </div>
                </a>
                <p className='mt-4'><b>TIP:</b> The backup is securely encrypted and you can store it in the cloud.</p>
              </div>
              <div className='hidden relative w-2/3 m-8'>
                <a
                  href={`mailto:?subject=Kernel Wallet&body=${encryptedData}`}
                >
                  <div
                    className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full text-center'
                  >
                    Email
                  </div>
                </a>
                <p className='mt-4'><b>TIP:</b> Email your encrypted Wallet to yourself.</p>
              </div>
            </div>
            <div className={isHidden(3)}>
              <div className='relative w-full m-8'>
                <label className='block uppercase text-gray-700 text-xm font-bold mb-2'>
                  5. Login
                </label>
                <Link
                  className=''
                  style={{ transition: 'all .15s ease' }}
                  to={SUCCESS_TO}
                >
                  <div
                    className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full text-center'
                  >
                    Login to your new Wallet
                  </div>
                </Link>
                <p className='mt-4'><b>TIP:</b> You are all set, no need to install anything to use your Wallet right away.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default Create
