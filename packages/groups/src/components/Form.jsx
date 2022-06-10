/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'

const MODES = {
  create: 'create',
  update: 'update'
}

const NAME_STATUSES = {
  blank: 'blank',
  clean: 'clean',
  valid: 'valid'
}

const MEMBER_IDS_TEXT_STATUS = {
  blank: 'blank',
  clean: 'clean',
  invalidFormat: 'invalidFormat',
  valid: 'valid'
}

const FORM_STATUSES = {
  clean: 'clean',
  submitting: 'submitting',
  success: 'success',
  error: 'error',
  valid: 'valid'
}

const INITIAL_STATE = {
  name: '',
  memberIdsText: '',
  nameStatus: NAME_STATUSES.clean,
  memberIdsTextStatus: MEMBER_IDS_TEXT_STATUS.clean,
  group: '',
  groups: '',
  member: '',
  members: '',
  errorMessage: '',
  formStatus: FORM_STATUSES.clean,
  taskService: ''
}

const actions = {}
Object.keys(INITIAL_STATE)
  .forEach((k) => {
    actions[k] = (state, e) => Object.assign({}, state, { [k]: e })
  })

const reducer = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    const cause = `Unhandled action: ${action.type}`
    console.log(cause)
    throw new Error('UnknownActionError', { cause })
  }
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
  return state[type]
}

// dedupe, sort
const textToArray = (s) => [...new Set(s.split(',').map((e) => e.trim()))].sort()
const arrayToText = (arr) => arr.join(', ')
const setFormSubmitting = (dispatch) => {
  dispatch({ type: 'errorMessage', payload: '' })
  dispatch({ type: 'formStatus', payload: FORM_STATUSES.submitting })
}

const create = async (state, dispatch, e) => {
  e.preventDefault()
  setFormSubmitting(dispatch)

  const formIsValid = validateFields(state, dispatch)

  if (formIsValid) {
    const { groups, memberIdsText, name, taskService } = state
    const memberIds = textToArray(memberIdsText)

    try {
      const group = await groups.create({ name })
      const groupId = group.id
      await groups.updateMeta(groupId, { owner: groupId })
      await taskService.syncGroupMembers({ groupId, memberIds })
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.success })
    } catch (error) {
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.error })
      dispatch({ type: 'errorMessage', payload: error.message })
    }
  }
}

const update = async (state, dispatch, e) => {
  e.preventDefault()
  setFormSubmitting(dispatch)

  const formIsValid = validateFields(state, dispatch)

  if (formIsValid) {
    const { group, groups, memberIdsText, name, taskService } = state
    const groupId = group.id
    const memberIds = textToArray(memberIdsText)

    try {
      if (group.data.name !== name) {
        await groups.patch(groupId, { name })
      }
      await taskService.syncGroupMembers({ groupId, memberIds })
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.success })
    } catch (error) {
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.error })
      dispatch({ type: 'errorMessage', payload: error.message })
    }
  }
}

const onNameBlur = (state, dispatch, e) => {
  e.preventDefault()

  const name = e.target.value

  validateName(name, state, dispatch)
}

const onMemberIdsTextBlur = (state, dispatch, e) => {
  e.preventDefault()

  const memberIdsText = e.target.value

  validateMemberIdsText(memberIdsText, state, dispatch)
}

const validateName = (name, _state, dispatch) => {
  if (name.length === 0) {
    dispatch({ type: 'nameStatus', payload: NAME_STATUSES.blank })
    return false
  }

  dispatch({ type: 'nameStatus', payload: NAME_STATUSES.valid })
  return true
}

const validateMemberIdsText = async (memberIdsText, _state, dispatch) => {
  if (memberIdsText.length === 0) {
    dispatch({ type: 'memberIdsTextStatus', payload: MEMBER_IDS_TEXT_STATUS.blank })
    return false
  }

  if (memberIdsText.match(/[^\d, ]/)) {
    dispatch({ type: 'memberIdsTextStatus', payload: MEMBER_IDS_TEXT_STATUS.invalidFormat })
    return false
  }

  dispatch({ type: 'memberIdsTextStatus', payload: MEMBER_IDS_TEXT_STATUS.valid })
  return true
}

const validateFields = async (state, dispatch) => {
  const { name, memberIdsText } = state

  const nameIsValid = validateName(name, state, dispatch)
  const memberIdsTextIsValid = await validateMemberIdsText(memberIdsText, state, dispatch)
  const formIsValid = nameIsValid && memberIdsTextIsValid

  if (!formIsValid) {
    dispatch({ type: 'formStatus', payload: FORM_STATUSES.error })
    dispatch({ type: 'errorMessage', payload: 'Check for errors above.' })
  } else {
    dispatch({ type: 'formStatus', payload: FORM_STATUSES.valid })
    dispatch({ type: 'errorMessage', payload: '' })
  }

  return formIsValid
}

const ErrorMessage = ({ text }) => {
  return <div className='mt-2 text-sm text-red-500'>{text}</div>
}

const ValidationMessage = ({ fieldName, fieldStatus }) => {
  if (fieldName === 'name') {
    switch (fieldStatus) {
      case NAME_STATUSES.blank:
        return <ErrorMessage text='This field is required.' />
      default:
        return null
    }
  }

  if (fieldName === 'memberIdsText') {
    switch (fieldStatus) {
      case MEMBER_IDS_TEXT_STATUS.blank:
        return <ErrorMessage text='This field is required.' />
      case MEMBER_IDS_TEXT_STATUS.invalidFormat:
        return <ErrorMessage text='Group IDs must be numbers separated by commas' />
      default:
        return null
    }
  }
}

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
const submitButtonBaseClass = 'mt-6 mb-4 px-6 py-4 text-kernel-white bg-kernel-green-dark w-full rounded font-bold capitalize'
const submitButtonDisabledClass = `${submitButtonBaseClass} bg-kernel-green-light cursor-not-allowed`

const Form = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const navigate = useNavigate()

  global.state = state

  const { group } = useParams()
  const mode = group ? MODES.update : MODES.create

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  useEffect(() => {
    (async () => {
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.submitting })
      const { entityFactory, taskService } = await services()
      dispatch({ type: 'taskService', payload: taskService })
      const members = await entityFactory({ resource: 'member' })
      const member = await members.get(user.iss)
      const groups = await entityFactory({ resource: 'group' })
      dispatch({ type: 'members', payload: members })
      dispatch({ type: 'member', payload: member })
      dispatch({ type: 'groups', payload: groups })
      if (mode === MODES.update) {
        const entity = await groups.get(group)
        dispatch({ type: 'group', payload: entity })
        const data = entity.data
        Object.entries(data)
          .forEach(([k, v]) => {
            let type = k
            let payload = v
            // TODO: more ergonomic way to select group memebers
            if (k === 'memberIds') {
              type = 'memberIdsText'
              payload = arrayToText(v)
            }
            dispatch({ type, payload })
          })
      }
      dispatch({ type: 'formStatus', payload: FORM_STATUSES.clean })
    })()
  }, [services, user, mode, group])

  const handleOnClickSubmit = () => {
    if (mode === MODES.create) {
      create.bind(null, state, dispatch)
    } else {
      update.bind(null, state, dispatch)
    }
  }

  const isSubmitDisabled = state.formStatus === FORM_STATUSES.submitting

  return (
    <form className='grid grid-cols-1 gap-6'>
      <label className='block'>
        <span className='text-gray-700'>Name</span>
        <input
          type='text' className={formClass}
          value={value(state, 'name')}
          onChange={change.bind(null, dispatch, 'name')}
          onBlur={onNameBlur.bind(null, state, dispatch)}
        />
        <ValidationMessage
          fieldName='name'
          fieldStatus={value(state, 'nameStatus')}
          value={value(state, 'name')}
        />
      </label>
      <label className='block'>
        <span className='text-gray-700'>Member Ids (comma separated)</span>
        <input
          type='text' multiple className={formClass}
          value={value(state, 'memberIdsText')}
          onChange={change.bind(null, dispatch, 'memberIdsText')}
          onBlur={onMemberIdsTextBlur.bind(null, state, dispatch)}
        />
        <ValidationMessage
          fieldName='memberIdsText'
          fieldStatus={value(state, 'memberIdsTextStatus')}
          value={value(state, 'memberIdsText')}
        />
      </label>
      <label className='block'>
        <button
          disabled={isSubmitDisabled}
          onClick={handleOnClickSubmit}
          className={isSubmitDisabled ? submitButtonDisabledClass : submitButtonBaseClass}
        >
          {mode}
        </button>
      </label>
      {state && state.errorMessage &&
        <label className='block'>
          <span className='text-gray-700'>Error</span>
          <div className={formClass}>
            {state.errorMessage}
          </div>
        </label>}
    </form>
  )
}

export default Form
