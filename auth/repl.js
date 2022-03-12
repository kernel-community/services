//
// .load repl.js
//
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/jwt.js').then((e) => global.jwtService = e.default),
  import('./src/auth.js').then((e) => global.authService = e.default)
]).then((e) => 
  authService.build({
    seed: jwtService.fromBase64Url(process.env.SEED)
  })
).then((e) => global.client = e)

