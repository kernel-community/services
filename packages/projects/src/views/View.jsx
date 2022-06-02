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

import AppConfig from 'App.config'
import { components } from 'constants.js'

import Page from 'components/Page'

const View = () => {
  const navigate = useNavigate()
  const { project: projectHandle } = useParams()

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
      const projectEntity = await projects.get(projectHandle)
      setProjectMeta(projectEntity)
      setMarkdown(projectEntity.data.markdown)
    })()
  }, [services, projectHandle])

  const [projectMeta, setProjectMeta] = useState()
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
    <Page projectHandle={projectHandle} projectMeta={projectMeta}>
      <div className='mb-24 px-0 lg:px-24 xl:px-48'>
        <MDXProvider components={components}>
          {markdownError || <Content />}
        </MDXProvider>
      </div>
    </Page>
  )
}

export default View
