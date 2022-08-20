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
import { useServices } from '@kernel/common'

import { provider, voidSigner, humanizeEther, humanizeGwei } from 'common'

const AUTH_MESSAGE_TYPE = 'kernel.auth'

const NONCE_PADDING = 12
const CHAINID_PADDING = 12
const HEIGHT_PADDING = 12
const INDEX_PADDING = 6

const WALLET_STORE_VERSION = '1'

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

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || !user.role) {
      return navigate('/auth')
    }
  }, [navigate, user])

  const [encryptedWallet, setEncryptedWallet] = useState()
  const [nickname, setNickname] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      const { nickname: storedNickname, address: storedAddress, encryptedWallet: storedWallet } = loadWallet()
      setNickname(storedNickname)
      setEncryptedWallet(storedWallet)
      setAddress(storedAddress)
    } catch (error) {
      console.log(error)
      return navigate('/register')
    }
  }, [navigate, nickname, encryptedWallet])

  const [source, setSource] = useState(null)
  const [website, setWebsite] = useState('')
  const [transactionRequest, setTransactionRequest] = useState({})
  const [transactions, setTransactions] = useState(null)

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const transactions = await entityFactory({ resource: 'transaction' })
      setTransactions(transactions)
      window.transactions = transactions
    })()
  }, [services])

  const handleMessage = (messageEvent) => {
    const { data: { type, event, payload }, source, origin } = messageEvent
    if (!type || type !== AUTH_MESSAGE_TYPE) {
      return
    }
    console.log(event, payload)
    setSource(source)
    setWebsite(origin)
    switch (event) {
      case 'ping':
        reply(source, origin, 'pong', {})
        break
      case 'pong':
        break
      case 'transactionRequest':
        setTransactionRequest(payload)
        break
      default:
        break
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    console.log(transactionRequest)
  }, [transactionRequest])

  const populateTransaction = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!nickname.length || !address.length || !encryptedWallet.length || !transactionRequest.chainId) {
      setErrorMessage('Nickname, wallet, or password cannot be empty.')
      console.log('empty nickname, wallet, or password')
      return false
    }
    try {
      const wallet = voidSigner(address, provider(transactionRequest.chainId))

      console.log(wallet)

      const populatedTransaction = await wallet.populateTransaction(transactionRequest)
      console.log(populatedTransaction)
      window.populatedTransaction = populatedTransaction
      setTransactionRequest(populatedTransaction)
    } catch (error) {
      setErrorMessage(error.message)
      console.error(error)
    }
  }

  const sendTransaction = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setProgress(0)

    if (!password.length || !encryptedWallet.length) {
      setErrorMessage('Wallet, or password cannot be empty.')
      console.log('empty wallet, or password')
      return false
    }
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password, (i) => setProgress(Math.round(i * 100)))
        .then((wallet) => wallet.connect(provider(transactionRequest.chainId)))
        .catch(error => console.log(error))
      setStatusMessage('Sending transaction...')
      const transaction = await wallet.sendTransaction(transactionRequest)
      setStatusMessage('Waiting for confirmation...')
      const receipt = await transaction.wait()
      console.log(receipt)
      // save transaction

      const { nonce, chainId, value } = transactionRequest
      Object.assign(receipt, { nonce, chainId, value })
      const { to, from, blockNumber, transactionIndex } = receipt
      const paddedHeight = blockNumber.toString().padStart(HEIGHT_PADDING, '0')
      const paddedIndex = transactionIndex.toString().padStart(INDEX_PADDING, '0')
      const paddedNonce = nonce.toString().padStart(NONCE_PADDING, '0')
      const paddedChainId = chainId.toString().padStart(CHAINID_PADDING, '0')

      const fromId = `from/${from}/${paddedChainId}-${paddedNonce}`
      const toId = `to/${to}/${paddedChainId}-${paddedHeight}-${paddedIndex}`

      await transactions.create({ ...receipt, id: toId }, { id: toId })
      const savedTx = await transactions.create({ ...receipt, id: fromId }, { id: fromId })

      if (source) {
        console.log('sending transaction')
        reply(source, website, 'transaction', savedTx)
      }
    } catch (error) {
      setProgress(0)
      setErrorMessage(error.message)
      console.error(error)
    }
  }

  const cancelTransaction = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setProgress(0)
    if (source) {
      console.log('canceling transaction')
      reply(source, website, 'transaction', {})
    }
  }

  return (
    <div className='rounded-t mb-0 px-6 py-6'>
      <div className='btn-wrapper text-center' />
      <hr className='mt-6 border-b-1 border-gray-400' />
      <div className='text-center mb-3'>
        <h6 className='text-gray-600 text-sm font-bold'>
          Send Transaction
        </h6>
        <p>{website}</p>
      </div>
      <form onSubmit={populateTransaction}>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            From Address
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.from}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            To Address
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.to}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Nonce
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.nonce}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Data
          </label>
          <p className='break-all border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.data}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Value (ETH)
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {humanizeEther(transactionRequest.value)}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Gas Limit (GWEI)
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {humanizeGwei(transactionRequest.gasLimit)}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Max Fee Per Gas (GWEI)
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {humanizeGwei(transactionRequest.maxFeePerGas)}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Max Priority Fee Per Gas (GWEI)
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {humanizeGwei(transactionRequest.maxPriorityFeePerGas)}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Chain Id
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.chainId}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Type
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.type}
          </p>
        </div>
        <div className='relative w-full mb-3'>
          <label
            className='block uppercase text-gray-700 text-xs font-bold mb-2'
          >
            Access List
          </label>
          <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
            {transactionRequest.accessList}
          </p>
        </div>
        <div className='text-center mt-6'>
          <input
            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
            type='submit'
            disabled={progress > 0}
            style={{ transition: 'all .15s ease' }}
            value='Populate'
          />
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
          {statusMessage &&
            <p className='border-0 px-3 py-3 placeholder-gray-400 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
              {statusMessage}
            </p>}
        </div>
        <div className='text-center mt-6'>
          {errorMessage &&
            <p className='border-0 px-3 py-3 placeholder-gray-400 text-red-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full'>
              {errorMessage}
            </p>}
        </div>
        <div className='text-center mt-6'>
          <button
            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
            onClick={sendTransaction}
            style={{ transition: 'all .15s ease' }}
          >Send
          </button>
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
          <button
            className='bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full'
            onClick={cancelTransaction}
            style={{ transition: 'all .15s ease' }}
          >Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default Auth
