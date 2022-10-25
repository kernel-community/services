/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices, Navbar, Footer, Alert } from '@kernel/common'

import AppConfig from 'App.config'
import Intro from 'components/Intro'

const FORM_INPUT = {
  name: { label: 'Name', tip: 'What can we call you?', tag: 'input' },
  email: { label: 'Email', tip: 'So we can send you updates.', tag: 'input' },
  reason: { label: 'Reason', tip: 'Why do you want to be in Kernel?', tag: 'textarea' },
  interests: { label: 'Interests', tip: 'At Kernel, we learn through conversations organised by any fellow. What topics most inspire you to talk and listen? What are you really passionate about?', tag: 'textarea' },
  urls: { label: 'Links', tip: 'Please share any links which best represent you (can be a song you like, a project you work on, or anything else between).', tag: 'textarea' }
}

const INITIAL_FORM_KEYS = [].concat(Object.keys(FORM_INPUT))
const INITIAL_FORM_FIELDS_STATE = INITIAL_FORM_KEYS
  .reduce((acc, key) => Object.assign(acc, { [key]: '' }), {})

const INITIAL_FORM_SUBMISSION_STATE = {
  formStatus: 'clean',
  errorMessage: null,
  editable: true
}

const INITIAL_STATE = { ...INITIAL_FORM_FIELDS_STATE, ...INITIAL_FORM_SUBMISSION_STATE }

const actions = {}

const LOGICAL_STATE = ['referralId', 'member', 'members', 'memberId', 'applications', 'applicationId', 'taskService', 'editable']

Object.keys(INITIAL_STATE)
  .concat(LOGICAL_STATE)
  .forEach((key) => {
    actions[key] = (state, value) => Object.assign({}, state, { [key]: value })
  })

const reducer = (state, action) => {
  try {
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

const value = (state, type) => state[type]

const save = async (user, state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: 'saving' })
  dispatch({ type: 'errorMessage', payload: null })

  if (user.role < AppConfig.minRole) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: 'You are already a member.' })
    return
  }

  const { applications, member, members, memberId, applicationId } = state

  if (member.data.reviewId) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: 'You have already submitted your application.' })
    return
  }

  const keysToExclude = LOGICAL_STATE.concat(Object.keys(INITIAL_FORM_SUBMISSION_STATE))
  const data = Object.keys(state)
    .filter(key => !keysToExclude.includes(key))
    .reduce((acc, key) => Object.assign(acc, { [key]: state[key] }), {})

  try {
    if (applicationId) {
      const patched = await applications.patch(applicationId, data)
      dispatch({ type: 'formStatus', payload: 'saved' })
      return patched
    }

    const application = await applications.create(data)
    dispatch({ type: 'applicationId', payload: application.id })

    const member = await members.patch(memberId, { applicationId: application.id })
    dispatch({ type: 'member', payload: member })
    dispatch({ type: 'formStatus', payload: 'saved' })
  } catch (error) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: error.message })
  }
}

const submit = async (user, state, dispatch, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: 'submitting' })
  dispatch({ type: 'errorMessage', payload: null })

  if (user.role < AppConfig.minRole) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: 'You are already a member.' })
    return
  }

  const { taskService, member, applicationId } = state

  if (member.data.reviewId) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: 'You have already submitted an application.' })
    return
  }

  try {
    await taskService.submitApplication({ applicationId })
    dispatch({ type: 'editable', payload: false })
    dispatch({ type: 'formStatus', payload: 'success' })
  } catch (error) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: error.message })
  }
}

const Input = ({ fieldName, label, tip, tag, state, dispatch }) => {
  const disabled = !state.editable
  const bgColorClass = disabled ? 'bg-gray-200' : ''
  const InputField = tag

  return (
    <div className='mb-6'>
      <label className='label block mb-1'>
        <span className='label-text text-lg text-gray-700 capitalize'>{label}</span>
      </label>
      <p className='text-sm italic'>{tip || ''}</p>
      <InputField
        type='text' disabled={disabled} className={`border-1 rounded w-full ${bgColorClass}`}
        value={value(state, fieldName)} onChange={change.bind(null, dispatch, fieldName)}
      />
    </div>
  )
}

const PageAlert = ({ formStatus, errorMessage }) => {
  switch (formStatus) {
    case 'saving':
      return <Alert type='transparent'>Saving your changes...</Alert>
    case 'submitting':
      return <Alert type='transparent'>Submitting your application...</Alert>
    case 'saved':
      return <Alert type='success'>Your application has been saved! Feel free to leave and come back later before submitting.</Alert>
    case 'success':
      return <Alert type='success'>Your application has been submitted! We will reach out with information about next steps.</Alert>
    case 'error':
      return <Alert type='danger'>{errorMessage}</Alert>
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
    // already a member
    if (user.role < AppConfig.minRole) {
      dispatch({ type: 'formStatus', payload: 'error' })
      dispatch({ type: 'errorMessage', payload: 'You are already a member.' })
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      dispatch({ type: 'formStatus', payload: 'clean' })

      const memberId = user.iss
      dispatch({ type: 'memberId', payload: memberId })

      const { entityFactory, taskService } = await services()
      dispatch({ type: 'taskService', payload: taskService })

      const applications = await entityFactory({ resource: 'application' })
      dispatch({ type: 'applications', payload: applications })

      const members = await entityFactory({ resource: 'member' })
      dispatch({ type: 'members', payload: members })

      const member = await members.get(memberId)
      dispatch({ type: 'member', payload: member })

      const { data: { applicationId, reviewId } } = member
      if (reviewId) {
        dispatch({ type: 'editable', payload: false })
      }
      if (applicationId) {
        dispatch({ type: 'applicationId', payload: applicationId })
        const application = await applications.get(applicationId)
        const data = application.data
        Object.entries(data)
          .filter(([key, value]) => Object.keys(INITIAL_STATE).includes(key))
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
        <Intro />
        <form className='form-control w-full'>
          {Object.entries(FORM_INPUT).map(([fieldName, { label, tag, tip }]) => {
            return (
              <Input key={fieldName} fieldName={fieldName} label={label} tag={tag} tip={tip} state={state} dispatch={dispatch} />
            )
          })}
          <button
            disabled={state.formStatus === 'submitting' || !state.editable}
            onClick={save.bind(null, user, state, dispatch)}
            className={`mt-6 mb-4 px-6 py-4 ${state.formStatus === 'submitting' || !state.editable ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
          >
            Save
          </button>
          <button
            disabled={state.formStatus === 'submitting'}
            onClick={submit.bind(null, user, state, dispatch)}
            className={`mt-6 mb-4 px-6 py-4 ${state.formStatus === 'submitting' || !state.editable ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
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
