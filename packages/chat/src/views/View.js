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
import NavBar from 'components/NavBar'

const REFRESH_INTERVAL = 10000

const INITIAL_STATE = {
  error: '', loading: true, active: '', channelId: '', content: '', nickname: '', refresh: 0, channels: {}, messages: {}, services: {}
}

const actions = { }

Object.keys(INITIAL_STATE)
  .forEach((key) => {
    actions[key] = (state, value) => Object.assign({}, state, { [key]: value })
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

// Credits: https://stackoverflow.com/a/68121710
const timeScalars = [1000, 60, 60, 24, 7, 52]
const timeUnits = ['ms', 'secs', 'min', 'hr', 'day', 'week', 'year']

const humanize = (ms, dp = 0) => {
  let timeScalarIndex = 0; let scaledTime = ms

  while (scaledTime > timeScalars[timeScalarIndex]) {
    scaledTime /= timeScalars[timeScalarIndex++]
  }

  const i = scaledTime.toFixed(dp)
  const unit = timeUnits[timeScalarIndex]
  const pluralize = i > 1 && unit.slice(-1) !== 's' ? 's' : ''
  return `${i < 0 ? 0 : i} ${unit}${pluralize} ago`
}

const readable = (error) => {
  if (error.toLowerCase().indexOf('consent') > 0) {
    return 'You need to share your profile data in order to view recommendations.'
  }
  if (error.toLowerCase().indexOf('profile') > 0) {
    return 'You need to create your profile first in order to view recommendations.'
  }
  return 'You need to refresh your auth token by reloading this page.'
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

const changeChannel = async (state, dispatch, channel) => {
  dispatch({ type: 'active', payload: channel.data.name })
  dispatch({ type: 'channelId', payload: channel.id })
}

const sendMessage = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'loading', payload: true })
  dispatch({ type: 'error', payload: '' })
  try {
    const { channelId, content, messages, nickname, services } = state
    const message = await services.messages.create({ channelId, content, nickname })
    dispatch({ type: 'messages', payload: Object.assign(messages, { [message.id]: message }) })
    dispatch({ type: 'content', payload: '' })
  } catch (error) {
    console.log(error)
    dispatch({ type: 'error', payload: readable(error.message) })
  }
  dispatch({ type: 'loading', payload: false })
}

const Textarea = ({ state, dispatch }) => {
  if (state.loading) {
    return (
      <textarea
        className='w-full' rows='5' readOnly={!!state.loading}
        value={value(state, 'content')} onChange={change.bind(null, dispatch, 'content')}
      />
    )
  }
  return (
    <textarea
      className='w-full' rows='5' value={value(state, 'content')} onChange={change.bind(null, dispatch, 'content')}
      onKeyDown={e=>{handleMetaEnter(e)}}
    />
  )
}

const handleMetaEnter = e => {
  if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)){
    e.preventDefault()
    e.target.form.requestSubmit()
  }
}

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()
  // const { channelId } = useParams()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
    dispatch({ type: 'nickname', payload: user.nickname })
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      dispatch({ type: 'error', payload: '' })
      dispatch({ type: 'loading', payload: true })
      try {
        const { entityFactory } = await services()
        const channels = await entityFactory({ resource: 'channel' })
        const messages = await entityFactory({ resource: 'message' })
        dispatch({ type: 'services', payload: { channels, messages } })
        const [allChannels, allMessages] = await Promise.all([channels.getAll(), messages.getAll()])
        dispatch({ type: 'channels', payload: allChannels })
        dispatch({ type: 'messages', payload: allMessages })
        const channel = Object.values(allChannels)[0]
        dispatch({ type: 'active', payload: channel.data.name })
        dispatch({ type: 'channelId', payload: channel.id })
        const refresh = async () => {
          // TODO: support getting delta
          const newMessages = await messages.getAll()
          dispatch({ type: 'messages', payload: newMessages })
          const refreshMs = Math.floor(Math.random() * REFRESH_INTERVAL) + REFRESH_INTERVAL
          console.log('refresh ms', refreshMs)
          const id = setTimeout(refresh, refreshMs)
          dispatch({ type: 'refresh', payload: id })
        }
        const id = setTimeout(refresh, REFRESH_INTERVAL)
        dispatch({ type: 'refresh', payload: id })
      } catch (error) {
        console.log(error)
        dispatch({ type: 'error', payload: readable(error.message) })
      }
      dispatch({ type: 'loading', payload: false })
    })()
  }, [services])

  return (
    <div className='md:container md:mx-auto'>
      <NavBar />
      {state && state.error &&
        <div className='block text-center'>
          <p className='text-red-600'>{state.error}</p>
        </div>}
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='md:basis-1/3 grow px-8 rounded-md border-gray-800 shadow-lg min-h-screen'>
          <p className='uppercase'>Channels</p>
          <ul>
            {state && state.channels && Object.values(state.channels).map((e) => {
              const meta = e
              const channel = e.data
              return (
                <li key={meta.id} className='text-gray-700 py-4'>
                  <p onClick={changeChannel.bind(null, state, dispatch, e)}>
                    {state.active === channel.name
                      ? (<b>{channel.name}</b>)
                      : channel.name}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
        <div className='md:basis-2/3 grow px-8 rounded-md border-gray-800 shadow-lg min-h-screen'>
          <p className='uppercase'>Messages</p>
          <form onSubmit={sendMessage.bind(null, state, dispatch)} >
            <Textarea state={state} dispatch={dispatch} />
            <input
              value='Send' type='submit' disabled={state.loading}
              onClick={sendMessage.bind(null, state, dispatch)}
              className='w-full my-2 px-2 py-4 bg-kernel-green-dark text-kernel-white w-full rounded font-bold'
            />
          </form>
          <hr />
          <ul>
            {state && state.messages &&
              Object.values(state.messages)
                .filter((e) => state.channelId === e.data?.channelId)
                .slice(-100)
                .reverse()
                .map((e) => {
                  console.log(e)
                  const meta = e
                  const message = e.data
                  const created = Date.now() - meta.created
                  return (
                    <li key={meta.id} className='text-gray-700 py-4'>
                      <p>{message.content}</p>
                      <small>{message.nickname} - {humanize(created)}</small>
                    </li>
                  )
                })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Page
