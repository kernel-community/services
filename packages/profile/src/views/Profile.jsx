/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, Footer } from '@kernel/common'

import AppConfig from 'App.config'

const FORM_INPUT = ['email', 'name', 'pronouns', 'twitter', 'city', 'company', 'bio']

// initializes state in the form:
// { wallet: '', email: '', consent: true }
const INITIAL_STATE_KEYS = ['wallet'].concat(FORM_INPUT)
const INITIAL_STATE = INITIAL_STATE_KEYS
  .reduce((acc, key) => Object.assign(acc, { [key]: '' }), {})
INITIAL_STATE.consent = true

const actions = {}

// initializes an actions object in the form:
// { bio: (state, value) => Object.assign({}, state, bio: value}) }
// each field's action updates the state with the given value
INITIAL_STATE_KEYS
  .concat(['consent', 'profiles', 'members', 'memberId', 'profileId'])
  .forEach((key) => {
    actions[key] = (state, value) => Object.assign({}, state, { [key]: value })
  })

// tries to call the given action
const reducer = (state, action) => {
  try {
    // console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

// tries to get the payload out of the event and dispatch it
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

const save = async (state, dispatch, setSubmitting, e) => {
  e.preventDefault()
  setSubmitting(true)

  const { profiles, members, memberId, profileId } = state
  const data = Object.keys(state)
    .filter(key => !['profiles', 'members', 'profileId', 'wallet'].includes(key))
    .reduce((acc, key) => Object.assign(acc, { [key]: state[key] }), {})
  console.log(data)

  if (profileId && memberId) {
    const patched = await profiles.patch(profileId, data)
    console.log('patched', patched)
    setSubmitting(false)
    return patched
  }

  const profile = await profiles.create(data)
  console.log('new', profile)
  dispatch({ type: 'profileId', payload: profile.id })

  const member = await members.patch(profile.data.memberId, { profileId: profile.id })
  console.log(member)
  setSubmitting(false)
  // dispatch({ type: 'created', payload: updated })
}

const Input = ({ fieldName, editable = true, state, dispatch }) => {
  const disabled = !editable
  const bgColorClass = disabled ? 'bg-gray-200' : ''

  return (
    <div className='mb-6'>
      <label className='label block mb-1'>
        <span className='label-text text-gray-700 capitalize'>{fieldName}</span>
      </label>
      <input
        type='text' disabled={!editable} className={`border-1 rounded w-full ${bgColorClass}`}
        value={value(state, fieldName)} onChange={change.bind(null, dispatch, fieldName)}
      />
    </div>
  )
}

const Profile = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { services, currentUser } = useServices()
  const user = currentUser()

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      const memberId = user.iss
      dispatch({ type: 'memberId', payload: memberId })

      const { entityFactory } = await services()

      const profiles = await entityFactory({ resource: 'profile' })
      dispatch({ type: 'profiles', payload: profiles })

      const members = await entityFactory({ resource: 'member' })
      dispatch({ type: 'members', payload: members })

      const member = await members.get(memberId)
      dispatch({ type: 'wallet', payload: member.data.wallet })

      const { data: { profileId } } = member
      if (profileId) {
        dispatch({ type: 'profileId', payload: profileId })
        const profile = await profiles.get(profileId)
        console.log(profile)
        // TODO: parse profile into state
        const data = profile.data
        Object.entries(data)
          .forEach(([key, value]) => dispatch({ type: key, payload: value }))
      }
    })()
  }, [services, user])

  return (
    <div className='flex flex-col h-screen justify-between'>
      <Navbar
        title={AppConfig.appTitle}
        logoUrl={AppConfig.logoUrl}
        menuLinks={AppConfig.navbar?.links}
        backgroundColor='bg-kernel-dark' textColor='text-kernel-white'
      />
      <div className='mb-auto py-20 px-20 sm:px-40 lg:px-80'>
        <form className='form-control w-full'>
          <Input fieldName='wallet' editable={false} state={state} dispatch={dispatch} />
          {FORM_INPUT.map((fieldName) => {
            return (
              <Input key={fieldName} fieldName={fieldName} state={state} dispatch={dispatch} />
            )
          })}
          <div className='mt-8 mb-2'>
            <label className='label'>
              <input
                type='checkbox' className='checkbox checkbox-primary cursor-pointer align-middle'
                checked={value(state, 'consent')} onChange={change.bind(null, dispatch, 'consent')}
              />
              <span className='label-text ml-1.5 align-middle'>Make my information available to others</span>
            </label>
          </div>
          <button
            disabled={submitting}
            onClick={save.bind(null, state, dispatch, setSubmitting)}
            className={`my-6 px-6 py-4 ${submitting ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
          >
            Save
          </button>
          {state && state.serviceError &&
            <label className='block'>
              <span className='text-gray-700'>error</span>
              <div className=''>
                {state.serviceerror.message}
              </div>
            </label>}
        </form>
      </div>
      <Footer backgroundColor='bg-kernel-dark' textColor='text-kernel-white'>
        built at <a href='https://kernel.community/' className='text-kernel-green-light'>KERNEL</a>
      </Footer>
    </div>
  )
}

export default Profile
