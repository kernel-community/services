/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict'

const build = async ({ rpcClient }) => {
  const serviceName = 'taskService'
  const methodName = 'enqueueTask'
  const method = rpcClient.method.bind(null, serviceName)
  const call = (...args) => rpcClient.call({
    method: method(methodName),
    params: args
  })

  const sendEmail = async ({ to, subject, message }) => call('sendEmail', { to, subject, message })
  const emailMember = async ({ id, subject, template }) => call('emailMember', { id, subject, template })
  const emailMembers = async ({ subject, template }) => call('emailMembers', { subject, template })
  const followProject = async (projectId) => call('followProject', projectId)
  const syncGroupMembers = async ({ groupId, memberIds }) => call('syncGroupMembers', { groupId, memberIds })
  const voteProposal = async ({ proposalId, choice }) => call('voteProposal', { proposalId, choice })

  return { sendEmail, emailMember, emailMembers, followProject, syncGroupMembers, voteProposal }
}

const taskService = {
  build
}

export default taskService
