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

const FORM_INPUT = ['email', 'name', 'pronouns', 'twitter', 'city', 'company', 'bio']

const INITIAL_STATE = ['wallet'].concat(FORM_INPUT)
  .reduce((acc, k) => Object.assign(acc, { [k]: '' }), {})
INITIAL_STATE.consent = true

const actions = {}

Object.keys(INITIAL_STATE)
  .concat(['consent', 'profiles', 'members', 'memberId', 'profileId'])
  .forEach((k) => {
    actions[k] = (state, e) => Object.assign({}, state, { [k]: e })
  })

const reducer = (state, action) => {
  try {
    // console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
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

const value = (state, type) => {
  return state[type]
}

const save = async (state, dispatch, e) => {
  e.preventDefault()
  const { profiles, members, memberId, profileId } = state
  const data = Object.keys(state)
    .filter((k) => !['profiles', 'members', 'profileId', 'wallet'].includes(k))
    .reduce((acc, k) => Object.assign(acc, { [k]: state[k] }), {})
  console.log(data)
  if (profileId && memberId) {
    const patched = await profiles.patch(profileId, data)
    console.log('patched', patched)
    return patched
  }
  const profile = await profiles.create(data)
  console.log('new', profile)
  dispatch({ type: 'profileId', payload: profile.id })
  const member = await members.patch(profile.data.memberId, { profileId: profile.id })
  console.log(member)
  // dispatch({ type: 'created', payload: updated })
}

const capitalize = (s) => s[0].toUpperCase() + s.slice(1)

const Input = ({ id, editable = true, state, dispatch }) => (
  <>
    <label className='label'>
      <span className='label-text text-gray-700'>{capitalize(id)}</span>
    </label>
    {
      editable
        ? (<input
            type='text' className='input input-bordered w-full'
            value={value(state, id)} onChange={change.bind(null, dispatch, id)}
           />)
        : (<input
            type='text' className='input input-bordered w-full' disabled
            value={value(state, id)}
           />)
    }
  </>
)

const Page = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  const { services, currentUser } = useServices()
  const user = currentUser()

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
        Object.keys(data)
          .forEach((k) => dispatch({ type: k, payload: data[k] }))
      }
    })()
  }, [services, user])

  return (
    <div className='md:container md:mx-auto'>
      <NavBar />
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='w-full px-8'>
          <div className='card w-full bg-base-100 shadow-xl'>
            <div className='card-body'>
              <form className='form-control w-full'>
                <Input id='wallet' editable={false} state={state} dispatch={dispatch} />
                {FORM_INPUT.map((k) => <Input key={k} id={k} state={state} dispatch={dispatch} />)}
                <label className='label cursor-pointer justify-center'>
                  <input
                    type='checkbox' className='checkbox checkbox-primary'
                    value={value(state, 'consent')} onChange={change.bind(null, dispatch, 'consent')}
                  />
                  <span className='label-text'>Make my information available to others</span>
                </label>
                <label className='label justify-center'>
                  <button
                    onClick={save.bind(null, state, dispatch)}
                    className='btn btn-primary'
                  >
                    Save
                  </button>
                </label>
                {state && state.serviceError &&
                  <label className='block'>
                    <span className='text-gray-700'>Error</span>
                    <div className=''>
                      {state.serviceError.message}
                    </div>
                  </label>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
