/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, linesVector } from '@kernel/common'

import AppConfig from 'App.config'

import Page from 'components/Page'

const STATE_KEYS = ['taskService', 'error', 'status', 'disabled']
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

const claim = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'error', payload: '' })
  dispatch({ type: 'status', payload: 'submitting' })
  dispatch({ type: 'disabled', payload: true })
  const { taskService } = state
  try {
    await taskService.ethereumFaucet({ chainId: 4 })
    dispatch({ type: 'status', payload: 'Faucet request submitted' })
  } catch (error) {
    dispatch({ type: 'error', payload: error.message })
    dispatch({ type: 'disabled', payload: false })
  }
}

const Claim = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/login')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      const { taskService } = await services()
      dispatch({ type: 'taskService', payload: taskService })
    })()
  }, [services])

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
            Make Your Claim
          </div>
          <hr />
          <div className='text-2xl my-4 text-secondary' />
          <div className='my-4 text-secondary'>
            Here you can claim a number of tokens to start your web3 journey.
          </div>
        </div>

        <div className='my-4 px-4 grid grid-cols-1 md:grid-cols-2 md:my-16 md:px-16'>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>Testnet</h3>
            <div className='grid grid-cols-1 md:grid-cols-1 md:gap-x-8 gap-y-8 border-0 md:border-r border-kernel-grey md:pr-12'>
              <button
                disabled={state.disabled}
                onClick={claim.bind(null, state, dispatch)}
                className='mt-6 mb-4 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
              >Rinkeby
              </button>
            </div>
          </div>
          <div>
            <h3 className='font-heading text-center text-3xl text-primary py-5'>Mainnet</h3>
            <div className='grid grid-cols-1 md:grid-cols-1 md:gap-x-8 gap-y-8 md:pl-12'>
              <p>Sponsor our community</p>
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

export default Claim
