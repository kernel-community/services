
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/services/secret.js').then((e) => global.secretService = e.default)
]).then((e) => {
  global.secretClient = async (projectId) => secretService.build({ projectId })
})
