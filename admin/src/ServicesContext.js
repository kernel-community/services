/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { createContext, useReducer, useContext } from 'react'

import entityBuilder from 'common/src/services/entity.js'
import resourceBuilder from 'common/src/services/resource.js'
import jwtService from 'common/src/services/jwt.js'
import rpcClientBuilder from 'common/src/services/rpcClient.js'

const AUTH_URL = process.env.REACT_APP_AUTH_URL
const AUTH_MESSAGE_TYPE = 'kernel.auth'
const AUTH_TIMEOUT_MS = 1000 * 60
const ADMIN_ROLE = 100 

const INITIAL_STATE = {}

const rpcEndpoint = process.env.REACT_APP_STORAGE_ENDPOINT

const ServicesContext = createContext()

//TODO: support spread operator
const actions = {
  jwt: (state, jwt) => Object.assign(state, { jwt }),
  pong: (state, { source, origin, event }) => Object.assign(state, { source, origin, event }),
  user: (state, user) => Object.assign(state, { user })
}

const reducer = (state, action) => {
  try {
    //console.log(action.type, action.payload, actions[action.type], state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw {name: 'UnknownActionError', message: `Unhandled action: ${action.type}`}
  }
}

const message = (event, payload) => { return {type: AUTH_MESSAGE_TYPE, event, payload} }
const reply = (source, target, event, payload) => source.postMessage(message(event, payload), target)

const services = async (state) => {
  //TODO: handle refreshing
  const jwtFn = () => state.jwt
  const rpcClient = await rpcClientBuilder.build({ rpcEndpoint, jwtFn })

  const resourceService = await resourceBuilder.build({ rpcClient })

  const entityFactory = entityBuilder.build.bind(null, { rpcClient })

  return { rpcClient, resourceService, entityFactory }
}

const handleMessage = (dispatch, messageEvent) => {
  const { data: {type, event, payload}, source, origin } = messageEvent
  if (!type || type !== AUTH_MESSAGE_TYPE) {
    return
  }
  switch (event) {
    case 'ping':
      reply(source, origin, 'pong', {})
      break;
    case 'pong':
      console.log(event)
      dispatch({ type: 'pong', payload: { source, origin, event } })
      break;
    case 'jwt':
      dispatch({ type: 'jwt', payload })
      break;
  }
}

const walletLogin = async (state, dispatch) => {
  //TODO: check exp
  if (state.user) {
    return state.user
  }
  const auth = window.open(AUTH_URL, '_blank')
  window.addEventListener('message', handleMessage.bind(null, dispatch))
  try {
    const pong = await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        console.log(state)
        if (state.event && state.event === 'pong') {
          return resolve('synced')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('sync timeout', Date.now(), ts)
          return reject('timeout')
        }
        reply(auth, AUTH_URL, 'ping', {})
        setTimeout(sync, 300)
      }
      setTimeout(sync, 300)
    })
    const authToken = await new Promise((resolve, reject) => {
      const ts = Date.now()
      const sync = () => {
        if (state.jwt) {
          return resolve('authed')
        }
        if ((Date.now() - ts) > AUTH_TIMEOUT_MS) {
          console.log('auth timeout', Date.now(), ts)
          return reject('timeout')
        }
        setTimeout(sync, 100)
      }
      setTimeout(sync, 100)
    })
    auth.close()
    //TODO: check signature
    const {header, payload: user, signature} = jwtService.decode(state.jwt)
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
    state, dispatch,
    currentUser: currentUser.bind(null, state),
    services: services.bind(null, state),
    walletLogin: walletLogin.bind(null, state, dispatch)
  }
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
}

const useServices = () => {
  const context = useContext(ServicesContext)
  if (!context) {
    throw {
      name: 'ServicesContextError',
      message: 'useServices must be used within a ServicesProvider'
    }
  }
  return context
}

export {ServicesProvider, useServices}
