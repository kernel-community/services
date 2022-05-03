//
// .load repl.js
//
'use strict'

Promise.all([
  import('dotenv/config').then((e) => e),
  import('ethers').then(({ ethers }) => global.ethers = ethers),
  import('@google-cloud/tasks').then((e) => global.tasks = e),
  import('googleapis').then((e) => global.google = e.google),
  import('google-auth-library').then((e) => global.googleAuth = e),
  import('./src/services/task.js').then((e) => global.taskService = e.default),
  import('./src/services/taskQueue.js').then((e) => global.taskQueueService = e.default)
]).then((e) => {
  Promise.all([
    taskService.build({ projectId: 'kernel-services-staging' }).then((f) => global.taskClient = f),
    taskQueueService.build({ seed: process.env.SEED, authMemberId: '1234' }).then((f) => global.queueClient = f)
  ])
})

