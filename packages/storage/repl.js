//
// .load repl.js
//
'use strict'

Promise.all([
  import('./src/services/storage.js').then((e) => global.storageService = e.default),
  import('./src/services/resource.js').then((e) => global.resourceService = e.default),
  import('./src/services/entity.js').then((e) => global.entityService = e.default)
]).then((e) => {
  return storageService.build({
    projectId: 'kernel-services',
    bucket: 'staging.kernel-community.appspot.com'
  })
}).then((e) => global.client = e )
