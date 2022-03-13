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

const DOT = '.'
const EXT = `${DOT}json`
const DELIMITER = '/'

const serialize = (obj) => JSON.stringify(obj)
const deserialize = (obj) => JSON.parse(obj)
const serializeObject = serialize
const deserializeObject = deserialize

const build = async ({ projectId, bucket, delimiter = DELIMITER,
  serialize = serializeObject, deserialize = deserializeObject }) => {
    const client = new Storage({ projectId }).bucket(bucket)

    const getFiles = (query = {}) => client.getFiles(
      Object.assign(query, { delimiter })).then(([files]) => files)
    const file = (path) => client.file(path)
    const save = (path, obj) => file(path).save(serialize(obj)).then(() => obj)
    const download = (path) => file(path).download().then((content) => deserialize(content))
    const remove = (path) => file(path).delete()
    const exists = (path) => file(path).exists().then(([ bool ]) => bool)
    const listObjects = ({ query = {} }) =>
      getFiles(query)
        .then((files) =>
          files
            .filter((e) => e.metadata.name.endsWith(EXT))
            .map((e) => e.metadata.name.split(DOT)[0])
        )
    const getObjects = ({ query = {}, reducer, init = {} } = {}) =>
      getFiles(query)
        .then((files) =>
          Promise.all(
            files
              .filter((e) => e.metadata.name.endsWith(EXT))
              .map((e) => download(e.metadata.name))
          )
        ).then((objs) => objs.reduce(reducer, init))
    return { getFiles, getObjects, listObjects, file, save, download, remove, exists }
}

const storage = { build }

export default storage
