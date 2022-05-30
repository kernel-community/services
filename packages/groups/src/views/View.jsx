/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useServices } from '@kernel/common'

import AppConfig from 'App.config'
import Page from 'components/Page'

const View = () => {
  const navigate = useNavigate()
  const { group } = useParams()

  const { services, currentUser } = useServices()
  const user = currentUser()

  useEffect(() => {
    if (!user || user.role > AppConfig.minRole) {
      return navigate('/')
    }
  }, [navigate, user])

  const [groupEntity, setGroupEntity] = useState()

  useEffect(() => {
    (async () => {
      const { entityFactory } = await services()
      const resource = 'group'
      const groups = await entityFactory({ resource })
      const entity = await groups.get(group)
      setGroupEntity(entity)
    })()
  }, [services, group])

  return (
    <Page>
      <div className='mb-24 px-0 lg:px-24 xl:px-48'>
        <div>
          {groupEntity &&
            <>
              <p><b>Name:</b> {groupEntity.data.name}</p>
              <p><b>Group Id:</b> {groupEntity.id}</p>
              <p><b>Member Ids:</b> {groupEntity.data.memberIds.join(', ')}</p>
            </>}
        </div>
      </div>
    </Page>
  )
}

export default View
