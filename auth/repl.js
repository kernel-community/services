//
// .load repl.js
//
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/jwt.js').then((e) => global.jwtService = e.default),
  import('./src/auth.js').then((e) => global.authService = e.default),
  import('./src/entity.js').then((e) => global.entityService = e.default)
]).then((e) =>
  entityService.build.bind(null, { host: 'http://localhost:3000' })
).then((entityClient) => {
  global.entityClient = entityClient
  return authService.build({
    entityClient,
    seed: jwtService.fromBase64Url(process.env.SEED)
  })
}).then((e) => {
  global.client = e
  global.members = entityClient({ entity: 'member', uri: 'members' })
})

