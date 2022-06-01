/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'

import Page from 'components/Page'
import ProjectForm from 'components/ProjectForm'

const Create = () => {
  const navigate = useNavigate()

  const { currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  return (
    <Page>
      <ProjectForm mode='create' />
    </Page>
  )
}

export default Create
