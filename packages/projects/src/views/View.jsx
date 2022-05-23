/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

import * as runtime from 'react/jsx-runtime.js'
import { evaluate } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import emoji from 'remark-emoji'

import { MDXProvider, useMDXComponents } from '@mdx-js/react'
import { CodePen, Gist, Figma } from 'mdx-embed'

import AppConfig from 'App.config'

import Page from 'components/Page'

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

const View = () => {
  const navigate = useNavigate()
  const { project } = useParams()

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
      const projectEntity = await projects.get(project)
      setMarkdown(projectEntity.data.markdown)
    })()
  }, [services, project])

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
      } catch (error) {
        console.log(error.message)
        setMarkdownError(error)
      }
    })()
  }, [markdown])

  return (
    <Page projectHandle={project}>
      <div className='mb-24'>
        <MDXProvider components={components}>
          {markdownError || <Content />}
        </MDXProvider>
      </div>
    </Page>
  )
}

export default View
