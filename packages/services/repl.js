
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('./src/services/secret.js').then((e) => global.secretService = e.default),
  import('../task/src/services/google.js').then((e) => global.googleService = e.default)
]).then((e) => {
  console.log('done')
  return (async () => {
    try {
      var secretClient = async (projectId) => secretService.build({ projectId })
      var projectId = 'kernel-services-staging'
      var client = await secretClient(projectId)
      var secret = await client.access({secretId: 'taskService'})
      var serviceAccount = JSON.parse(secret.payload.data.toString())
      global.service = await googleService.build({projectId, serviceAccount})
      global.secretClient = secretClient
      global.client = client
    } catch (error) {
      console.log(error)
    }
  })()
}).catch((e) => console.log(e))
