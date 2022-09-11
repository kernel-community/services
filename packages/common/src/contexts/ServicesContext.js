/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { createContext, useReducer, useContext } from 'react'

import entityBuilder from '../services/entity.js'
import resourceBuilder from '../services/resource.js'
import jwtService from '../services/jwt.js'
import rpcClientBuilder from '../services/rpcClient.js'
import taskBuilder from '../services/task.js'
import queryBuilder from '../services/query.js'

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const AUTH_URL = process.env[`REACT_APP_AUTH_URL_${env}`]
const SEND_URL = process.env[`REACT_APP_SEND_URL_${env}`]
const AUTH_MESSAGE_TYPE = 'kernel.auth'
const AUTH_TIMEOUT_MS = 24 * 60 * 60 * 1000

const COOKIE_USER = env === 'PROD' ? 'prodUser' : 'stagingUser'

const rpcEndpointStorage = process.env[`REACT_APP_STORAGE_ENDPOINT_${env}`]
const rpcEndpointTask = process.env[`REACT_APP_TASK_ENDPOINT_${env}`]
const rpcEndpointQuery = process.env[`REACT_APP_QUERY_ENDPOINT_${env}`]

const ServicesContext = createContext()

const getItem = (k) => localStorage.getItem(k)

// TODO: support spread operator
const actions = {
  transaction: (state, transaction) => Object.assign(state, { transaction }),
  event: (state, event) => Object.assign(state, { event }),
  jwt: (state, jwt) => Object.assign(state, { jwt }),
  pong: (state, { source, origin, event }) => Object.assign(state, { source, origin, event }),
  user: (state, user) => Object.assign(state, { user })
}

const reducer = (state, action) => {
  try {
    // console.log(action.type, action.payload, actions[action.type], state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

const message = (event, payload) => { return { type: AUTH_MESSAGE_TYPE, event, payload } }
const reply = (source, target, event, payload) => source.postMessage(message(event, payload), target)

const services = async (state) => {
  // TODO: handle refreshing
  const jwtFn = () => state.jwt
  const rpcClientStorage = await rpcClientBuilder.build({ rpcEndpoint: rpcEndpointStorage, jwtFn })
  const resourceService = await resourceBuilder.build({ rpcClient: rpcClientStorage })
  const entityFactory = entityBuilder.build.bind(null, { rpcClient: rpcClientStorage })

  const rpcClientTask = await rpcClientBuilder.build({ rpcEndpoint: rpcEndpointTask, jwtFn })
  const taskService = await taskBuilder.build({ rpcClient: rpcClientTask })

  const rpcClientQuery = await rpcClientBuilder.build({ rpcEndpoint: rpcEndpointQuery, jwtFn })
  const queryService = await queryBuilder.build({ rpcClient: rpcClientQuery })

  return { rpcClientStorage, resourceService, entityFactory, rpcClientTask, taskService, queryService }
}

const handleMessage = (dispatch, messageEvent) => {
  const { data: { type, event, payload }, source, origin } = messageEvent
  if (!type || type !== AUTH_MESSAGE_TYPE) {
    return
  }
  switch (event) {
    case 'ping':
      reply(source, origin, 'pong', {})
      break
    case 'pong':
      console.log(event)
      dispatch({ type: 'pong', payload: { source, origin, event } })
      break
    case 'jwt':
      dispatch({ type: 'jwt', payload })
      break
    case 'transaction':
      dispatch({ type: 'transaction', payload })
      break
  }
}

const group = (acc, e, i) => {
  i % 2 == 0 ? acc[Math.floor(i/2)] = [e] : acc[Math.floor(i/2)].push(e)
  return acc
}
const cookies = (cookie) => Object.fromEntries(cookie.split('=').reduce(group))

const hasCookie = () => document.cookie.includes(COOKIE_USER)
const fromCookie = () => JSON.parse(decodeURIComponent(cookies(document.cookie)[COOKIE_USER]))
const expired = (exp) => Date.now() - exp > 0

const walletLogin = async (state, dispatch) => {
  if (state.user && !expired(state.user.exp)) {
    return state.user
  }

  if (hasCookie()) {
    const payload = fromCookie()
    if (!expired(payload.exp)) {
      dispatch({ type: 'user', payload })
      return payload
    }
  }

  if (getItem('jwt')) {
    const payload = getItem('jwt')
    const { payload: user } = jwtService.decode(payload)
    if (!expired(user.exp)) {
      dispatch({ type: 'jwt', payload })
      dispatch({ type: 'user', payload: user })
      return user
    }
  }

  const auth = window.open(AUTH_URL, '_blank')
  window.addEventListener('message', handleMessage.bind(null, dispatch))
  try {
    await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        console.log(state)
        if (state.event && state.event === 'pong') {
          return resolve('synced')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('sync timeout', Date.now(), ts)
          return reject(new Error('timeout'))
        }
        reply(auth, AUTH_URL, 'ping', {})
        setTimeout(sync, 300)
      }
      setTimeout(sync, 300)
    })
    await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        if (state.jwt) {
          return resolve('authed')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('auth timeout', Date.now(), ts)
          return reject(new Error('timeout'))
        }
        setTimeout(sync, 100)
      }
      setTimeout(sync, 100)
    })
    auth.close()
    // TODO: check signature
    const { payload: user } = jwtService.decode(state.jwt)
    dispatch({ type: 'user', payload: user })
    return user
  } catch (error) {
    console.log(error)
  }
}

const walletSend = async (state, dispatch, transactionRequest) => {
  dispatch({ type: 'transaction', payload: null })
  dispatch({ type: 'event', payload: null })
  const sign = window.open(SEND_URL, '_blank')
  window.addEventListener('message', handleMessage.bind(null, dispatch))
  try {
    await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        console.log(state)
        if (state.event && state.event === 'pong') {
          return resolve('synced')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('sync timeout', Date.now(), ts)
          return reject(new Error('timeout'))
        }
        reply(sign, SEND_URL, 'ping', {})
        setTimeout(sync, 300)
      }
      setTimeout(sync, 300)
    })
    reply(sign, SEND_URL, 'transactionRequest', transactionRequest)
    await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        if (state.transaction) {
          return resolve('signed')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('sign timeout', Date.now(), ts)
          return reject(new Error('timeout'))
        }
        setTimeout(sync, 100)
      }
      setTimeout(sync, 100)
    })
    sign.close()
    // TODO: check signature
    const transaction = state.transaction
    return transaction
  } catch (error) {
    console.log(error)
  }
}

const currentUser = (state, dispatch) => {
  if (state.user && !expired(state.user.exp)) {
    return state.user
  }

  // TODO: check exp
  if (hasCookie()) {
    const payload = fromCookie()
    if (!expired(payload.exp)) {
      dispatch({ type: 'user', payload })
      return payload
    }
  }

  if (getItem('jwt')) {
    const payload = getItem('jwt')
    const { payload: user } = jwtService.decode(payload)
    if (!expired(user.exp)) {
      dispatch({ type: 'jwt', payload })
      dispatch({ type: 'user', payload: user })
      return user
    }
  }
}

const ServicesProvider = ({ children }) => {
  const initialState = {}
  if (hasCookie()) {
    Object.assign(initialState, { user: fromCookie() })
  }
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = {
    state,
    dispatch,
    currentUser: currentUser.bind(null, state, dispatch),
    services: services.bind(null, state),
    walletLogin: walletLogin.bind(null, state, dispatch),
    walletSend: walletSend.bind(null, state, dispatch)
  }
  return (<ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>)
}

const useServices = () => {
  const context = useContext(ServicesContext)
  if (!context) {
    throw new Error(
      'ServicesContextError',
      { cause: 'useServices must be used within a ServicesProvider' })
  }
  return context
}

export { ServicesProvider, useServices }
