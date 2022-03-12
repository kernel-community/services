/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import { test } from 'tap'

import storage from '../src/storage.js'
import entity from '../src/entity.js'

const MEMBER_RESOURCE = {
  resource: 'member',
  uri: 'members',
  readRoles: ['root'],
  writeRoles: ['root'],
  metaRoles: ['root']
}

test('entity tests', async (t) => {

  const client = storage.build({
    projectId: 'kernel-community',
    bucket: 'staging.kernel-community.appspot.com'
  })

  const resource = MEMBER_RESOURCE

  test('create', async (t) => {
    const result = await entity.create(client, resource, { steward: entity.uuid() }, { foo: 'bar' } )
    console.log(result)
    t.ok(result, 'result')
  })

  test('get', async (t) => {
    const result = await entity.get(client, resource, '3d18e10a-7c65-41f4-9dd9-dbd469c45671')
    console.log(result)
    t.ok(result, 'result')
  })

  test('list', async (t) => {
    const result = await entity.list(client, resource)
    console.log(result)
    t.ok(result, 'result')
  })

  test('update', async (t) => {
    const result = await entity.update(client, resource, '3d18e10a-7c65-41f4-9dd9-dbd469c45671', {
      foo: 'baz', bar: 'bazzz'
    })
    console.log(result)
    t.ok(result, 'result')
  })

  test('updateMeta', async (t) => {
    const resource = MEMBER_RESOURCE
    const result = await entity.updateMeta(client,
      resource, '3d18e10a-7c65-41f4-9dd9-dbd469c45671', {
      steward: 'steward'
    })
    console.log(result)
    t.ok(result, 'result')
  })
})
