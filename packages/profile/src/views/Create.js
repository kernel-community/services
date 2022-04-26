/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useReducer, useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '@kernel/common'

import * as runtime from 'react/jsx-runtime.js'
import { evaluate } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import emoji from 'remark-emoji'

import { MDXProvider, useMDXComponents } from '@mdx-js/react'
import { CodePen, Gist, Figma } from 'mdx-embed'

import AppConfig from 'App.config'
import NavBar from 'components/NavBar'

const INITIAL_STATE = { url: '', title: '', markdown: '' }

const actions = {
  url: (state, url) => Object.assign({}, state, { url }),
  title: (state, title) => Object.assign({}, state, { title }),
  markdown: (state, markdown) => Object.assign({}, state, { markdown }),
  projects: (state, projects) => Object.assign({}, state, { projects })
}

const reducer = (state, action) => {
  try {
    // console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw new Error('UnknownActionError', { cause: `Unhandled action: ${action.type}` })
  }
}

/* eslint-disable */
const components = {
  table: (props) => <table {...props} className="border-collapse table-auto w-full text-sm" />,
  th: (props) => <th {...props} className="border-b dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left" />,
  td: (props) => <td {...props} className="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />,
  h1: (props) => <h1 {...props} className="text-3xl" />,
  h2: (props) => <h2 {...props} className="text-xl" />,
  h3: (props) => <h3 {...props} className="text-lg" />,
  ul: (props) => <ul {...props} className="list-disc" />,
  ol: (props) => <ul {...props} className="list-decimal" />,
  CodePen, Gist, Figma
}
/* eslint-enable */

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

const create = async (state, dispatch, e) => {
  e.preventDefault()
  const { projects, title, url, markdown } = state
  const data = { title, url, markdown }
  const created = await projects.create(data, { id: url })
  // dispatch({ type: 'created', payload: updated })
  console.log(created)
}

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
      const { entityFactory } = await services()
      const resource = 'project'
      const projects = await entityFactory({ resource })
      dispatch({ type: 'projects', payload: projects })
    })()
  }, [services])

  const [markdown, setMarkdown] = useState()
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
    <div className='md:container md:mx-auto'>
      <NavBar />
      <div className='flex md:flex-row flex-wrap py-4 justify-center justify-between'>
        <div className='md:basis-1/2 px-8'>
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
                rows='10' className={formClass}
                onChange={(e) => setMarkdown(e.target.value)}
              />
            </label>
            <label className='block'>
              <button
                onClick={create.bind(null, state, dispatch)}
                className='w-full py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none'
              >
                Create
              </button>
            </label>
            {markdownError &&
              <label className='block'>
                <span className='text-gray-700'>Error</span>
                <div className={formClass}>
                  {markdownError.message}
                </div>
              </label>}
          </form>
        </div>
        <div className='md:basis-1/2 grow px-8 rounded-md border-gray-800 shadow-lg'>
          <MDXProvider components={components}>
            <Content />
          </MDXProvider>
        </div>
      </div>
    </div>
  )
}

export default Page
