/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import Resizer from 'react-image-file-resizer'
import { Switch } from '@headlessui/react'
import { useServices, Navbar, Footer, Alert, getUrl } from '@kernel/common'

import AppConfig from 'App.config'

const AVATAR_CONFIG = {
  maxHeight: 500,
  maxWidth: 500,
  format: 'PNG',
  quality: 100, // maximum: no compression
  rotation: 0,
  outputType: 'base64'
}

const FORM_INPUT = ['email', 'name', 'pronouns', 'twitter', 'city', 'company', 'bio']

// initializes state in the form:
// { wallet: '', email: '', consent: true }
const INITIAL_FORM_KEYS = ['wallet'].concat(FORM_INPUT)
const INITIAL_FORM_FIELDS_STATE = INITIAL_FORM_KEYS
  .reduce((acc, key) => Object.assign(acc, { [key]: '' }), {})
INITIAL_FORM_FIELDS_STATE.consent = true
INITIAL_FORM_FIELDS_STATE.avatar = null

const INITIAL_FORM_SUBMISSION_STATE = {
  formStatus: 'clean',
  errorMessage: null,
  consentToggleEnabled: INITIAL_FORM_FIELDS_STATE.consent
}

const INITIAL_STATE = { ...INITIAL_FORM_FIELDS_STATE, ...INITIAL_FORM_SUBMISSION_STATE }

const actions = {}

// initializes an actions object in the form:
// { bio: (state, value) => Object.assign({}, state, bio: value}) }
// each field's action updates the state with the given value
Object.keys(INITIAL_STATE)
  .concat(['consent', 'groupIds', 'members', 'memberId', 'profiles', 'profileId'])
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
    if (type === 'avatar') {
      onAvatarChange(dispatch, e)
      e.target.value = null // reset so onChange will fire even for same image
      return
    }
    const target = e.target
    const payload = target.type === 'checkbox' ? target.checked : target.value
    dispatch({ type, payload })
  } catch (error) {
    console.log(error)
  }
}

const onAvatarChange = (dispatch, e) => {
  if (e.target.files.length === 0) {
    return
  }

  const { maxHeight, maxWidth, format, quality, rotation, outputType } = AVATAR_CONFIG

  Resizer.imageFileResizer(
    e.target.files[0],
    maxWidth,
    maxHeight,
    format,
    quality,
    rotation,
    (uri) => {
      console.log(uri)
      dispatch({ type: 'avatar', payload: uri })
    },
    outputType
  )
}

const removeAvatar = (dispatch) => {
  dispatch({ type: 'avatar', payload: null })
}

const value = (state, type) => state[type]

const save = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: 'submitting' })
  dispatch({ type: 'errorMessage', payload: null })

  const keysToExclude = [
    'profiles',
    'members',
    'profileId',
    'wallet'
  ].concat(Object.keys(INITIAL_FORM_SUBMISSION_STATE))

  const { profiles, members, memberId, profileId } = state
  const data = Object.keys(state)
    .filter(key => !keysToExclude.includes(key))
    .reduce((acc, key) => Object.assign(acc, { [key]: state[key] }), {})
  console.log(data)

  try {
    if (profileId && memberId) {
      const patched = await profiles.patch(profileId, data)
      console.log('patched', patched)
      dispatch({ type: 'formStatus', payload: 'success' })
      return patched
    }

    const profile = await profiles.create(data)
    console.log('new', profile)
    dispatch({ type: 'profileId', payload: profile.id })

    const member = await members.patch(profile.data.memberId, { profileId: profile.id })
    console.log(member)
    dispatch({ type: 'formStatus', payload: 'success' })
    // dispatch({ type: 'created', payload: updated })
  } catch (error) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: error.message })
  }
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

const ProfileAlert = ({ formStatus, errorMessage }) => {
  switch (formStatus) {
    case 'submitting':
      return <Alert type='transparent'>Saving your changes...</Alert>
    case 'success':
      return <Alert type='success'>Your changes have been saved!</Alert>
    case 'error':
      return <Alert type='danger'>Something went wrong. {errorMessage}</Alert>
    default:
      return <Alert type='transparent' />
  }
}

const Profile = () => {
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
      const groupIds = user.groupIds
      dispatch({ type: 'groupIds', payload: groupIds.join(', ') })

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

  const changeConsentToggle = (enabled) => {
    dispatch({ type: 'consentToggleEnabled', payload: enabled })

    try {
      dispatch({ type: 'consent', payload: enabled })
    } catch (error) {
      console.log(error)
    }
  }

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
          <Input fieldName='memberId' editable={false} state={state} dispatch={dispatch} />
          <Input fieldName='groupIds' editable={false} state={state} dispatch={dispatch} />
          {FORM_INPUT.map((fieldName) => {
            return (
              <Input key={fieldName} fieldName={fieldName} state={state} dispatch={dispatch} />
            )
          })}
          <div className='mt-8 mb-2 w-min'>
            <label className='label block mb-1'>
              <span className='label-text text-gray-700 capitalize'>Avatar</span>
            </label>

            <div className='mb-2 text-sm text-gray-700'>
              Upload a JPEG or PNG. Recommended size is 500 x 500.
            </div>

            <div className={`my-8 grid place-items-center box-border rounded-full h-80 w-80
              ${state.avatar ? '' : 'border-dashed border-2 border-gray-400'}`}
            >
              {value(state, 'avatar')
                ? <img
                    src={value(state, 'avatar')} alt='avatar'
                    className='w-80 h-80 object-cover rounded-full'
                  />
                : <span className='text-gray-400'>add an image</span>}
            </div>

            <div className='my-4'>
              {state.avatar &&
                <div className='grid grid-cols-2 gap-x-2'>
                  <label
                    className='px-6 py-3 w-full bg-kernel-eggplant-mid text-white rounded text-center cursor-pointer'
                  >
                    <input
                      type='file' accept='image/png, image/jpeg'
                      className='hidden'
                      onChange={change.bind(null, dispatch, 'avatar')}
                    />
                    <span className='inline-block mt-0.5'>Change</span>
                  </label>
                  <button
                    className='px-6 py-3 w-full border-2 border-kernel-eggplant-mid text-kernel-eggplant-mid rounded'
                    onClick={removeAvatar.bind(null, dispatch)}
                  >
                    Remove
                  </button>
                </div>}
              {!state.avatar &&
                <div className='grid grid-cols-1'>
                  <label
                    className='px-6 py-3 w-full bg-kernel-eggplant-mid text-white rounded text-center cursor-pointer'
                  >
                    <input
                      type='file' accept='image/png, image/jpeg'
                      className='hidden'
                      onChange={change.bind(null, dispatch, 'avatar')}
                    />
                    <span className='inline-block mt-0.5'>Choose image</span>
                  </label>
                </div>}
            </div>
          </div>

          <hr className='my-12' />

          <div className='mt-8 mb-2'>
            <Switch.Group>
              <Switch
                checked={state.consentToggleEnabled}
                onChange={changeConsentToggle}
                className={`${state.consentToggleEnabled ? 'bg-kernel-green-dark' : 'bg-gray-200'
                  } relative inline-flex h-6 w-9 items-center rounded-full`}
              >
                <span
                  className={`transform transition ease-in-out duration-200 ${state.consentToggleEnabled ? 'translate-x-4' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white`}
                />
              </Switch>
              <Switch.Label passive className='ml-2 align-top'>Make my information available to others</Switch.Label>
            </Switch.Group>
          </div>
          <button
            disabled={state.formStatus === 'submitting'}
            onClick={save.bind(null, state, dispatch)}
            className={`mt-6 mb-4 px-6 py-4 ${state.formStatus === 'submitting' ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
          >
            Save
          </button>

          <ProfileAlert formStatus={state.formStatus} errorMessage={state.errorMessage} />

        </form>
      </div>
      <Footer />
    </div>
  )
}

export default Profile
