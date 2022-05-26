/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer, useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useServices, Alert } from '@kernel/common'

import * as runtime from 'react/jsx-runtime.js'
import { evaluate } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import emoji from 'remark-emoji'

import { MDXProvider, useMDXComponents } from '@mdx-js/react'

import { components } from 'constants.js'

const FORM_STATUSES = {
  clean: 'clean',
  submitting: 'submitting',
  success: 'success',
  error: 'error'
}

const URL_STATUSES = {
  clean: 'clean',
  blank: 'blank',
  invalidChars: 'invalidChars',
  taken: 'taken',
  valid: 'valid'
}

const INITIAL_STATE = {
  url: '',
  title: '',
  markdown: '',
  projects: null,
  formStatus: FORM_STATUSES.clean,
  errorMessage: null,
  urlPlaceholder: '',
  urlStatus: URL_STATUSES.clean,
}

const actions = {}
Object.keys(INITIAL_STATE).forEach(key => {
  actions[key] = (state, value) => Object.assign({}, state, { [key]: value })
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

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const change = (dispatch, type, e) => {
  dispatch({ type: 'formStatus', payload: FORM_STATUSES.clean })

  try {
    e.preventDefault()
    const payload = e.target.value
    dispatch({ type, payload })

    if (type === 'title') {
      setUrlPlaceholder(payload, dispatch)
    }

    if (type === 'url') {
      dispatch({ type: 'urlStatus', payload: URL_STATUSES.clean })
    }
  } catch (error) {
    console.log(error)
  }
}

const value = (state, type) => {
  return state[type]
}

const save = async (state, dispatch, mode, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: FORM_STATUSES.submitting })
  dispatch({ type: 'errorMessage', payload: null })

  const { projects, title, url, markdown } = state
  const data = { title, url, markdown }

  try {
    let saved
    if (mode === 'create') {
      saved = await projects.create(data, { id: data.url })
    } else if (mode === 'edit') {
      saved = await projects.update(url, data)
    }
    dispatch({ type: 'formStatus', payload: FORM_STATUSES.success })
    console.log(saved)
  } catch (error) {
    dispatch({ type: 'formStatus', payload: FORM_STATUSES.error })
    dispatch({ type: 'errorMessage', payload: error.message })
    console.log(error)
  }
}

// source: the internet
const toKebabCase = str =>
  str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .join('-')
      .toLowerCase()

const setUrl = async (state, dispatch) => {
  const title = value(state, 'title')
  const url = value(state, 'url')

  if (!url || url.length === 0) {
    const suggestedUrl = toKebabCase(title)
    dispatch({ type: 'urlStatus', payload: URL_STATUSES.clean })
    dispatch({ type: 'url', payload: suggestedUrl })
    await validateUrl(suggestedUrl, state, dispatch)
  }
}

const setUrlPlaceholder = (title, dispatch) => {
  const newUrlPlaceholder = toKebabCase(title)
  dispatch({ type: 'urlPlaceholder', payload: newUrlPlaceholder })
}

const onUrlBlur = (state, dispatch, e) => {
  e.preventDefault()

  const url = e.target.value

  validateUrl(url, state, dispatch)
}

const validateUrl = async (url, state, dispatch) => {
  if (url.length === 0) {
    dispatch({ type: 'urlStatus', payload: URL_STATUSES.blank })
    return
  }

  // allow lowercase letters, numbers, and dashes
  if (url.length > 0 && !url.match(/^[a-z0-9-]+$/)) {
    dispatch({ type: 'urlStatus', payload: URL_STATUSES.invalidChars })
    return
  }

  const allProjects = await state.projects.getAll()
  const allProjectIds = Object.values(allProjects).map(project => project.id)

  const urlStatus = allProjectIds.includes(url) ? URL_STATUSES.taken : URL_STATUSES.valid
  dispatch({ type: 'urlStatus', payload: urlStatus })
}

const UrlValidationMessage = ({ urlStatus, url }) => {
  switch (urlStatus) {
    case URL_STATUSES.blank:
      return <div className='mt-2 text-sm text-red-500'>This field is required.</div>
    case URL_STATUSES.invalidChars:
      return <div className='mt-2 text-sm text-red-500'>Use lowercase letters, numbers, or dashes only.</div>
    case URL_STATUSES.taken:
      return <div className='mt-2 text-sm text-red-500'>The handle `{url}` is already taken.</div>
    case URL_STATUSES.valid:
      return <div className='mt-2 text-sm text-green-600'>This handle is available!</div>
    default:
      return null
  }
}

const ProjectFormAlert = ({ formStatus, errorMessage, projectHandle }) => {
  switch (formStatus) {
    case FORM_STATUSES.submitting:
      return <Alert type='transparent'>Saving your changes...</Alert>
    case FORM_STATUSES.success:
      return (
        <Alert type='success'>
          Your changes have been saved!{' '}
          <Link to={`/view/${projectHandle}`}>View your adventure.</Link>
        </Alert>
      )
    case FORM_STATUSES.error:
      return <Alert type='danger'>Something went wrong. {errorMessage}</Alert>
    default:
      return null
  }
}

const ProjectForm = ({ mode, projectHandle }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const { services } = useServices()

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'project'
      const projects = await entityFactory({ resource })
      dispatch({ type: 'projects', payload: projects })

      if (mode === 'edit') {
        const projectEntity = await projects.get(projectHandle)
        setMarkdown(projectEntity.data.markdown)
        dispatch({ type: 'url', payload: projectEntity.data.url })
        dispatch({ type: 'title', payload: projectEntity.data.title })
        dispatch({ type: 'markdown', payload: projectEntity.data.markdown })
      }
    })()
  }, [services, projectHandle, mode])

  const [markdown, setMarkdown] = useState('')
  const [markdownError, setMarkdownError] = useState(null)
  const [mdxModule, setMdxModule] = useState()

  const Content = mdxModule ? mdxModule.default : Fragment

  useEffect(() => {
    (async () => {
      try {
        setMarkdownError(null)
        const code = await evaluate(markdown, {
          jsx: runtime.jsx,
          jsxs: runtime.jsxs,
          Fragment,
          useMDXComponents,
          outputFormat: 'function-body',
          remarkPlugins: [remarkGfm, remarkBreaks, emoji]
        })
        setMdxModule(code)
        dispatch({ type: 'markdown', payload: markdown })
      } catch (error) {
        console.log(error.message)
        setMarkdownError(error)
      }
    })()
  }, [markdown])

  return (
    <div className='grid grid-cols-2 mb-24 px-8'>
      <div className='px-8'>
        <form className='grid grid-cols-1 gap-6'>
          <label className='block'>
            <span className='text-gray-700'>Title</span>
            <input
              type='text' className={formClass}
              value={value(state, 'title')} onChange={change.bind(null, dispatch, 'title')}
              onBlur={setUrl.bind(null, state, dispatch)}
            />
          </label>
          <label className='block'>
            <span className='text-gray-700'>Handle</span>
            <br />
            <span className='text-gray-500 text-sm'>
              This determines the URL of your adventure page. You won't be able to change it later. You can use lowercase letters, numbers, and dashes.
            </span>
            <input
              type='text' className={`${formClass} ${mode === 'edit' ? 'bg-gray-300' : ''}`}
              placeholder={value(state, 'urlPlaceholder')}
              value={value(state, 'url')} onChange={change.bind(null, dispatch, 'url')}
              onBlur={onUrlBlur.bind(null, state, dispatch)}
              disabled={mode === 'edit'}
            />
            <UrlValidationMessage urlStatus={value(state, 'urlStatus')} url={value(state, 'url')} />
          </label>
          <label className='block'>
            <span className='text-gray-700'>Template</span>
            <select className={formClass}>
              <option>Adventure</option>
            </select>
          </label>
          <label className='block'>
            <span className='text-gray-700'>Markdown</span>
            <textarea
              rows='10' className={formClass} value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </label>
          <button
            disabled={state.formStatus === FORM_STATUSES.submitting}
            onClick={save.bind(null, state, dispatch, mode)}
            className={`mt-2 px-6 py-4 ${state.formStatus === FORM_STATUSES.submitting ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
          >
            Save
          </button>
        </form>
      </div>

      <div className='px-8 rounded-md border-gray-800 shadow-lg'>
        <MDXProvider components={components}>
          <Content />
        </MDXProvider>
      </div>

      <div className='my-4 px-8'>
        <ProjectFormAlert
          formStatus={state.formStatus} errorMessage={state.errorMessage}
          projectHandle={mode === 'create' ? value(state, 'url') : projectHandle}
        />
        {markdownError &&
          <label className='my-8 block'>
            <span className='text-gray-700'>Error</span>
            <div className={formClass}>
              {markdownError.message}
            </div>
          </label>}
      </div>
    </div>
  )
}

export default ProjectForm
