//
// .load repl.js
//
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/services/query.js').then((e) => global.queryService = e.default)
]).then((e) => {
  Promise.all([
    queryService.build({ seed: process.env.SEED, authMemberId: '1234' }).then((f) => global.queryClient = f)
  ])
})

