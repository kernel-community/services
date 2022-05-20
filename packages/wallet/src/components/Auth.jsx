/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtService, rpcClient } from '@kernel/common'

const AUTH_MESSAGE_TYPE = 'kernel.auth'
const SESSION_TTL = {
  short: 20 * 60 * 1000, // 20min
  medium: 2 * 60 * 60 * 1000, // 2h
  long: 24 * 60 * 60 * 1000 // 1day
}

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const endpoint = process.env[`REACT_APP_AUTH_ENDPOINT_${env}`]

const now = () => Date.now()
const tokenExp = (ttl) => now() + ttl

const authClient = async (jwtFn) =>
  rpcClient.build({ rpcEndpoint: endpoint, jwtFn })

const WALLET_STORE_VERSION = '1'

const storeItem = (k, v) => localStorage.setItem(k, v)
const getItem = (k) => localStorage.getItem(k)
const getObject = (k) => JSON.parse(getItem(k))
const loadWallet = () => {
  const wallet = getObject('wallet')
  if (wallet.version !== WALLET_STORE_VERSION) {
    throw new Error('unsupported wallet')
  }
  return wallet
}

const message = (event, payload) => { return { type: AUTH_MESSAGE_TYPE, event, payload } }
const reply = (source, target, event, payload) => source.postMessage(message(event, payload), target)

const Auth = () => {
  const navigate = useNavigate()

  const [encryptedWallet, setEncryptedWallet] = useState()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [session, setSession] = useState(SESSION_TTL.short)
  const [errorMessage, setErrorMessage] = useState('')
  const [persist, setPersist] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      const { nickname: storedNickname, address: storedAddress, encryptedWallet: storedWallet } = loadWallet()
      setNickname(storedNickname)
      setAddress(storedAddress)
      setEncryptedWallet(storedWallet)
    } catch (error) {
      console.log(error)
      return navigate('/register')
    }
  }, [navigate, nickname, address, encryptedWallet])

  const [source, setSource] = useState(null)
  const [website, setWebsite] = useState('')

  const handleMessage = (messageEvent) => {
    const { data: { type, event }, source, origin } = messageEvent
    if (!type || type !== AUTH_MESSAGE_TYPE) {
      return
    }
    setSource(source)
    setWebsite(origin)
    switch (event) {
      case 'ping':
        reply(source, origin, 'pong', {})
        break
      case 'pong':
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    // pass token from local storage
    try {
      const authToken = getItem('jwt')
      const { payload: { exp } } = authToken ? jwtService.decode(authToken) : { payload: { exp: 0 } }
      console.log('jwt exp', exp)
      if (exp < (now() + SESSION_TTL.short)) {
        return localStorage.removeItem('jwt')
      }
      if (source && website) {
        return reply(source, website, 'jwt', authToken)
      }
    } catch (error) {
      console.log(error)
      setErrorMessage(error.message)
      localStorage.removeItem('jwt')
    }
  }, [source, website])

  const createToken = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nickname.length || !password.length || !encryptedWallet.length) {
      setErrorMessage('Nickname, wallet or password cannot be empty.')
      console.log('empty nickname, wallet or password')
      return false
    }
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password, (i) => setProgress(Math.round(i * 100)))

      console.log(session)
      const exp = tokenExp(session)
      console.log(exp, session)
      const authJwt = jwtService.clientPayload({ iss: wallet.address, nickname, exp })
      const jwt = await jwtService.createJwt(wallet, jwtService.CLIENT_JWT, authJwt)
      const client = await authClient(() => '')

      const authToken = await client.call({ method: 'authService.accessToken', params: [jwt] })
      if (persist) {
        storeItem('jwt', authToken)
      }
      if (source) {
        reply(source, website, 'jwt', authToken)
      }
    } catch (error) {
      setProgress(0)
      setErrorMessage(error.message)
      console.error(error)
    }
  }

  return (
    <div className='rounded-t mb-0 px-6 py-6'>
      <div className='btn-wrapper text-center' />
      <hr className='mt-6 border-b-1 border-gray-400' />
      <div className='text-center mb-3'>
        <h6 className='text-gray-600 text-sm font-bold'>
          Authorize Website
        </h6>
        <p>{website}</p>
      </div>
      <form onSubmit={createToken}>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Nickname
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {nickname}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Address
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {address}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
            Session Timeout
          </label>
          <div>
            <select
              value={session} onChange={(e) => setSession(parseInt(e.target.value))}
              className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'
            >
              <option value={SESSION_TTL.short}>Short (20min)</option>
              <option value={SESSION_TTL.medium}>Medium (2h)</option>
              <option value={SESSION_TTL.long}>Long (1d)</option>
            </select>
          </div>
        </div>
        <div className='relative w-full mb-3'>
          <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
            Auto Authorize future requests
          </label>
          <div className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            <input className='px-4' id='persist' type='checkbox' value={persist} onChange={(e) => setPersist(e.target.value)} />
            <label className='px-4' htmlFor='persist'>This device is secure</label>
          </div>
        </div>
        <div className='relative w-full mb-3'>
          <label className='block uppercase text-gray-700 text-xs font-bold mb-2'>
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
            disabled={progress > 0}
            style={{ transition: 'all .15s ease' }}
            value='Sign'
          />
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Decrypting Wallet Progress
          </label>
          <div className='w-full bg-gray-200 h-1'>
            <div className='bg-blue-600 h-1' style={{ width: `${progress}%` }} />
          </div>
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

export default Auth
