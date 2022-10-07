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
import { useServices, linesVector, timeUtils } from '@kernel/common'

import AppConfig from 'App.config'

import { loadWallet, provider, voidSigner, humanizeEther, humanizeHash, blockExplorer } from 'common'
import Page from 'components/Page'

const GOERLI_CHAIN_ID = 5

const STATE_KEYS = ['error', 'status', 'disabled', 'wallet', 'transactions', 'receipts',
  'goerliProvider', 'goerliSigner', 'goerliBalance', 'goerliAmount', 'goerliAddress'
]
const INITIAL_STATE = STATE_KEYS
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})
INITIAL_STATE.disabled = false

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
    goerliAmount,
    goerliAddress,
    receipts
  } = state
  const to = goerliAddress
  const value = ethers.utils.parseEther(goerliAmount)
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

const ethFlowColor = ({ wallet: { address } }, from, to) => {
  if (address === to && address === from) {
    return 'text-gray-600'
  }
  if (address === to) {
    return 'text-green-600'
  }
  if (address === from) {
    return 'text-red-600'
  }
  return ''
}

const Transact = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  global.state = state
  const navigate = useNavigate()

  const { services, currentUser, walletSend } = useServices()
  const user = currentUser()

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

      // TODO: generalize
      const goerliProvider = provider(GOERLI_CHAIN_ID)
      dispatch({ type: 'goerliProvider', payload: goerliProvider })

      const goerliSigner = voidSigner(wallet.address, goerliProvider)
      dispatch({ type: 'goerliSigner', payload: goerliSigner })
      const goerliBalance = await goerliSigner.getBalance()
      dispatch({ type: 'goerliBalance', payload: goerliBalance })

      const fromReceipts = await transactions.getAll(`from/${wallet.address}`)
      const toReceipts = await transactions.getAll(`to/${wallet.address}`)
      const receipts = { ...fromReceipts, ...toReceipts }
      dispatch({ type: 'receipts', payload: receipts })
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
            Transact
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary' />
          <div className='my-4 text-secondary'>
            {state.wallet && state.wallet.address &&
              <p><b>Address:</b> {state.wallet.address}</p>}
          </div>
        </div>

        <div className='my-4 px-4 grid grid-cols-1 md:grid-cols-1 md:my-16 md:px-16'>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>Goerli</h3>
            <div className='grid grid-cols-1 md:grid-cols-1 md:gap-x-8 gap-y-8 md:pl-12'>
              <form className='form-control w-full'>
                <input
                  type='text'
                  value={value(state, 'goerliAddress')}
                  onChange={change.bind(null, dispatch, 'goerliAddress')}
                  placeholder='Address'
                  className='mb-6 border-1 rounded w-full'
                />
                <input
                  type='text'
                  value={value(state, 'goerliAmount')}
                  onChange={change.bind(null, dispatch, 'goerliAmount')}
                  placeholder='Amount ETH'
                  className='mb-6 border-1 rounded w-full'
                />
                <button
                  disabled={state.disabled}
                  onClick={send.bind(null, GOERLI_CHAIN_ID, walletSend, state, dispatch)}
                  className='mt-6 mb-0 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
                >Send Goerli
                </button>
                <label>Goerli balance: {humanizeEther(state.goerliBalance)} goeETH</label>
              </form>
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
        <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='py-8 inline-block min-w-full sm:px-6 lg:px-8'>
            <div className='overflow-x-auto'>
              <table className='table-fixed w-full'>
                <thead>
                  <tr>
                    {['Age', 'From', 'To', 'Chain', 'Hash', 'Value'].map((title) => <th key={title}>{title}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(state.receipts)
                    .sort(({ created: a }, { created: b }) => a - b)
                    .reverse()
                    .map(({ id, created, data: { from, to, chainId, transactionHash, value } }, i) =>
                      <tr className={'border-b text-center ' + (i % 2 ? 'bg-gray-100' : 'bg-white')} key={id}>
                        <td className='text-sm whitespace-nowrap'>{timeUtils.humanize(Date.now() - created)}</td>
                        <td className='text-sm whitespace-nowrap'>{humanizeHash(from)}</td>
                        <td className='text-sm whitespace-nowrap'>{humanizeHash(to)}</td>
                        <td className='text-sm whitespace-nowrap'>{chainId}</td>
                        <td className='text-sm whitespace-nowrap'>
                          <a
                            className='no-underline hover:underline' rel='noreferrer' target='_blank'
                            href={blockExplorer(chainId, transactionHash)}
                          >{humanizeHash(transactionHash)}
                          </a>
                        </td>
                        <td className={'text-left text-sm whitespace-nowrap ' + ethFlowColor(state, from, to)}>
                          {value ? humanizeEther(ethers.BigNumber.from(value._hex || value.hex || 0)) : '0'} ETH
                        </td>
                      </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Transact
