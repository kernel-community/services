/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices, Navbar, Footer, Alert } from '@kernel/common'

import AppConfig from 'App.config'
import NavBar from 'components/NavBar'
import Form from 'components/Form'

const KEYS = ['nickname', 'title', 'limit', 'location', 'start', 'end', 'description']
const INITIAL_STATE = ['event', 'events'].concat(KEYS)
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

const update = async (state, dispatch, e) => {
  e.preventDefault()
  const { events, event } = state
  const data = Object.keys(state)
    .filter((k) => !['event', 'events'].includes(k))
    .reduce((acc, k) => Object.assign(acc, { [k]: state[k] }), {})
  console.log(data)
  try {
    const created = await events.update(event, data)
    console.log(created)
  } catch (error) {
    dispatch({ type: 'error', payload: error })
  }
}

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()
  const { event } = useParams()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'event'
      const events = await entityFactory({ resource })
      dispatch({ type: 'events', payload: events })
      dispatch({ type: 'event', payload: event })
      const entity = await events.get(event)
      const data = entity.data
      Object.keys(data)
        .forEach((k) => dispatch({ type: k, payload: data[k] }))
    })()
  }, [services, event])

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='mb-auto py-20 px-20 sm:px-40 lg:px-80'>
        <div className='md:basis-1/2 px-8'>
          <Form text='Update' value={value} create={update} change={change} state={state} dispatch={dispatch} />
        </div>
        <div className='md:basis-1/2 grow px-8 rounded-md border-gray-800 shadow-lg' />
      </div>
      <Footer />
    </div>
  )
}

export default Page
