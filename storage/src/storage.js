/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import {Storage} from '@google-cloud/storage'

const DELIMITER = '/'
const ROLE_RESOURCE = {
  resource: 'role',
  uri: '/roles',
  readRoles: ['root'],
  writeRoles: ['root'],
  metaRoles: ['root']
}
const MEMBER_RESOURCE = {
  resource: 'member',
  uri: '/members',
  readRoles: ['root'],
  writeRoles: ['root'],
  metaRoles: ['root']
}

const resourceObject = ({ resource, uri, readRoles, writeRoles, metaRoles }) => {
  return { resource, uri, readRoles, writeRoles, metaRoles }
}
const resourceFile = (resource) => `${resource}.json`
const serialize = (obj) => JSON.stringify(obj)
const deserialize = (obj) => JSON.parse(obj)

const getClient = ({ projectId }) => new Storage({ projectId })

const listResources = async ({ projectId, bucket }) => {
  const client = getClient({ projectId })
  const [files] = await client.bucket(bucket).getFiles({ delimiter: DELIMITER })
  const resources = files
    .filter((e) => e.metadata.name.endsWith('.json'))
    .map((e) => e.metadata.name.split('.')[0])
  return resources 
}

const createResource = async ({ projectId, bucket, resource, uri, readRoles,
  writeRoles, metaRoles }) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(resourceFile(resource))
    const content = serialize(resourceObject({ resource, uri, readRoles,
      writeRoles, metaRoles }))
    return file.save(content).then(() => content)
}

const getResource = async ({ projectId, bucket, resource }) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(resourceFile(resource))
    return file.download().then((data) => deserialize(data))
}

const deleteResource = async ({ projectId, bucket, resource }) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(resourceFile(resource))
    await file.delete()
    return { resource }
}

const existsResource = async ({ projectId, bucket, resource }) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(resourceFile(resource))
    return file.exists().then(([ bool ]) => bool)
}

export {
  resourceObject, listResources, createResource, getResource,
  deleteResource, existsResource
}
