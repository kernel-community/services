/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'
import Form from 'components/Form'
import NavBar from 'components/NavBar'

const KEYS = ['nickname', 'title', 'limit', 'location', 'start', 'end', 'description']
const INITIAL_STATE = ['events'].concat(KEYS)
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})

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
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

const change = (dispatch, type, e) => {
  try {
    e.preventDefault()
    const payload = e.target.value
    dispatch({ type, payload })
  } catch (error) {
    console.log(error)
  }
}

const value = (state, type) => {
  console.log(type, state)

  return state[type]
}

const create = async (state, dispatch, e) => {
  e.preventDefault()
  const { events } = state
  const data = Object.keys(state)
    .filter((k) => !['events'].includes(k))
    .reduce((acc, k) => Object.assign(acc, { [k]: state[k] }), {})
  console.log(data)
  try {
    const created = await events.create(data)
    console.log(created)
  } catch (error) {
    dispatch({ type: 'error', payload: error })
  }
}

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
    const { nickname } = user
    dispatch({ type: 'nickname', payload: nickname })
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'event'
      const events = await entityFactory({ resource })
      dispatch({ type: 'events', payload: events })
    })()
  }, [services])

  return (
    <div className='md:container md:mx-auto'>
      <NavBar />
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='md:basis-1/2 px-8'>
          <Form value={value} create={create} change={change} state={state} dispatch={dispatch} />
        </div>
        <div className='md:basis-1/2 grow px-8 rounded-md border-gray-800 shadow-lg' />
      </div>
    </div>
  )
}

export default Page
