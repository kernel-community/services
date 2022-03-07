/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'
import {Storage} from '@google-cloud/storage'

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

const resourceObject = ({ resource, uri, readRoles, writeRoles, metaRoles }) => {
  return { resource, uri, readRoles, writeRoles, metaRoles }
}
const resourceFile = (resource) => `${resource}.json`
const serialize = (obj) => JSON.stringify(obj)
const deserialize = (obj) => JSON.parse(obj)

const getClient = ({ projectId }) => new Storage({ projectId })

const initResources = async ({ projectId, bucket }) => {
  const client = getClient({ projectId })
  const [files] = await client.bucket(bucket).getFiles({ delimiter: DELIMITER })
  return await Promise.all(
    files
      .filter((e) => e.metadata.name.endsWith('.json'))
      .map((e) => e.download().then((data) => deserialize(data)))
  ).then((resources) =>
    resources
      .reduce((acc, e) => {
        acc[e.resource] = e
        return acc
      }, {})
  )
}

// TODO: add pagination
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

// entities

const uuid = () => crypto.randomUUID()
const now = () => Date.now()

const entityUri = (uri, id) => `${uri}/${id}`
const entityFile = (uri) => `${uri}.json`
const entityObject = ({ id, owner, created, updated, kind, uri, data  }) => {
  return { id, owner, created, updated, kind, uri, data }
}

const createEntity = async ({ projectId, bucket }, { resource, uri }, owner, data) => {
  const id = uuid()
  const entity = entityObject({
    id: id, owner: owner, created: now(), updated: now(), kind: resource,
    uri: entityUri(uri, id), data: data
  })
  const client = getClient({ projectId })
  const file = client.bucket(bucket).file(entityFile(entity.uri))
  const content = serialize(entity)
  return file.save(content).then(() => content)
}

const getEntity = async ({ projectId, bucket }, { resource, uri }, id) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(entityFile(entityUri(uri, id)))
    return file.download().then((data) => deserialize(data))
}

export {
  uuid, MEMBER_RESOURCE,
  resourceObject, listResources, createResource, getResource,
  deleteResource, existsResource, initResources,
  createEntity, getEntity
}
