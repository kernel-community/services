/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const EXT = '.json'
const DELIMITER = '/'
const ROLE_RESOURCE = {
  resource: 'role',
  uri: 'roles',
  readRoles: ['root'],
  writeRoles: ['root'],
  metaRoles: ['root']
}
const MEMBER_RESOURCE = {
  resource: 'member',
  uri: 'members',
  readRoles: ['root'],
  writeRoles: ['root'],
  metaRoles: ['root']
}

const build = async (client) => {
  const resourceObject = ({ resource, uri, readRoles, writeRoles, metaRoles }) => {
    return { resource, uri, readRoles, writeRoles, metaRoles }
  }
  const resourceFile = (resource) => `${resource}${EXT}`

  const init = async (client) => {
    return await client.getObjects({
      reducer: (acc, e) => {
        acc[e.resource] = e
        return acc
      }
    })
  }

  const list = async (client) => {
    return await client.listObjects()
  }

  const create = async (client, { resource, uri, readRoles,
    writeRoles, metaRoles }) => 
      client.save(resourceFile(resource),
        resourceObject({
          resource, uri, readRoles, writeRoles, metaRoles
        })
      )

  const get = async (client, resource) =>
    client.download(resourceFile(resource))

  const update = async (client, { resource, uri, readRoles,
    writeRoles, metaRoles }) => {
      const resourceObj = await get(client, resource)
      Object.assign(resourceObj, resourceObject({ readRoles, writeRoles, metaRoles }))
      return client.save(resourceFile(resource), resource)
  }

  const remove = async (client, resource) => {
      await client.remove(resourceFile(resource))
      return { resource }
  }

  const exists = async (client, resource) =>
    client.exists(resourceFile(resource))

  const resources = await init(client)
  return {
    init,
    list,
    create,
    get,
    update,
    remove,
    exists,
    resources: async () => resources
  }
}

const resource = { build }

export default resource
