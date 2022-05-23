/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, Footer } from '@kernel/common'

import AppConfig from 'App.config'

const INITIAL_STATE = { error: '', loading: true, profiles: {}, projects: {} }

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
  return `${i} ${unit}${pluralize} ago`
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

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  global.state = state
  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      dispatch({ type: 'error', payload: '' })
      dispatch({ type: 'loading', payload: true })
      const { queryService } = await services()
      try {
        const { profiles, projects } = await queryService.recommend()
        dispatch({ type: 'profiles', payload: profiles })
        dispatch({ type: 'projects', payload: projects })
      } catch (error) {
        dispatch({ type: 'error', payload: readable(error.message) })
      }
      dispatch({ type: 'loading', payload: false })
    })()
  }, [services, user])

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        homeUrl={AppConfig.homeUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='flex md:flex-row flex-wrap py-4 justify-center flex-grow'>
        <div className='md:basis-2/3 px-8'>
          <div className='grid grid-cols-1 gap-6'>
            {state && state.error &&
              <div className='block text-center'>
                <p className='text-red-600'>{state.error}</p>
              </div>}
            {state && state.loading &&
              <div className='block text-center'>
                <p className='text-purple-900 text-center'> ... Loading recommendations ... </p>
              </div>}
            <div className='block text-center'>
              <h1 className='uppercase text-center py-4'>Humans</h1>
              <ul>
                {state && state.profiles && Object.entries(state.profiles).map(([_, e]) => {
                  const meta = e
                  const profile = e.data
                  const created = Date.now() - meta.created
                  return (
                    <li key={meta.id} className='text-gray-700 py-4'>
                      <small>{humanize(created)}</small>
                      <p><b>{profile.name}</b> ({profile.pronouns})</p>
                      <p>{profile.city} - {profile.company}</p>
                      <p>{profile.bio}</p>
                      <p>{profile.email} - {profile.twitter}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className='block text-center'>
              <h1 className='uppercase text-center'>Adventures</h1>
              <ul>
                {state && state.projects && Object.entries(state.projects).map(([_, e]) => {
                  const meta = e
                  const project = e.data
                  const updated = Date.now() - meta.created
                  return (
                    <li key={meta.id} className='text-gray-700 py-4'>
                      <small>{humanize(updated)}</small>
                      <p>
                        <b>
                          <a target='_blank' rel='noreferrer' href={`https://staging.adventures.kernel.community/view/${meta.id}`}>{project.title}</a>
                        </b>
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer backgroundColor='bg-kernel-dark' textColor='text-kernel-white'>
        built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
      </Footer>
    </div>
  )
}

export default Page
