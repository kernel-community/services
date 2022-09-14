/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { Switch } from '@headlessui/react'
import { useServices, Navbar, Footer, Alert } from '@kernel/common'

import AppConfig from 'App.config'
import Intro from 'components/Intro'

const FORM_INPUT = ['email', 'name', 'pronouns', 'twitter', 'city', 'company', 'bio', 'project', 'urls', 'interests']

// initializes state in the form:
// { wallet: '', email: '', scholarship: true }
const INITIAL_FORM_KEYS = ['wallet'].concat(FORM_INPUT)
const INITIAL_FORM_FIELDS_STATE = INITIAL_FORM_KEYS
  .reduce((acc, key) => Object.assign(acc, { [key]: '' }), {})
INITIAL_FORM_FIELDS_STATE.scholarship = false

const INITIAL_FORM_SUBMISSION_STATE = {
  formStatus: 'clean',
  errorMessage: null,
  scholarshipToggleEnabled: INITIAL_FORM_FIELDS_STATE.scholarship
}

const INITIAL_STATE = { ...INITIAL_FORM_FIELDS_STATE, ...INITIAL_FORM_SUBMISSION_STATE }

const actions = {}

// initializes an actions object in the form:
// { bio: (state, value) => Object.assign({}, state, bio: value}) }
// each field's action updates the state with the given value
Object.keys(INITIAL_STATE)
  .concat(['scholarship', 'groupIds', 'referralId', 'members', 'memberId', 'applications', 'applicationId'])
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

const save = async (state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: 'submitting' })
  dispatch({ type: 'errorMessage', payload: null })

  const keysToExclude = [
    'applications',
    'members',
    'applicationId',
    'wallet'
  ].concat(Object.keys(INITIAL_FORM_SUBMISSION_STATE))

  const { applications, members, memberId, applicationId } = state
  const data = Object.keys(state)
    .filter(key => !keysToExclude.includes(key))
    .reduce((acc, key) => Object.assign(acc, { [key]: state[key] }), {})

  try {
    if (applicationId && memberId) {
      const patched = await applications.patch(applicationId, data)
      dispatch({ type: 'formStatus', payload: 'success' })
      return patched
    }

    const application = await applications.create(data)
    dispatch({ type: 'applicationId', payload: application.id })

    const member = await members.patch(application.data.memberId, { applicationId: application.id })
    console.log(member)
    dispatch({ type: 'formStatus', payload: 'success' })
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

const PageAlert = ({ formStatus, errorMessage }) => {
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

const Application = () => {
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

      const applications = await entityFactory({ resource: 'application' })
      dispatch({ type: 'applications', payload: applications })

      const members = await entityFactory({ resource: 'member' })
      dispatch({ type: 'members', payload: members })

      const member = await members.get(memberId)
      dispatch({ type: 'wallet', payload: member.data.wallet })

      const { data: { applicationId } } = member
      if (applicationId) {
        dispatch({ type: 'applicationId', payload: applicationId })
        const application = await applications.get(applicationId)
        console.log(application)
        // TODO: parse application into state
        const data = application.data
        Object.entries(data)
          .forEach(([key, value]) => dispatch({ type: key, payload: value }))
      }
    })()
  }, [services, user])

  const changeConsentToggle = (enabled) => {
    dispatch({ type: 'scholarshipToggleEnabled', payload: enabled })

    try {
      dispatch({ type: 'scholarship', payload: enabled })
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
        <Intro />
        <form className='form-control w-full'>
          <Input fieldName='wallet' editable={false} state={state} dispatch={dispatch} />
          <Input fieldName='memberId' editable={false} state={state} dispatch={dispatch} />
          <Input fieldName='referralId' editable={false} state={state} dispatch={dispatch} />
          {FORM_INPUT.map((fieldName) => {
            return (
              <Input key={fieldName} fieldName={fieldName} state={state} dispatch={dispatch} />
            )
          })}
          <div className='mt-8 mb-2'>
            <Switch.Group>
              <Switch
                checked={state.scholarshipToggleEnabled}
                onChange={changeConsentToggle}
                className={`${state.scholarshipToggleEnabled ? 'bg-kernel-green-dark' : 'bg-gray-200'
                  } relative inline-flex h-6 w-9 items-center rounded-full`}
              >
                <span
                  className={`transform transition ease-in-out duration-200 ${state.scholarshipToggleEnabled ? 'translate-x-4' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white`}
                />
              </Switch>
              <Switch.Label passive className='ml-2 align-top'>I represent a minority group and am looking for financial support</Switch.Label>
            </Switch.Group>
          </div>
          <button
            disabled={state.formStatus === 'submitting'}
            onClick={save.bind(null, state, dispatch)}
            className={`mt-6 mb-4 px-6 py-4 ${state.formStatus === 'submitting' ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
          >
            Submit
          </button>

          <PageAlert formStatus={state.formStatus} errorMessage={state.errorMessage} />

        </form>
      </div>
      <Footer />
    </div>
  )
}

export default Application
