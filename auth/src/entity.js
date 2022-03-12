/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

import crypto from 'crypto'
import fetch from 'node-fetch'

const uuid = () => crypto.randomUUID()
const now = () => Date.now()

const build = ({ host, version = 'v1', base = 'resources' }, { entity, uri }) => {

  const fullUrl = (path) =>
    [host, version, base, uri, path].slice(0, path.length ? 5 : 4).join('/')

  const request = async ({ id = '', query = {}, method = 'GET', data = {} } = {}) => {
    const url = fullUrl(id) +
      '?' + Object.keys(query).map((k) => `${k}=${query[k]}`).join('&')
    let opts = { method }
    if (Object.keys(data).length) {
      Object.assign(opts, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
      })
    }
    console.log(url, opts)
    return fetch(url, opts)
      .then((e) => e.ok && !method.startsWith('HEAD') ?
        e.json() : { status: e.status, message: e.statusText })
  }

  const create = async (data, meta = {}) => request({ data, query: meta })

  const get = async (id) => request({ id })

  const exists = async (id) => request({ id, method: 'HEAD' })

  //TODO: add pagination support
  const getAll = async () => request({ query: {expand: true} }) 
  const list = async () => request() 

  const remove = async (id) => request({ method: 'DELETE', id })

  const update = async ({ id, data }) => request({ method: 'PUT', id, data }) 

  const updateMeta = async ({ id, data }) => request({ method: 'PATCH', id, data }) 

  return { fullUrl, request, create, exists, get, getAll, list, remove, update, updateMeta }

}

const entityService = {
  build
}

export default entityService
