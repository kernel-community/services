//
// .load repl.js
//
'use strict'

Promise.all([
  import('./src/storage.js').then((e) => global.storageService = e.default),
  import('./src/resource.js').then((e) => global.resourceService = e.default),
  import('./src/entity.js').then((e) => global.entityService = e.default)
]).then((e) => {
  global.client = storage.build({
    projectId: 'kernel-services',
    bucket: 'staging.kernel-community.appspot.com'
  })
})
