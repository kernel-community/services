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
  resourceObject, listResources, createResource, getResource,
  deleteResource, existsResource } from '../src/storage.js'

test('resource object', async (t) => {
  const resource = resourceObject({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com',
    resource: 'role',
    uri: '/roles',
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
