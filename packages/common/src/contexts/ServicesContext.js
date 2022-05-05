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

const env = process.env.REACT_APP_DEPLOY_TARGET || 'PROD'
const AUTH_URL = process.env[`REACT_APP_AUTH_URL_${env}`]
const AUTH_MESSAGE_TYPE = 'kernel.auth'
const AUTH_TIMEOUT_MS = 1000 * 60

const INITIAL_STATE = {}

const rpcEndpointStorage = process.env[`REACT_APP_STORAGE_ENDPOINT_${env}`]
const rpcEndpointTask = process.env[`REACT_APP_TASK_ENDPOINT_${env}`]

const ServicesContext = createContext()

// TODO: support spread operator
const actions = {
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

  return { rpcClientStorage, resourceService, entityFactory, rpcClientTask, taskService }
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
  }
}

const walletLogin = async (state, dispatch) => {
  // TODO: check exp
  if (state.user) {
    return state.user
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

const currentUser = (state) => state.user

const ServicesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const value = {
    state,
    dispatch,
    currentUser: currentUser.bind(null, state),
    services: services.bind(null, state),
    walletLogin: walletLogin.bind(null, state, dispatch)
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
