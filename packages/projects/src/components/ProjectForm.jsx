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

const INITIAL_STATE = {
  url: '',
  title: '',
  markdown: '',
  projects: null,
  formStatus: 'clean',
  errorMessage: null
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

const save = async (state, dispatch, mode, e) => {
  e.preventDefault()
  dispatch({ type: 'formStatus', payload: 'submitting' })
  dispatch({ type: 'errorMessage', payload: null })

  const { projects, title, url, markdown } = state
  const data = { title, url, markdown }

  try {
    let saved
    if (mode === 'create') {
      saved = await projects.create(data, { id: url })
    } else if (mode === 'edit') {
      saved = await projects.update(url, data)
    }
    dispatch({ type: 'formStatus', payload: 'success' })
    console.log(saved)
  } catch (error) {
    dispatch({ type: 'formStatus', payload: 'error' })
    dispatch({ type: 'errorMessage', payload: error.message })
    console.log(error)
  }
}

const ProjectFormAlert = ({ formStatus, errorMessage, projectHandle }) => {
  switch (formStatus) {
    case 'submitting':
      return <Alert type='transparent'>Saving your changes...</Alert>
    case 'success':
      return (
        <Alert type='success'>
          Your changes have been saved!{' '}
          <Link to={`/view/${projectHandle}`}>View your adventure.</Link>
        </Alert>
      )
    case 'error':
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
            />
          </label>
          <label className='block'>
            <span className='text-gray-700'>URL</span>
            <input
              type='text' className={formClass}
              value={value(state, 'url')} onChange={change.bind(null, dispatch, 'url')}
            />
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
            disabled={state.formStatus === 'submitting'}
            onClick={save.bind(null, state, dispatch, mode)}
            className={`mt-2 px-6 py-4 ${state.formStatus === 'submitting' ? 'bg-gray-300' : 'bg-kernel-green-dark'} text-kernel-white w-full rounded font-bold`}
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
