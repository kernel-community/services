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
    const result = await entity.create(client, resource, { owner: entity.uuid() }, { foo: 'bar' } )
    console.log(result)
    t.ok(result, 'result')
  })

  test('get', async (t) => {
    const result = await entity.get(client, resource, '1728489f-0656-4ba3-a66c-7b9828cce2ba')
    console.log(result)
    t.ok(result, 'result')
  })

  test('list', async (t) => {
    const result = await entity.list(client, resource)
    console.log(result)
    t.ok(result, 'result')
  })

  test('update', async (t) => {
    const result = await entity.update(client, resource, '1728489f-0656-4ba3-a66c-7b9828cce2ba', {
      foo: 'baz', bar: 'bazzz'
    })
    console.log(result)
    t.ok(result, 'result')
  })

  test('updateMeta', async (t) => {
    const resource = MEMBER_RESOURCE
    const result = await entity.updateMeta(client,
      resource, '1728489f-0656-4ba3-a66c-7b9828cce2ba', {
      owner: 'owner'
    })
    console.log(result)
    t.ok(result, 'result')
  })
})
