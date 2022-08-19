/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ethers } from 'ethers'
import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, linesVector } from '@kernel/common'

import AppConfig from 'App.config'

import { loadWallet } from 'common'
import Page from 'components/Page'

const COMPILER_URL = 'https://binaries.soliditylang.org/bin/soljson-latest.js'
const RINKEBY_CHAIN_ID = 4
// const GOERLI_CHAIN_ID = 5
const ERC20_TEMPLATE = `// Copyright (c) Kernel
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "https://raw.githubusercontent.com/openzeppelin/openzeppelin-contracts/master/contracts/token/ERC20/ERC20.sol";

contract KernelToken is ERC20 {
    constructor() ERC20("KernelToken", "SEED") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}
`
const STATE_KEYS = ['error', 'status', 'disabled', 'wallet', 'transactions', 'worker', 'code', 'output']
const INITIAL_STATE = STATE_KEYS
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})
INITIAL_STATE.disabled = false
INITIAL_STATE.code = ERC20_TEMPLATE

const actions = {}
Object.keys(INITIAL_STATE)
  .forEach((k) => {
    actions[k] = (state, e) => Object.assign({}, state, { [k]: e })
  })

const reducer = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    const cause = `Unhandled action: ${action.type}`
    console.log(cause)
    throw new Error('UnknownActionError', { cause })
  }
}

const change = (dispatch, type, e) => {
  try {
    const target = e.target
    const payload = target.type === 'checkbox' ? target.checked : target.value
    dispatch({ type, payload })
  } catch (error) {
    console.log(error)
  }
}

const value = (state, type) => state[type]

const send = async (chainId, walletSend, state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'error', payload: '' })
  dispatch({ type: 'status', payload: 'submitting' })
  dispatch({ type: 'disabled', payload: true })
  // TODO: clean up
  const {
    rinkebyAmount, goerliAmount,
    rinkebyAddress, goerliAddress,
    receipts
  } = state
  const to = chainId === RINKEBY_CHAIN_ID ? rinkebyAddress : goerliAddress
  const value = chainId === RINKEBY_CHAIN_ID
    ? ethers.utils.parseEther(rinkebyAmount)
    : ethers.utils.parseEther(goerliAmount)
  const transactionRequest = { to, value, chainId }
  try {
    const transaction = await walletSend(transactionRequest)
    console.log(transaction)
    dispatch({ type: 'status', payload: `Transaction confirmed: ${transaction.transactionHash}` })
    Object.assign(receipts, { [transaction.id]: transaction })
    dispatch({ type: 'receipts', payload: receipts })
  } catch (error) {
    dispatch({ type: 'error', payload: error.message })
    dispatch({ type: 'disabled', payload: false })
  }
}

const compile = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'error', payload: '' })
  dispatch({ type: 'status', payload: 'compiling' })
  dispatch({ type: 'output', payload: '' })
  // dispatch({ type: 'disabled', payload: true })
  // TODO: clean up
  const { worker, code } = state
  const payload = {
    language: 'Solidity',
    sources: {
      'contract.sol': {
        content: code
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  }
  // const payload = JSON.parse(code)
  worker.postMessage({ cmd: 'compile', payload })
  dispatch({ type: 'disabled', payload: false })
  dispatch({ type: 'status', payload: '' })
}

const Deploy = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  global.state = state
  const navigate = useNavigate()

  const { services, currentUser, walletSend } = useServices()
  const user = currentUser()

  useEffect(() => {
    const worker = new Worker('/worker.js')
    worker.addEventListener('message', (e) => {
      console.log('worker', e)
      dispatch({ type: 'output', payload: JSON.stringify(e.data.payload, null, 2) })
      // dispatch({ type: 'output', payload: e.data.payload })
    })
    dispatch({ type: 'worker', payload: worker })
    worker.postMessage({ cmd: 'load', payload: COMPILER_URL })
    window.worker = worker
    return () => { worker.terminate() }
  }, [])

  useEffect(() => {
    const wallet = loadWallet()
    if (!wallet) {
      return navigate('/register/create')
    }
    dispatch({ type: 'wallet', payload: wallet })
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/login')
    }
    (async () => {
      const { entityFactory } = await services()
      const transactions = await entityFactory({ resource: 'transaction' })
      dispatch({ type: 'transactions', payload: transactions })
    })()
  }, [navigate, user, services])

  return (
    <Page>
      <div className='relative'>
        <div className='hidden lg:block lg:fixed lg:-top-24 lg:-left-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={383} height={412} />
        </div>
        <div className='hidden lg:block lg:fixed lg:-top-12 lg:-right-52 lg:z-0'>
          <img alt='kernel fingerprint' src={linesVector} width={442} height={476} />
        </div>
      </div>
      <div className='mt-32 mx-8 sm:mx-24 xl:mx-48'>
        <div className='text-center'>
          <div className='font-heading lg:text-5xl text-5xl text-primary lg:py-5'>
            Deploy
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary' />
          <div className='my-4 text-secondary'>
            {state.wallet && state.wallet.address &&
              <p><b>Address:</b> {state.wallet.address}</p>}
          </div>
        </div>

        <div className='mb-auto py-20 px-20'>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>Soldity</h3>
            <div className='grid grid-cols-1 md:grid-cols-1 md:gap-x-8 gap-y-8 border-kernel-grey md:pr-12'>
              <form className='form-control w-full'>
                <label className='label block mb-1'>Compiler</label>
                <textarea
                  rows='10'
                  value={value(state, 'code')}
                  onChange={change.bind(null, dispatch, 'code')}
                  placeholder='Input'
                  className='mb-6 border-1 rounded w-full'
                />
                <button
                  disabled={state.disabled}
                  onClick={compile.bind(null, state, dispatch)}
                  className='mt-6 mb-0 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
                >Compile
                </button>
                <button
                  disabled={state.disabled}
                  onClick={send.bind(null, walletSend, state, dispatch)}
                  className='mt-6 mb-0 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
                >Deploy
                </button>
              </form>
              <label className='label block mb-1'>Solidity</label>
              <pre className='mb-6 border-1 rounded w-full'>{value(state, 'output')}</pre>
            </div>
          </div>
        </div>
        {state && state.status &&
          <label className='block'>
            <span className='text-gray-700'>Status</span>
            <div className=''>
              {state.status}
            </div>
          </label>}
        {state && state.error &&
          <label className='block'>
            <span className='text-gray-700'>Error</span>
            <div className=''>
              {state.error}
            </div>
          </label>}
      </div>
    </Page>
  )
}

export default Deploy
