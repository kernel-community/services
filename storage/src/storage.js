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
    const resource = resourceObject({ resource, uri, readRoles,
      writeRoles, metaRoles })
    const content = serialize(resource)
    return file.save(content).then(() => resource)
}

const getResource = async ({ projectId, bucket, resource }) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(resourceFile(resource))
    return file.download().then((data) => deserialize(data))
}

const updateResource = async ({ projectId, bucket, resource, uri, readRoles,
  writeRoles, metaRoles }) => {
    const client = getClient({ projectId })
    const resource = await getResource({ projectId, bucket, resource })
    Object.assign(resource, resourceObject({ readRoles, writeRoles, metaRoles }))
    const file = client.bucket(bucket).file(resourceFile(resource))
    const content = serialize(resource)
    return file.save(content).then(() => resource)
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

const entityUri = (uri, id) => `${uri}${DELIMITER}${id}`
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
  return file.save(content).then(() => entity)
}

const getEntity = async ({ projectId, bucket }, { resource, uri }, id) => {
    const client = getClient({ projectId })
    const file = client.bucket(bucket).file(entityFile(entityUri(uri, id)))
    return file.download().then((data) => deserialize(data))
}

//TODO: add pagination support
const listEntities = async ({ projectId, bucket }, { resource, uri }) => {
  const client = getClient({ projectId })
  const [files] = await client.bucket(bucket).getFiles({
    delimiter: DELIMITER, prefix: `${uri}${DELIMITER}`
  })
  const entities = files
    .filter((e) => e.metadata.name.endsWith('.json'))
    .map((e) => e.metadata.name.split('.')[0])
  return entities 
}

const deleteEntity = async ({ projectId, bucket }, { resource, uri }, id) => {
  const client = getClient({ projectId })
  const file = client.bucket(bucket).file(entityFile(entityUri(uri, id)))
  await file.delete()
  return { resource }
}

const existsEntity = async ({ projectId, bucket }, { resource, uri }, id) => {
  const client = getClient({ projectId })
  const file = client.bucket(bucket).file(entityFile(entityUri(uri, id)))
  return file.exists().then(([ bool ]) => bool)
}

const updateEntity = async ({ projectId, bucket }, { resource, uri }, id, data) => {
  const client = getClient({ projectId })
  const entity = await getEntity({ projectId, bucket }, { resource, uri }, id)
  Object.assign(entity.data, data)
  entity.updated = now()
  const file = client.bucket(bucket).file(entityFile(entity.uri))
  const content = serialize(entity)
  return file.save(content).then(() => entity)
}

const updateEntityMeta = async ({ projectId, bucket }, { resource, uri }, id, { owner }) => {
  const client = getClient({ projectId })
  const entity = await getEntity({ projectId, bucket }, { resource, uri }, id)
  Object.assign(entity, { owner })
  const file = client.bucket(bucket).file(entityFile(entity.uri))
  const content = serialize(entity)
  return file.save(content).then(() => entity)
}

export {
  uuid, MEMBER_RESOURCE,
  resourceObject, listResources, createResource, getResource,
  deleteResource, existsResource, initResources, updateResource,
  createEntity, getEntity, listEntities, deleteEntity, existsEntity, updateEntity,
  updateEntityMeta
}
