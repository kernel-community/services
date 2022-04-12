//
// .load repl.js
//
'use strict'

Promise.all([
  import('./src/services/storage.js').then((e) => global.storageService = e.default),
  import('./src/services/resource.js').then((e) => global.resourceService = e.default),
  import('./src/services/entity.js').then((e) => global.entityService = e.default),
  import('./src/services/snowflake.js').then((e) => global.snowflakeService = e.default)
]).then((e) => {
  return storageService.build({
    projectId: 'kernel-services-staging',
    bucket: 'kernel-services-staging.appspot.com'
  })
}).then((e) => global.client = e )
