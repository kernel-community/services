/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { test } from 'tap'
import {
  MEMBER_RESOURCE, uuid,
  resourceObject, listResources, createResource, getResource,
  deleteResource, existsResource, initResources, createEntity,
  getEntity } from '../src/storage.js'

test('resource object', async (t) => {
  const resource = resourceObject({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role',
    uri: 'roles',
    readRoles: ['root'],
    writeRoles: ['root'],
    metaRoles: ['root']
  })
  console.log('log', resource)
  t.ok(resource, 'resource')
})

test('list resources', async (t) => {
  const resources = await listResources({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com'
  })
  console.log(resources)
  t.ok(resources, 'resources')
})

test('create resource', async (t) => {
  const resource = await createResource({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role',
    uri: '/roles',
    readRoles: ['root'],
    writeRoles: ['root'],
    metaRoles: ['root']
  })
  const resource1 = await createResource({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'member',
    uri: '/members',
    readRoles: ['root'],
    writeRoles: ['root'],
    metaRoles: ['root']
  })
  console.log(resource)
  t.ok(resource, 'resource')
})

test('get resource', async (t) => {
  const resource = await getResource({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role'
  })
  console.log(resource)
  t.ok(resource, 'resource')
})

test('delete resource', async (t) => {
  const resource = await deleteResource({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role'
  })
  console.log(resource)
  t.ok(resource, 'resource')
})

test('exists resource', async (t) => {
  const resource = await existsResource({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role'
  })
  console.log(resource)
  t.ok(resource, 'resource')
})

test('init resources', async (t) => {
  const resources = await initResources({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com'
  })
  console.log(resources)
  t.ok(resources, 'resources')
})

test('createEntity', async (t) => {
  const resource = MEMBER_RESOURCE
  const entity = await createEntity({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
  }, resource, uuid(), { foo: 'bar' } )
  console.log(entity)
  t.ok(entity, 'entity')
})

test('getEntity', async (t) => {
  const resource = MEMBER_RESOURCE
  const entity = await getEntity({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
  }, resource, '1728489f-0656-4ba3-a66c-7b9828cce2ba')
  console.log(entity)
  t.ok(entity, 'entity')
})
